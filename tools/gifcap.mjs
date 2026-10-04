// tools/gifcap.mjs: real terminal-session GIFs for store demos (NEED-05, order O-025).
//
// The skillworks Fleet Vol 1 listing needs a 10-20 s screen-capture GIF under
// 8 MB: an agent session where `grep -n` on a text file fails with
// "not recognized", then the same task with the skill loaded via
// `Select-String`. Edge headless stills (tools/render.mjs) cannot record a
// terminal, and marketing-studio clip/screencap cut footage to 8 s / 3 MB for
// itch devlogs with ffmpeg -- wrong limits, wrong subject, other repo.
//
// So this tool runs the REAL pwsh session (spawnSync pwsh, fixture notes.txt
// in TEMP, verbatim exit codes + output), then renders the transcript as a
// terminal GIF with our own GIF89a encoder (LZW written here, no package) and
// the in-repo CC0 5x7 font (tools/ui-pack.mjs GLYPH_ROWS, authored here).
// No network, no npm install, ffmpeg not needed. Every render writes a
// sidecar <out>.json { source, command, real:true, transcript }.
//
//   node tools/gifcap.mjs --demo --out <file.gif>   run the real session, write GIF + sidecar
//   node tools/gifcap.mjs --verify <file.gif>       store gate: 10-20 s, under 8 MB, real sidecar
//   node tools/gifcap.mjs --check                   self-test (TEMP only, nothing lands in the repo)
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GLYPH_ROWS } from "./ui-pack.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Store gate (skillworks packs/fleet-vol-1/listing.md: demo line).
export const MIN_S = 10;
export const MAX_S = 20;
export const MAX_BYTES = 8 * 1024 * 1024;
export const MIN_BYTES = 20 * 1024;
export const WORD = "third";

// Demo GIF shape: 480x288 terminal, 30 frames x 50 cs = 15.0 s.
export const W = 480;
export const H = 288;
export const COLS = 40;
export const ROWS = 17; // content rows below the 16 px title bar
export const FRAMES = 30;
export const DELAY_CS = 50;

// Palette: 0 bg 1 fg 2 green 3 red 4 accent 5 muted 6 panel 7 white.
export const PALETTE = [
  [20, 22, 31], [244, 241, 232], [76, 195, 138], [229, 72, 77],
  [255, 179, 37], [168, 174, 194], [31, 35, 51], [255, 255, 255],
];
export const C_BG = 0;
export const C_FG = 1;
export const C_OK = 2;
export const C_ERR = 3;
export const C_ACC = 4;
export const C_MUT = 5;

// ---------- LZW (GIF variant, written here; round-trip proven in --check) ----------
export function lzwEncode(minCode, data) {
  const CLEAR = 1 << minCode;
  const EOI = CLEAR + 1;
  const codes = [];
  let width = minCode + 1;
  let dict = new Map();
  let next = EOI + 1;
  codes.push([CLEAR, width]);
  if (data.length === 0) {
    codes.push([EOI, width]);
    return packBits(codes);
  }
  let prefix = data[0];
  for (let i = 1; i < data.length; i++) {
    const k = data[i];
    const hit = dict.get(prefix * 256 + k);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    // Count-based growth: the table just took index next-1, so when next
    // reaches 2^width+1 every later code needs one more bit. The decoder
    // grows when its own table (one entry behind) hits 2^width -- the same
    // stream position, so both switch widths on the same code.
    codes.push([prefix, width]);
    if (next < 4096) {
      dict.set(prefix * 256 + k, next);
      next++;
      if (next === (1 << width) + 1 && width < 12) width++;
    } else {
      codes.push([CLEAR, width]); // dictionary full: clear at the live width
      dict = new Map();
      width = minCode + 1;
      next = EOI + 1;
    }
    prefix = k;
  }
  codes.push([prefix, width]);
  codes.push([EOI, width]);
  return packBits(codes);
}

