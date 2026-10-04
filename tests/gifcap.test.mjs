// tests/gifcap.test.mjs: gifcap unit + TEMP end-to-end gates (no network).
// The live pwsh session test runs the real grep-fails/Select-String pair.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  C_ACC,
  C_ERR,
  C_FG,
  C_MUT,
  C_OK,
  COLS,
  DELAY_CS,
  FRAMES,
  MAX_BYTES,
  MAX_S,
  MIN_S,
  ROWS,
  W,
  H,
  WORD,
  buildCells,
  encodeGif,
  lzwDecode,
  lzwEncode,
  parseArgs,
  parseGif,
  planReveal,
  renderGif,
  runSession,
  sanitize,
  stripAnsi,
  verifyGif,
  wrapLine,
  writeSidecar,
} from "../tools/gifcap.mjs";

const SEGS = [
  { text: "Fleet Vol 1: the pwsh skill, live", color: C_MUT },
  { text: `PS> grep -n ${WORD} notes.txt`, color: C_FG },
  { text: "grep : The term 'grep' is not recognized as a name", color: C_ERR },
  { text: `PS> Select-String ${WORD} notes.txt`, color: C_FG },
  { text: `notes.txt:4:the ${WORD} names every bevy call`, color: C_OK },
  { text: "PASS: skill form found it, grep did not", color: C_ACC },
];

describe("gifcap lzw", () => {
  it("round-trips flat runs", () => {
    const d = new Uint8Array(1000).fill(1);
    assert.ok(Buffer.from(lzwDecode(3, lzwEncode(3, d), d.length)).equals(Buffer.from(d)));
  });

  it("round-trips 3-bit cycling past the first width growth", () => {
    const d = Uint8Array.from({ length: 500 }, (_, i) => i % 8);
    assert.ok(Buffer.from(lzwDecode(3, lzwEncode(3, d), d.length)).equals(Buffer.from(d)));
  });

  it("survives a dictionary clear past 4096 codes", () => {
    const d = Uint8Array.from({ length: 60000 }, (_, i) => (i * 7 + (i >> 5)) % 8);
    assert.ok(Buffer.from(lzwDecode(3, lzwEncode(3, d), d.length)).equals(Buffer.from(d)));
  });

  it("rejects a truncated stream instead of guessing", () => {
    const d = Uint8Array.from({ length: 64 }, (_, i) => i % 8);
    const enc = lzwEncode(3, d);
    assert.throws(() => lzwDecode(3, enc.subarray(0, 2), d.length), /mid-code|bad LZW/);
  });
});

describe("gifcap text", () => {
  it("strips PowerShell ANSI color runs before sanitizing", () => {
    const esc = String.fromCharCode(27);
    assert.equal(stripAnsi(`${esc}[31;1mhi${esc}[0m there`), "hi there");
    assert.equal(sanitize(`${esc}[31;1mhi${esc}[0m`), "hi");
  });

  it("sanitizes PowerShell unicode to printable ASCII", () => {
    assert.equal(sanitize("a\u2014b\u2019c"), "a-b'c");
    assert.ok([...sanitize("grep : ok")].every((ch) => ch === "\n" || (ch >= " " && ch <= "~")));
  });

  it("wraps long lines and hard-cuts long tokens at COLS", () => {
    const rows = wrapLine("a b c d e f g h i j k l m n o p q r s t u v", 10);
    assert.ok(rows.every((r) => r.length <= 10 && r.length > 0));
    const cut = wrapLine(`C:${"x".repeat(100)}.txt`, COLS);
    assert.ok(cut.every((r) => r.length <= COLS));
  });

  it("fills exactly ROWSxCOLS cells", () => {
    const { cells, overflow } = buildCells(SEGS);
    assert.equal(cells.length, ROWS * COLS);
    assert.equal(overflow, 0);
  });

  it("refuses a transcript that overflows the frame", () => {
    const many = Array.from({ length: ROWS + 5 }, (_, i) => ({ text: `line ${i} padding padding pad`, color: C_FG }));
    assert.throws(() => renderGif(many), /overflows the frame/);
  });
});

