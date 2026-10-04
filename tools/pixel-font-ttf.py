# tools/pixel-font-ttf.py: turns the 5x7 bitmap font of tools/ui-pack.mjs into a TrueType file (CC0).
#   node tools/ui-pack.mjs                 (writes designs/O-023/font-glyphs.json)
#   python tools/pixel-font-ttf.py         (writes designs/O-023/ds-pixel-5x7.ttf; needs fontTools, optional: the TTF is committed)
# Each lit pixel is a 125 x 125 unit square, 1000 units per em, advance 750 (6 pixels), caps 875 high.
import json
import os
import sys

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(root, "designs", "O-023")
glyphs = json.load(open(os.path.join(out_dir, "font-glyphs.json"), encoding="utf-8"))

PX = 125
ADV = 750
order = [".notdef"] + [f"uni{ord(ch):04X}" for ch in sorted(glyphs, key=ord)]
cmap = {ord(ch): f"uni{ord(ch):04X}" for ch in glyphs}


def draw(rows):
    pen = TTGlyphPen(None)
    for r, line in enumerate(rows):
        x = 0
        while x < 5:
            if line[x] != "#":
                x += 1
                continue
            start = x
            while x < 5 and line[x] == "#":
                x += 1
            x0, x1 = start * PX, x * PX
            y1 = (6 - r) * PX + PX  # row r spans y0..y1; the baseline is the bottom of row 6
            y0 = (6 - r) * PX
            pen.moveTo((x0, y0))
            pen.lineTo((x0, y1))
            pen.lineTo((x1, y1))
            pen.lineTo((x1, y0))
            pen.closePath()
    return pen.glyph()


notdef_pen = TTGlyphPen(None)
for (a, b, c, d) in ((0, 0, 500, 875),):
    notdef_pen.moveTo((a + 125, b))
    notdef_pen.lineTo((a + 125, d))
    notdef_pen.lineTo((c, d))
    notdef_pen.lineTo((c, b))
    notdef_pen.closePath()
    notdef_pen.moveTo((a + 250, b + 125))
    notdef_pen.lineTo((c - 125, b + 125))
    notdef_pen.lineTo((c - 125, d - 125))
    notdef_pen.lineTo((a + 250, d - 125))
    notdef_pen.closePath()

glyph_map = {".notdef": notdef_pen.glyph()}
for ch, rows in glyphs.items():
    glyph_map[f"uni{ord(ch):04X}"] = draw(rows)

fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyph_map)
fb.setupHorizontalMetrics({g: (ADV, 0) for g in order})
fb.setupHorizontalHeader(ascent=875, descent=-125)
fb.setupNameTable({
    "familyName": "DS Pixel 5x7",
    "styleName": "Regular",
    "uniqueFontIdentifier": "DS Pixel 5x7 Regular 1.0",
    "fullName": "DS Pixel 5x7 Regular",
    "psName": "DSPixel5x7-Regular",
    "version": "Version 1.0",
    "copyright": "CC0 1.0 Universal: authored for design-studio, no third-party font data",
    "licenseDescription": "CC0 1.0 Universal. Use, change and ship it with a game without asking or crediting.",
})
fb.setupOS2(sTypoAscender=875, sTypoDescender=-125, sTypoLineGap=125, usWinAscent=875, usWinDescent=125, sxHeight=625, sCapHeight=875)
fb.setupPost(isFixedPitch=1)
out = os.path.join(out_dir, "ds-pixel-5x7.ttf")
fb.save(out)
print(f"TTF OK {out} {os.path.getsize(out)}B {len(glyphs)} glyphs")