export function packBits(codes) {
  const bytes = [];
  let acc = 0;
  let bits = 0;
  for (const [code, width] of codes) {
    acc |= code << bits;
    bits += width;
    while (bits >= 8) {
      bytes.push(acc & 255);
      acc >>>= 8;
      bits -= 8;
    }
  }
  if (bits > 0) bytes.push(acc & 255);
  return Buffer.from(bytes);
}

export function lzwDecode(minCode, buf, expectLen) {
  const CLEAR = 1 << minCode;
  const EOI = CLEAR + 1;
  const bytes = Buffer.from(buf);
  let pos = 0;
  let acc = 0;
  let bits = 0;
  const read = (width) => {
    while (bits < width) {
      if (pos >= bytes.length) throw new Error("LZW stream ends mid-code");
      acc |= bytes[pos++] << bits;
      bits += 8;
    }
    const v = acc & ((1 << width) - 1);
    acc >>>= width;
    bits -= width;
    return v;
  };
  let width = minCode + 1;
  let dict = [];
  const reset = () => {
    // Entries 0..CLEAR-1 are single pixels; CLEAR and EOI reserve their
    // indices so the first added string lands on EOI+1 like the encoder's.
    dict = [];
    for (let i = 0; i < CLEAR; i++) dict.push([i]);
    dict.push([]);
    dict.push([]);
    width = minCode + 1;
  };
  reset();
  const out = [];
  let prev = null;
  for (;;) {
    const code = read(width);
    if (code === CLEAR) {
      reset();
      prev = null;
      continue;
    }
    if (code === EOI) break;
    let entry;
    if (code < dict.length) {
      entry = dict[code];
    } else if (prev !== null && code === dict.length) {
      entry = [...prev, prev[0]];
    } else {
      throw new Error(`bad LZW code ${code} (dict ${dict.length})`);
    }
    for (const b of entry) {
      out.push(b);
      if (out.length === expectLen) return Uint8Array.from(out);
    }
    if (prev !== null && dict.length < 4096) {
      dict.push([...prev, entry[0]]);
      // Grow-when-full: the table just filled every code of this width, so
      // the next code arrives one bit wider -- same position as the encoder.
      if (dict.length >= (1 << width) && width < 12) width++;
    }
    prev = entry;
  }
  return Uint8Array.from(out);
}

