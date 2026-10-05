"""PIL backgrounds: gradient, noise grain, vignette, blur-bars. Own code."""
import argparse
import math
import os
import sys
import tempfile

from PIL import Image, ImageChops, ImageFilter, ImageOps


def parse_color(s):
    s = s.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6:
        raise ValueError(f"bad color {s!r}, want rrggbb")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def parse_size(s):
    w, h = s.lower().split("x")
    w, h = int(w), int(h)
    if w < 1 or h < 1:
        raise ValueError(f"bad size {s!r}")
    return (w, h)


def gradient(size, c1, c2, angle=0):
    """Two-color linear gradient. Angle deg: 0 = c1 left, 90 = c1 top."""
    w, h = size
    r = math.radians(angle)
    dx, dy = math.cos(r), math.sin(r)
    total = max(abs(dx) * w + abs(dy) * h, 1e-6)
    cx, cy = (w - 1) / 2, (h - 1) / 2
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        yw = (y - cy) * dy
        for x in range(w):
            t = ((x - cx) * dx + yw) / total + 0.5
            t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))
    return img


def add_grain(img, amount=12):
    """Monochrome gaussian grain, amount = std deviation 1..128."""
    sigma = max(1, min(128, int(amount)))
    n = Image.effect_noise(img.size, sigma).convert("RGB")
    hi = n.point(lambda v: v - 128 if v > 128 else 0)
    lo = n.point(lambda v: 128 - v if v < 128 else 0)
    base = img.convert("RGB")
    return ImageChops.subtract(ImageChops.add(base, hi), lo)


def vignette(img, strength=0.45):
    """Darken edges. Strength 0..1, 0 = no change."""
    strength = max(0.0, min(1.0, float(strength)))
    w, h = img.size
    m = Image.radial_gradient("L").resize((w, h))
    if m.getpixel((w // 2, h // 2)) < m.getpixel((0, 0)):
        m = ImageOps.invert(m)
    m = m.point(lambda v: round(255 - strength * (255 - v)))
    return ImageChops.multiply(img.convert("RGB"), m.convert("RGB"))


def blur_bars(src, size=(1080, 1920), blur=25, dim=0.55):
    """Fit any source into a 9:16 frame: blurred cover behind, sharp fit."""
    W, H = size
    src = src.convert("RGB")
    s = max(W / src.width, H / src.height)
    bg = src.resize((max(1, round(src.width * s)),
                     max(1, round(src.height * s))), Image.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2,
                  (bg.width + W) // 2, (bg.height + H) // 2))
    bg = bg.filter(ImageFilter.GaussianBlur(max(0, blur)))
    if dim < 1:
        bg = bg.point(lambda v: round(v * max(0.0, dim)))
    s2 = min(W / src.width, H / src.height)
    fg = src.resize((max(1, round(src.width * s2)),
                     max(1, round(src.height * s2))), Image.LANCZOS)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    return bg


def selftest(outdir=None):
    outdir = outdir or tempfile.gettempdir()
    c1, c2 = parse_color("#1b2a6b"), parse_color("#f2a541")
    g = gradient((360, 640), c1, c2, 135)
    jobs = [
        ("bg-gradient.png", g),
        ("bg-grain.png", add_grain(g, 12)),
        ("bg-vignette.png", vignette(g, 0.5)),
        ("bg-blurbars.png", blur_bars(
            gradient((640, 360), parse_color("#0ea5e9"),
                     parse_color("#7c3aed"), 25), (360, 640))),
    ]
    paths = []
    for name, img in jobs:
        p = os.path.join(outdir, name)
        img.save(p)
        paths.append(p)
    ok = all(os.path.getsize(p) > 0 for p in paths)
    print(("PASS " if ok else "FAIL ") + " ".join(paths))
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--outdir", default=None)
    ap.add_argument("--do", choices=("gradient", "grain", "vignette",
                                     "blur-bars"), default=None)
    ap.add_argument("--size", default="1080x1920")
    ap.add_argument("--c1", default="#1b2a6b")
    ap.add_argument("--c2", default="#f2a541")
    ap.add_argument("--angle", type=float, default=135)
    ap.add_argument("--in", dest="inp", default=None)
    ap.add_argument("--amount", type=float, default=12)
    ap.add_argument("--strength", type=float, default=0.45)
    ap.add_argument("--blur", type=float, default=25)
    ap.add_argument("--dim", type=float, default=0.55)
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    if a.selftest or (not sys.argv[1:] and a.do is None):
        sys.exit(selftest(a.outdir))
    if a.do == "gradient":
        img = gradient(parse_size(a.size), parse_color(a.c1),
                       parse_color(a.c2), a.angle)
    elif a.do in ("grain", "vignette", "blur-bars"):
        if not a.inp:
            ap.error("--in needed")
        src = Image.open(a.inp)
        if a.do == "grain":
            img = add_grain(src, a.amount)
        elif a.do == "vignette":
            img = vignette(src, a.strength)
        else:
            img = blur_bars(src, parse_size(a.size), a.blur, a.dim)
    else:
        ap.error("give --selftest or --do")
    out = a.out or os.path.join(tempfile.gettempdir(), f"bg-{a.do}.png")
    img.save(out)
    print(f"OK {out}")


if __name__ == "__main__":
    main()
