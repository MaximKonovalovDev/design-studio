"""Contact gallery: folder of PNGs -> thumbs.html grid."""
import argparse
import html
import os


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("out", nargs="?", default="thumbs.html")
    a = ap.parse_args()
    names = sorted(f for f in os.listdir(a.dir) if f.lower().endswith(".png"))
    outdir = os.path.dirname(os.path.abspath(a.out))
    cards = []
    for n in names:
        src = os.path.relpath(os.path.join(os.path.abspath(a.dir), n), outdir)
        cards.append(
            f'<figure><img src="{html.escape(src)}" loading="lazy">'
            f"<figcaption>{html.escape(n)}</figcaption></figure>"
        )
    body = "\n".join(cards) if cards else "<p>No PNGs.</p>"
    page = (
        "<!doctype html><meta charset=utf-8><title>contact sheet</title>"
        "<style>body{font-family:sans-serif;margin:16px}"
        "div{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}"
        "figure{margin:0;border:1px solid #ddd;padding:8px}"
        "img{width:100%;height:140px;object-fit:contain;background:#f5f5f5}"
        "figcaption{font-size:12px;word-break:break-all}</style>"
        f"<h1>{html.escape(os.path.basename(os.path.abspath(a.dir)))} ({len(names)})</h1>"
        f"<div>\n{body}\n</div>\n"
    )
    if os.path.dirname(a.out):
        os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"{a.out}: {len(names)} pngs")


if __name__ == "__main__":
    main()