// ---------- GIF89a encode + parse ----------
export function encodeGif(w, h, frames, delayCs) {
  const gct = Buffer.alloc(8 * 3);
  for (let i = 0; i < 8; i++) {
    gct[i * 3] = PALETTE[i][0];
    gct[i * 3 + 1] = PALETTE[i][1];
    gct[i * 3 + 2] = PALETTE[i][2];
  }
  const parts = [Buffer.from("GIF89a", "ascii")];
  const lsd = Buffer.alloc(7);
  lsd.writeUInt16LE(w, 0);
  lsd.writeUInt16LE(h, 2);
  lsd[4] = 0xf2; // GCT flag + 8-bit color + 8-entry table (size field 2)
  lsd[5] = 0;
  lsd[6] = 0;
  parts.push(lsd, gct);
  // NETSCAPE2.0 infinite loop (standard bytes, loops forever on store pages).
  parts.push(Buffer.from([0x21, 0xff, 0x0b, ...Buffer.from("NETSCAPE2.0", "ascii"), 0x03, 0x01, 0x00, 0x00, 0x00]));
  for (const px of frames) {
    if (px.length !== w * h) throw new Error(`frame has ${px.length} pixels, want ${w * h}`);
    const gce = Buffer.alloc(8);
    gce[0] = 0x21;
    gce[1] = 0xf9;
    gce[2] = 0x04;
    gce[3] = 0x04; // disposal: restore to background (each frame is full-screen)
    gce.writeUInt16LE(delayCs, 4);
    gce[6] = 0x00;
    gce[7] = 0x00;
    const desc = Buffer.alloc(10);
    desc[0] = 0x2c;
    desc.writeUInt16LE(0, 1);
    desc.writeUInt16LE(0, 3);
    desc.writeUInt16LE(w, 5);
    desc.writeUInt16LE(h, 7);
    desc[9] = 0x00; // no local table
    const data = lzwEncode(3, px);
    const subs = [Buffer.from([0x03])]; // LZW minimum code size
    for (let i = 0; i < data.length; i += 255) {
      subs.push(Buffer.from([Math.min(255, data.length - i)]));
      subs.push(data.subarray(i, i + 255));
    }
    subs.push(Buffer.from([0x00]));
    parts.push(gce, desc, Buffer.from([0x03]), ...subs.slice(1));
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

export function parseGif(buf) {
  const b = Buffer.from(buf);
  if (b.length < 13 || b.toString("ascii", 0, 6) !== "GIF89a") throw new Error("not a GIF89a file");
  const w = b.readUInt16LE(6);
  const h = b.readUInt16LE(8);
  const packed = b[10];
  let pos = 13;
  if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
  const delays = [];
  for (;;) {
    if (pos >= b.length) throw new Error("GIF ends before trailer");
    const sep = b[pos];
    if (sep === 0x3b) break;
    if (sep === 0x21) {
      const label = b[pos + 1];
      if (label === 0xf9 && pos + 7 < b.length) delays.push(b.readUInt16LE(pos + 4));
      pos += 2;
      for (;;) {
        const n = b[pos++];
        if (n === 0) break;
        pos += n;
        if (pos > b.length) throw new Error("GIF extension overruns the file");
      }
    } else if (sep === 0x2c) {
      const imgPacked = b[pos + 9];
      pos += 10;
      if (imgPacked & 0x80) pos += 3 * (1 << ((imgPacked & 0x07) + 1));
      pos += 1; // LZW minimum code size
      for (;;) {
        const n = b[pos++];
        if (n === 0) break;
        pos += n;
        if (pos > b.length) throw new Error("GIF image data overruns the file");
      }
    } else {
      throw new Error(`bad GIF block separator 0x${sep.toString(16)} at ${pos}`);
    }
  }
  return { w, h, frames: delays.length, delayCs: delays, durationCs: delays.reduce((a, x) => a + x, 0) };
}

// ---------- text ----------
// Anything the real session prints must survive the 5x7 font: printable
// ASCII passes, the few unicode strays PowerShell emits map to ASCII.
// PowerShell paints errors with ANSI CSI runs ($PSStyle). Those bytes are
// styling, not session text: strip them before anything else.
export function stripAnsi(s) {
  return String(s ?? "").replace(/\[[0-9;:?]*[a-zA-Z]/g, "").replace(//g, "");
}

const FALLBACK = new Map([["\u2014", "-"], ["\u2013", "-"], ["\u2018", "'"], ["\u2019", "'"], ["\u201c", '"'], ["\u201d", '"'], ["\u2026", "."], ["\u2500", "-"], ["\u2502", "|"], ["\u2713", "v"], ["\u2717", "x"], ["\t", "  "]]);
export function sanitize(s) {
  let out = "";
  for (const ch of stripAnsi(s)) {
    if (ch === "\n" || ch === "\r") {
      out += "\n";
      continue;
    }
    if (ch >= " " && ch <= "~") {
      out += ch;
      continue;
    }
    out += FALLBACK.get(ch) ?? "?";
  }
  return out.replace(/[^\n]{41,}/g, (m) => m); // wrapping happens per line below
}

export function wrapLine(line, cols) {
  const words = sanitize(line).split(" ");
  const rows = [];
  let cur = "";
  for (const wd of words) {
    if (wd.length > cols) {
      // One long token (a path): hard-cut it, never overflow the frame.
      if (cur) {
        rows.push(cur);
        cur = "";
      }
      for (let i = 0; i < wd.length; i += cols) rows.push(wd.slice(i, i + cols));
      continue;
    }
    const next = cur ? `${cur} ${wd}` : wd;
    if (next.length <= cols) cur = next;
    else {
      rows.push(cur);
      cur = wd;
    }
  }
  if (cur || rows.length === 0) rows.push(cur);
  return rows;
}

// Segments: [{ text, color }]. Returns cells [{ ch, color }] ROWS*COLS, space-filled.
export function buildCells(segments, cols = COLS, rows = ROWS) {
  const lines = [];
  for (const seg of segments) {
    for (const raw of sanitize(seg.text).split("\n")) {
      for (const w of wrapLine(raw, cols)) lines.push({ text: w, color: seg.color });
    }
  }
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const line = lines[r] ?? { text: "", color: C_FG };
    for (let c = 0; c < cols; c++) cells.push({ ch: line.text[c] ?? " ", color: line.color });
  }
  return { cells, overflow: Math.max(0, lines.length - rows) };
}

export function drawGlyph(px, w, ox, oy, ch, colorIdx) {
  const rows = GLYPH_ROWS[ch] ?? GLYPH_ROWS["?"];
  const [r, g, bl] = PALETTE[colorIdx];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 5; x++) {
      if (rows[y][x] !== "#") continue;
      for (let sy = 0; sy < 2; sy++) {
        for (let sx = 0; sx < 2; sx++) {
          const i = ((oy + y * 2 + sy) * w + (ox + x * 2 + sx)) * 4;
          px[i] = r;
          px[i + 1] = g;
          px[i + 2] = bl;
          px[i + 3] = 255;
        }
      }
    }
  }
}

export function renderFrame(cells, revealed, cursor) {
  const px = new Uint8Array(W * H * 4);
  const [br, bg, bb] = PALETTE[C_BG];
  for (let i = 0; i < W * H; i++) {
    px[i * 4] = br;
    px[i * 4 + 1] = bg;
    px[i * 4 + 2] = bb;
    px[i * 4 + 3] = 255;
  }
  // Title bar (16 px, panel + accent text).
  const [pr, pg, pb] = PALETTE[6];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      px[i] = pr;
      px[i + 1] = pg;
      px[i + 2] = pb;
    }
  }
  const title = "pwsh 7 - real session (gifcap)";
  for (let i = 0; i < title.length && i < COLS; i++) drawGlyph(px, W, 4 + i * 12, 1, title[i], C_ACC);
  for (let n = 0; n < revealed && n < cells.length; n++) {
    const col = n % COLS;
    const row = Math.floor(n / COLS);
    drawGlyph(px, W, 4 + col * 12, 20 + row * 16, cells[n].ch, cells[n].color);
  }
  if (cursor && revealed < cells.length) {
    const col = revealed % COLS;
    const row = Math.floor(revealed / COLS);
    const [r, g, bl] = PALETTE[7];
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 10; x++) {
        const i = ((20 + row * 16 + y) * W + (4 + col * 12 + x)) * 4;
        if (i + 3 < px.length) {
          px[i] = r;
          px[i + 1] = g;
          px[i + 2] = bl;
        }
      }
    }
  }
  // To indexed (palette is exact: match by RGB).
  const idx = new Uint8Array(W * H);
  const key = new Map(PALETTE.map((c, i) => [`${c[0]},${c[1]},${c[2]}`, i]));
  for (let i = 0; i < W * H; i++) {
    idx[i] = key.get(`${px[i * 4]},${px[i * 4 + 1]},${px[i * 4 + 2]}`) ?? 0;
  }
  return idx;
}

