"""PIL phone mockup: shot into a phone frame (rounded rect + notch bar) + shadow on bg.

  python tools/pil/mockup.py --shot <pic.png> --out <mockup.png> [--size WxH] [--bg #rrggbb]
  python tools/pil/mockup.py --selftest   (renders a synthetic shot to TEMP, checks the PNG)

Own code, PIL only. No browser, no network.
"""
import argparse
import os
import tempfile

from PIL import Image, ImageDraw, ImageFilter


def parse_size(raw, fallback=(1280, 720)):
    if raw is None:
        return fallback
    m = str(raw).lower().strip().split("x")
    if len(m) != 2:
        raise ValueError(f"bad --size {raw!r} (want WxH, e.g. 1280x720)")
    w, h = int(m[0]), int(m[1])
    if not (320 <= w <= 2560 and 320 <= h <= 2560):
        raise ValueError(f"bad --size {raw!r} (want WxH, 320..2560)")
    return (w, h)


def parse_bg(raw):
    s = str(raw).strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6:
        raise ValueError(f"bad --bg {raw!r} (want #rrggbb)")
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def cover(img, w, h):
    """Center-crop resize so the shot fills w*h with no stretch."""
    s = max(w / img.size[0], h / img.size[1])
    img = img.resize((max(1, round(img.size[0] * s)), max(1, round(img.size[1] * s))), Image.LANCZOS)
    x = (img.size[0] - w) // 2
    y = (img.size[1] - h) // 2
    return img.crop((x, y, x + w, y + h))


def round_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    return m


def make(shot_path, out_path, size=(1280, 720), bg=(16, 16, 22)):
    shot = Image.open(shot_path).convert("RGB")
    w, h = size
    base = Image.new("RGB", (w, h), bg)

    phone_h = int(h * 0.86)
    phone_w = int(phone_h * 0.52)
    frame_r = max(12, phone_w // 7)
    px0, py0 = (w - phone_w) // 2, (h - phone_h) // 2
    px1, py1 = px0 + phone_w, py0 + phone_h

    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [px0 + 8, py0 + 20, px1 + 8, py1 + 20], radius=frame_r + 6, fill=(0, 0, 0, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    base = Image.alpha_composite(base.convert("RGBA"), sh)

    frame = Image.new("RGBA", (phone_w, phone_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle([0, 0, phone_w - 1, phone_h - 1], radius=frame_r, fill=(12, 12, 16, 255))
    d.rounded_rectangle([0, 0, phone_w - 1, phone_h - 1], radius=frame_r, outline=(168, 168, 175, 255), width=3)

    bez, top, bot = 12, 42, 12
    sw, sh_h = phone_w - bez * 2, phone_h - top - bot
    screen = cover(shot, sw, sh_h)
    scr_r = max(8, frame_r - bez)
    frame.paste(screen, (bez, top), round_mask(sw, sh_h, scr_r))

    nw, nh = int(phone_w * 0.38), 18
    ImageDraw.Draw(frame).rounded_rectangle(
        [(phone_w - nw) // 2, 10, (phone_w + nw) // 2, 10 + nh],
        radius=nh // 2, fill=(12, 12, 16, 255))

    base.paste(frame, (px0, py0), frame)
    base = base.convert("RGB")
    if os.path.dirname(os.path.abspath(out_path)):
        os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    base.save(out_path)
    return out_path


def selftest():
    tmp = tempfile.mkdtemp(prefix="ds-mockup-")
    shot = os.path.join(tmp, "shot.png")
    out = os.path.join(tmp, "mockup.png")
    pic = Image.new("RGB", (600, 900), (38, 110, 190))
    d = ImageDraw.Draw(pic)
    d.rectangle([60, 120, 540, 340], fill=(240, 200, 90))
    d.rectangle([60, 400, 540, 780], fill=(22, 32, 54))
    pic.save(shot)
    make(shot, out, (800, 800), (20, 20, 30))
    got = Image.open(out)
    ok = got.size == (800, 800) and os.path.getsize(out) > 1024
    print(f"{'PNG TEMP PASS' if ok else 'SELFTEST FAIL'} {out} {got.size[0]}x{got.size[1]}")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--size", default="1280x720")
    ap.add_argument("--bg", default="#101016")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        raise SystemExit(0 if selftest() else 1)
    if not a.shot or not a.out:
        ap.error("--shot <pic> and --out <png> are required (or --selftest)")
    make(a.shot, a.out, parse_size(a.size), parse_bg(a.bg))
    print(f"{a.out}: {parse_size(a.size)[0]}x{parse_size(a.size)[1]}")


if __name__ == "__main__":
    main()
