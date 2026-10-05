"""PIL social cards: bg color/gradient + title + sub + accent bar."""
import argparse
import os
import sys
from PIL import Image, ImageDraw, ImageFont

SIZES = {
    "yt-thumb": (1280, 720),
    "square": (1080, 1080),
    "story": (1080, 1920),
}


def hex_to_rgb(s):
    s = s.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def load_font(px, bold=True):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, px)
            except Exception:
                pass
    try:
        return ImageFont.truetype("DejaVuSans.ttf", px)
    except Exception:
        return ImageFont.load_default()


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textbbox((0, 0), t, font=font)[2] <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    if top == bottom:
        return img
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
        for x in range(w):
            px[x, y] = c
    return img


def make(title, sub, size, bg, bg2, accent, fg):
    w, h = SIZES[size]
    img = gradient(w, h, hex_to_rgb(bg), hex_to_rgb(bg2))
    d = ImageDraw.Draw(img)
    ac = hex_to_rgb(accent)
    fg_c = hex_to_rgb(fg)

    bar_h = max(8, h // 90)
    d.rectangle([0, 0, w, bar_h], fill=ac)  # accent bar (top strip)

    title_px = max(28, min(w // 12, h // 12))
    sub_px = max(16, title_px // 2 - 2)
    tf, sf = load_font(title_px), load_font(sub_px, bold=False)

    max_w = int(w * 0.84)
    tl = wrap(d, title, tf, max_w)
    sl = wrap(d, sub, sf, max_w) if sub else []

    th = sum(d.textbbox((0, 0), l, font=tf)[3] for l in tl)
    sh = sum(d.textbbox((0, 0), l, font=sf)[3] for l in sl)
    rule_w, rule_h, gap = min(220, w // 5), max(5, h // 160), title_px // 3
    total = th + (rule_h + gap * 2 if tl else 0) + sh + (gap if sl else 0)
    y = (h - total) // 2

    for l in tl:
        bb = d.textbbox((0, 0), l, font=tf)
        d.text(((w - (bb[2] - bb[0])) / 2 - bb[0], y), l, font=tf, fill=fg_c)
        y += bb[3] + 4
    if tl:
        y += gap
        d.rectangle([(w - rule_w) / 2, y, (w + rule_w) / 2, y + rule_h], fill=ac)
        y += rule_h + gap
    for l in sl:
        bb = d.textbbox((0, 0), l, font=sf)
        d.text(((w - (bb[2] - bb[0])) / 2 - bb[0], y), l, font=sf, fill=fg_c)
        y += bb[3] + 6
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("title")
    ap.add_argument("sub", nargs="?", default="")
    ap.add_argument("out")
    ap.add_argument("--size", default="yt-thumb", choices=sorted(SIZES))
    ap.add_argument("--bg", default="#1a1a2e")
    ap.add_argument("--bg2", default="#16213e")
    ap.add_argument("--accent", default="#e94560")
    ap.add_argument("--fg", default="#ffffff")
    a = ap.parse_args()
    img = make(a.title, a.sub, a.size, a.bg, a.bg2, a.accent, a.fg)
    if os.path.dirname(a.out):
        os.makedirs(os.path.dirname(a.out), exist_ok=True)
    img.save(a.out)
    print(f"{a.out}: {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