// Reveal plan: content frames show the transcript progressively, then holds.
export function planReveal(totalCells, frames = FRAMES, holds = 4) {
  const content = frames - holds;
  const per = Math.max(1, Math.ceil(totalCells / content));
  const plan = [];
  for (let f = 0; f < content; f++) plan.push({ revealed: Math.min(totalCells, (f + 1) * per), cursor: true });
  for (let f = 0; f < holds; f++) plan.push({ revealed: totalCells, cursor: f % 2 === 0 });
  return plan;
}

export function renderGif(segments, { frames = FRAMES, delayCs = DELAY_CS, holds = 4 } = {}) {
  const { cells, overflow } = buildCells(segments);
  if (overflow > 0) throw new Error(`transcript overflows the frame by ${overflow} line(s): shorten the lines`);
  const plan = planReveal(cells.length, frames, holds);
  const px = plan.map((p) => renderFrame(cells, p.revealed, p.cursor));
  return { gif: encodeGif(W, H, px, delayCs), frames: px.length, durationCs: px.length * delayCs };
}

// ---------- the real session ----------
const NOTES = ["fleet vol 1 notes", "the first skill fixes grep", "the second drives a real browser", "the third names every bevy call", "count the lines with measure"].join("\n") + "\n";

// The demo beat needs the stock-Windows resolution of the bare word `grep`
// ("not recognized"). This PC has Git's usr/bin on PATH, where a native
// grep.exe answers instead -- the skill calls that the "lies" case. So the
// session runs with a scoped PATH (System32 only): the commands, exit codes
// and output are real, and the sidecar discloses the scoping.
export function scopedPath() {
  const sys = process.env.SystemRoot ?? "C:\\Windows";
  return [`${sys}\\System32`, sys].join(";");
}

