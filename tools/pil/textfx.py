"""PIL text FX: stroke, shadow, gradient text, outline box. Own code."""
import argparse
import os
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont


def load_font(px):
    for p in ("C:/Windows/Fonts/arial.ttf",
              "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, px)
            except Exception:
                pass
    try:
        return ImageFont.truetype("DejaVuSans.ttf", px)
    except Exception:
        return ImageFont.load_default()


def blank(w=400, h=120, color=(24, 24, 32)):
    return Image.new("RGB", (w, h), color)


def stroke(img, text, xy=(20, 20), font=None, fill=(255, 255, 255),
           stroke_fill=(232, 69, 96), stroke_width=2):
    d = ImageDraw.Draw(img)
    d.text(xy, text, font=font or load_font(48), fill=fill,
           stroke_width=stroke_width, stroke_fill=stroke_fill)
    return img


def shadow(img, text, xy=(20, 20), font=None, fill=(255, 255, 255),
           shadow_fill=(0, 0, 0), offset=(4, 4)):
    d = ImageDraw.Draw(img)
    f = font or load_font(48)
    d.text((xy[0] + offset[0], xy[1] + offset[1]), text, font=f, fill=shadow_fill)
    d.text(xy, text, font=f, fill=fill)
    return img


def gradient_text(img, text, xy=(20, 20), font=None,
                  top=(255, 220, 120), bottom=(232, 69, 96)):
    f = font or load_font(48)
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).text(xy, text, font=f, fill=255)
    bbox = m.getbbox() or (xy[0], xy[1], xy[0] + 10, xy[1] + 10)
    grad = Image.new("RGB", img.size)
    px = grad.load()
    h = max(bbox[3] - bbox[1], 1)
    for y in range(bbox[1], bbox[3]):
        t = (y - bbox[1]) / max(h - 1, 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
        for x in range(bbox[0], bbox[2]):
            px[x, y] = c
    img.paste(grad, (0, 0), m)
    return img


def outline_box(img, box=(10, 10, 390, 110), fill=None,
                outline=(232, 69, 96), width=3):
    ImageDraw.Draw(img).rectangle(box, fill=fill, outline=outline, width=width)
    return img


def selftest(outdir=None):
    outdir = outdir or tempfile.gettempdir()
    font = load_font(48)
    jobs = [
        ("stroke", lambda i: stroke(i, "Stroke", font=font)),
        ("shadow", lambda i: shadow(i, "Shadow", font=font)),
        ("gradient-text", lambda i: gradient_text(i, "Gradient", font=font)),
        ("outline-box", lambda i: outline_box(stroke(i, "Boxed", font=font))),
    ]
    paths = []
    for name, fn in jobs:
        img = fn(blank())
        p = os.path.join(outdir, f"textfx-{name}.png")
        img.save(p)
        paths.append(p)
    ok = all(os.path.getsize(p) > 0 for p in paths)
    print(("PASS " if ok else "FAIL ") + " ".join(paths))
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--outdir", default=None)
    a = ap.parse_args()
    if a.selftest or not sys.argv[1:]:
        sys.exit(selftest(a.outdir))
    ap.error("only --selftest supported")


if __name__ == "__main__":
    main()