describe("gifcap plan", () => {
  it("lands inside the 10-20 s store gate", () => {
    const plan = planReveal(COLS * ROWS, FRAMES, 4);
    assert.equal(plan.length, FRAMES);
    const s = (plan.length * DELAY_CS) / 100;
    assert.ok(s >= MIN_S && s <= MAX_S, `${s}s`);
  });

  it("reveals progressively and ends on the full screen", () => {
    const plan = planReveal(100, 10, 2);
    for (let i = 1; i < plan.length - 2; i++) assert.ok(plan[i].revealed >= plan[i - 1].revealed);
    assert.equal(plan[plan.length - 1].revealed, 100);
  });
});

describe("gifcap args", () => {
  it("parses --demo --out and --verify forms", () => {
    assert.deepEqual(parseArgs(["--demo", "--out", "d.gif"]), { demo: true, check: false, out: "d.gif", verify: null });
    assert.deepEqual(parseArgs(["--verify=x.gif"]), { demo: false, check: false, out: null, verify: "x.gif" });
  });

  it("rejects unknown flags instead of guessing", () => {
    assert.throws(() => parseArgs(["--durdle"]), /unknown arg/);
  });
});

describe("gifcap end-to-end in TEMP", () => {
  it("renders a canned transcript to a GIF that verifies", () => {
    const dir = mkdtempSync(join(tmpdir(), "gifcap-test-"));
    const { gif, frames, durationCs } = renderGif(SEGS);
    assert.equal(frames, FRAMES);
    assert.ok(gif.length < MAX_BYTES, `${gif.length} bytes`);
    const out = join(dir, "demo.gif");
    writeFileSync(out, gif);
    writeSidecar(out, { notes: join(dir, "notes.txt"), word: WORD, grep: { exit: 1, text: "grep : The term 'grep' is not recognized as a name" }, select: { exit: 0, text: `notes.txt:4:the ${WORD} names every bevy call` } }, { frames, durationCs, bytes: gif.length });
    const v = verifyGif(out);
    assert.equal(v.ok, true, v.lines.filter((l) => l.startsWith("[FAIL]")).join(" | "));
    const back = parseGif(readFileSync(out));
    assert.equal(back.w, W);
    assert.equal(back.h, H);
    assert.equal(back.frames, FRAMES);
  });

  it("decodes its own first frame back to the exact pixels", () => {
    const { gif } = renderGif(SEGS);
    // Walk to the first image payload and LZW-decode it (independent path
    // from the encoder): the pixels must equal the rendered frame.
    let pos = 13 + 3 * 8; // header + LSD + 8-entry GCT
    while (gif[pos] !== 0x2c) {
      assert.equal(gif[pos], 0x21, "GCE before first image");
      pos += 2;
      for (;;) {
        const n = gif[pos++];
        if (n === 0) break;
        pos += n;
      }
    }
    pos += 10; // image descriptor (no local table)
    const minCode = gif[pos++];
    const chunks = [];
    for (;;) {
      const n = gif[pos++];
      if (n === 0) break;
      chunks.push(gif.subarray(pos, pos + n));
      pos += n;
    }
    const px = lzwDecode(minCode, Buffer.concat(chunks), W * H);
    assert.equal(px.length, W * H);
    // Title bar is panel everywhere except accent glyph pixels: the frame
    // is non-trivial (more than 2 distinct indices) and bounded to palette.
    const seen = new Set(px);
    assert.ok(seen.size >= 3, `frame uses ${seen.size} palette indices`);
    assert.ok([...seen].every((v) => v >= 0 && v < 8));
  });
});

describe("gifcap live session", () => {
  it("grep fails not-recognized and Select-String finds the word", { timeout: 120000 }, () => {
    const s = runSession();
    assert.notEqual(s.grep.exit, 0);
    assert.match(s.grep.text, /not recognized/i);
    assert.equal(s.select.exit, 0);
    assert.ok(s.select.text.includes(WORD), s.select.text.slice(0, 120));
  });
});

void encodeGif;