let _shell = null;
export function findShell() {
  if (_shell) return _shell;
  // Resolve with the parent PATH first: the session itself runs scoped.
  for (const exe of ["pwsh", "powershell"]) {
    try {
      const r = spawnSync("where.exe", [exe], { encoding: "utf8", timeout: 15000 });
      const line = String(r.stdout ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
      if (r.status === 0 && line && existsSync(line)) {
        _shell = line;
        return _shell;
      }
    } catch { /* try the next name */ }
  }
  for (const p of ["C:\\Program Files\\PowerShell\\7\\pwsh.exe", "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"]) {
    if (existsSync(p)) {
      _shell = p;
      return _shell;
    }
  }
  throw new Error("no PowerShell on PATH (tried pwsh, powershell)");
}

function pwsh(cmd, input) {
  const exe = findShell();
  const env = { ...process.env, PATH: scopedPath() };
  const r = spawnSync(exe, ["-NoProfile", "-NonInteractive", "-Command", cmd], { encoding: "utf8", timeout: 60000, input, env });
  if (r.error) throw new Error(`PowerShell did not start (${r.error.code ?? r.error.message})`);
  return { exe, stdout: String(r.stdout ?? ""), stderr: String(r.stderr ?? ""), status: r.status ?? 1 };
}

export function runSession(word = WORD) {
  const dir = mkdtempSync(join(tmpdir(), "gifcap-"));
  const notes = join(dir, "notes.txt");
  writeFileSync(notes, NOTES, "utf8");
  const grep = pwsh(`grep -n "${word}" "${notes}"`);
  // Drop blank lines (PowerShell pads errors with them) and keep the first
  // two real lines: the failure line plus its follow-up, never cut mid-word.
  const grepText = sanitize(`${grep.stdout}\n${grep.stderr}`)
    .split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join("\n").slice(0, 300);
  const select = pwsh(`(Select-String -Pattern "${word}" -Path "${notes}").Line`);
  const selectText = sanitize(select.stdout.trim()).split("\n").slice(0, 3).join("\n").slice(0, 240);
  return {
    dir,
    notes,
    word,
    grep: { exit: grep.status, text: grepText || "(no output)" },
    select: { exit: select.status, text: selectText || "(no output)" },
  };
}

export function sessionSegments(session) {
  const segs = [
    { text: "Fleet Vol 1: the pwsh skill, live", color: C_MUT },
    { text: `PS> grep -n ${session.word} notes.txt`, color: C_FG },
    { text: session.grep.text, color: C_ERR },
    { text: `PS> Select-String ${session.word} notes.txt`, color: C_FG },
    { text: session.select.text, color: C_OK },
    { text: "PASS: skill form found it, grep did not", color: C_ACC },
  ];
  return segs;
}

export function writeSidecar(out, session, info) {
  const sidecar = {
    tool: "gifcap",
    command: ["gifcap.mjs", "--demo", "--out", out],
    source: `real pwsh session on ${session.notes} (PATH scoped to ${scopedPath()}; Git usr/bin off so bare grep resolves as on stock Windows)`,
    out: resolve(out),
    real: true,
    word: session.word,
    transcript: {
      grep: { exit: session.grep.exit, text: session.grep.text },
      select: { exit: session.select.exit, text: session.select.text },
    },
    width: W,
    height: H,
    frames: info.frames,
    duration_s: +(info.durationCs / 100).toFixed(2),
    bytes: info.bytes,
    created: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  };
  writeFileSync(`${resolve(out)}.json`, `${JSON.stringify(sidecar, null, 2)}\n`, "utf8");
  return sidecar;
}

export function readSidecar(out) {
  const p = `${resolve(out)}.json`;
  if (!existsSync(p)) return { ok: false, reason: `no sidecar json at ${p}` };
  try {
    return { ok: true, sidecar: JSON.parse(readFileSync(p, "utf8")), path: p };
  } catch (e) {
    return { ok: false, reason: `sidecar json unreadable (${e.message})` };
  }
}

export function runDemo(out, word = WORD) {
  const session = runSession(word);
  if (session.grep.exit === 0 || !/not recognized/i.test(session.grep.text)) {
    throw new Error(`grep did not fail as the listing needs (exit ${session.grep.exit}): ${session.grep.text.slice(0, 120)}`);
  }
  if (session.select.exit !== 0 || !session.select.text.includes(word)) {
    throw new Error(`Select-String did not find "${word}" (exit ${session.select.exit}): ${session.select.text.slice(0, 120)}`);
  }
  const { gif, frames, durationCs } = renderGif(sessionSegments(session));
  if (gif.length > MAX_BYTES) throw new Error(`GIF is ${(gif.length / 1048576).toFixed(2)} MB, over the 8 MB store cap`);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), gif);
  const sidecar = writeSidecar(out, session, { frames, durationCs, bytes: gif.length });
  return { out, bytes: gif.length, frames, durationCs, sidecar };
}

export function verifyGif(file) {
  const lines = [];
  const abs = resolve(file);
  if (!existsSync(abs)) return { ok: false, lines: [`[FAIL] missing: ${file}`] };
  const st = statSync(abs);
  lines.push(`${st.size > MIN_BYTES && st.size < MAX_BYTES ? "[PASS]" : "[FAIL]"} size ${(st.size / 1024).toFixed(1)} KB (want over ${MIN_BYTES / 1024} KB, under ${MAX_BYTES / 1048576} MB)`);
  let info = null;
  try {
    info = parseGif(readFileSync(abs));
    const s = info.durationCs / 100;
    lines.push(`${s >= MIN_S && s <= MAX_S ? "[PASS]" : "[FAIL]"} duration ${s.toFixed(2)} s over ${info.frames} frames (want ${MIN_S}-${MAX_S} s)`);
    lines.push(`${info.w === W && info.h === H ? "[PASS]" : "[FAIL]"} frame ${info.w}x${info.h} (want ${W}x${H})`);
  } catch (e) {
    lines.push(`[FAIL] GIF parse: ${e.message}`);
  }
  const sc = readSidecar(abs);
  if (!sc.ok) {
    lines.push(`[FAIL] ${sc.reason}`);
  } else {
    const c = sc.sidecar;
    lines.push(`${c.source ? "[PASS]" : "[FAIL]"} sidecar has source (${String(c.source ?? "missing").slice(0, 60)})`);
    lines.push(`${c.command ? "[PASS]" : "[FAIL]"} sidecar has command`);
    lines.push(`${c.real === true ? "[PASS]" : "[FAIL]"} sidecar says real (only real sessions gate a listing)`);
    const t = c.transcript ?? {};
    lines.push(`${t.grep && t.grep.exit !== 0 && /not recognized/i.test(t.grep.text ?? "") ? "[PASS]" : "[FAIL]"} transcript: grep failed "not recognized"`);
    lines.push(`${t.select && t.select.exit === 0 && String(t.select.text ?? "").includes(c.word ?? WORD) ? "[PASS]" : "[FAIL]"} transcript: Select-String found "${c.word ?? WORD}"`);
  }
  const bad = lines.filter((l) => l.startsWith("[FAIL]")).length;
  return { ok: bad === 0, lines, bytes: st.size, info };
}

export function parseArgs(args) {
  let demo = false;
  let check = false;
  let out = null;
  let verify = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--demo") demo = true;
    else if (a === "--check") check = true;
    else if (a === "--out" && args[i + 1] != null) out = args[++i];
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
    else if (a === "--verify" && args[i + 1] != null) verify = args[++i];
    else if (a.startsWith("--verify=")) verify = a.slice("--verify=".length);
    else throw new Error(`unknown arg ${JSON.stringify(a)} (want --demo --out <gif> | --verify <gif> | --check)`);
  }
  return { demo, check, out, verify };
}

export function selfCheck() {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass: !!pass, detail: String(detail ?? "") });
  // LZW round-trips (flat, typed, pseudo-random: the shapes terminal frames take).
  try {
    const flat = new Uint8Array(1000).fill(1);
    ok("lzw round-trips flat runs", Buffer.from(lzwDecode(3, lzwEncode(3, flat), flat.length)).equals(Buffer.from(flat)), "1000 x 0x01");
    const typed = Uint8Array.from({ length: 500 }, (_, i) => i % 8);
    ok("lzw round-trips 3-bit cycling", Buffer.from(lzwDecode(3, lzwEncode(3, typed), typed.length)).equals(Buffer.from(typed)), "0..7 x 500");
    let seed = 12345;
    const rnd = Uint8Array.from({ length: 2000 }, () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % 8);
    ok("lzw round-trips noise", Buffer.from(lzwDecode(3, lzwEncode(3, rnd), rnd.length)).equals(Buffer.from(rnd)), "2000 pseudo-random nibbles");
    const big = Uint8Array.from({ length: 60000 }, (_, i) => (i * 7 + (i >> 5)) % 8);
    ok("lzw survives a dictionary clear past 4096 codes", Buffer.from(lzwDecode(3, lzwEncode(3, big), big.length)).equals(Buffer.from(big)), "60000 px forces CLEAR");
  } catch (e) {
    ok("lzw round-trips", false, String(e?.message ?? e));
  }
  // Tiny GIF encodes and parses back with the planned duration.
  try {
    const a = new Uint8Array(W * H).fill(0);
    const b = new Uint8Array(W * H).fill(1);
    const g = encodeGif(W, H, [a, b], 750);
    const p = parseGif(g);
    ok("gif round-trips dims+frames+duration", p.w === W && p.h === H && p.frames === 2 && p.durationCs === 1500, `${p.w}x${p.h}, ${p.frames} frames, ${p.durationCs / 100}s`);
    ok("gif stays small for flat frames", g.length < 100 * 1024, `${(g.length / 1024).toFixed(1)} KB for 2 flat frames`);
  } catch (e) {
    ok("gif round-trips dims+frames+duration", false, String(e?.message ?? e));
  }
  // The font covers every char the demo transcript can print.
  try {
    const probe = sessionSegments({ word: WORD, grep: { text: "grep : The term 'grep' is not recognized as a name" }, select: { text: `notes.txt:4:the ${WORD} names every bevy call` } });
    const { cells } = buildCells(probe);
    const missing = [...new Set(cells.map((c) => c.ch))].filter((ch) => !(GLYPH_ROWS[ch] ?? GLYPH_ROWS["?"]));
    ok("5x7 font covers the transcript", missing.length === 0, missing.length ? `missing: ${missing.join("")}` : `${cells.length} cells all printable`);
  } catch (e) {
    ok("5x7 font covers the transcript", false, String(e?.message ?? e));
  }
  // The reveal plan lands inside the 10-20 s gate by construction.
  try {
    const plan = planReveal(COLS * ROWS, FRAMES, 4);
    const s = (plan.length * DELAY_CS) / 100;
    ok("plan duration hits the store gate", plan.length === FRAMES && s >= MIN_S && s <= MAX_S, `${plan.length} frames x ${DELAY_CS}cs = ${s.toFixed(1)}s`);
  } catch (e) {
    ok("plan duration hits the store gate", false, String(e?.message ?? e));
  }
  // verify FAILs closed (missing file, no sidecar).
  try {
    const v = verifyGif(join(tmpdir(), `gifcap-absent-${Date.now()}.gif`));
    ok("verify FAILs closed on a missing file", !v.ok, "no crash, ok:false");
  } catch (e) {
    ok("verify FAILs closed on a missing file", false, String(e?.message ?? e));
  }
  // TEMP end-to-end from a canned transcript (no pwsh): render + sidecar + verify.
  try {
    const dir = mkdtempSync(join(tmpdir(), "gifcap-check-"));
    const segs = [
      { text: "Fleet Vol 1: the pwsh skill, live", color: C_MUT },
      { text: `PS> grep -n ${WORD} notes.txt`, color: C_FG },
      { text: "grep : The term 'grep' is not recognized as a name", color: C_ERR },
      { text: `PS> Select-String ${WORD} notes.txt`, color: C_FG },
      { text: `notes.txt:4:the ${WORD} names every bevy call`, color: C_OK },
      { text: "PASS: skill form found it, grep did not", color: C_ACC },
    ];
    const { gif, frames, durationCs } = renderGif(segs);
    const out = join(dir, "demo.gif");
    writeFileSync(out, gif);
    writeSidecar(out, { notes: join(dir, "notes.txt"), word: WORD, grep: { exit: 1, text: "grep : The term 'grep' is not recognized as a name" }, select: { exit: 0, text: `notes.txt:4:the ${WORD} names every bevy call` } }, { frames, durationCs, bytes: gif.length });
    const v = verifyGif(out);
    ok("end-to-end canned render verifies", v.ok, `${(gif.length / 1024).toFixed(1)} KB, ${(durationCs / 100).toFixed(1)}s, ${v.lines.filter((l) => l.startsWith("[PASS]")).length}/${v.lines.length} gates`);
  } catch (e) {
    ok("end-to-end canned render verifies", false, String(e?.message ?? e));
  }
  // Live probe: the real session the demo needs (skip-clean when pwsh is absent).
  try {
    const s = runSession();
    ok("live pwsh: grep fails, Select-String finds", s.grep.exit !== 0 && /not recognized/i.test(s.grep.text) && s.select.exit === 0 && s.select.text.includes(WORD), `grep exit ${s.grep.exit}, select exit ${s.select.exit}`);
  } catch (e) {
    ok("live pwsh: grep fails, Select-String finds", false, String(e?.message ?? e));
  }
  return { pass: results.every((r) => r.pass), results };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check")) {
    const { pass, results } = selfCheck();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "GIFCAP PASS: real-session GIF pipeline green" : `GIFCAP FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else if (args.includes("--verify")) {
    try {
      const { verify } = parseArgs(args);
      const r = verifyGif(verify);
      for (const l of r.lines) console.log(l);
      console.log(`GIFCAP ${r.ok ? "PASS" : "FAIL"}: verify ${verify} (${(r.bytes / 1048576).toFixed(2)} MB)`);
      if (!r.ok) process.exitCode = 1;
    } catch (e) {
      console.log(`GIFCAP FAIL: ${String(e?.message ?? e)}`);
      process.exitCode = 1;
    }
  } else {
    try {
      const { demo, out } = parseArgs(args);
      if (!demo) throw new Error("want --demo --out <file.gif> | --verify <file.gif> | --check");
      if (!out) throw new Error("--demo needs --out <file.gif>");
      const r = runDemo(out);
      console.log(`[PASS] demo ${r.out} (${(r.bytes / 1024).toFixed(1)} KB, ${(r.durationCs / 100).toFixed(1)} s, ${r.frames} frames) + ${r.out}.json`);
      console.log(`GIFCAP PASS: real pwsh session on disk as a ${(r.durationCs / 100).toFixed(0)} s GIF under 8 MB`);
    } catch (e) {
      console.log(`GIFCAP FAIL: ${String(e?.message ?? e)}`);
      process.exitCode = 1;
    }
  }
}
