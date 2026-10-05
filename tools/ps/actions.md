# PS actions -> free stack

Steal from alisaitteke photoshop-mcp (118 tools). Top 20 only. Free stack = PIL + ffmpeg + in-repo tools. No Photoshop, no subscription.

| # | PS action | free how | file |
|---|---|---|---|
| 1 | Image Size / resize | PIL `Image.resize` LANCZOS, PNG via sharp | `tools/sharp.mjs` |
| 2 | Canvas Size / pad | PIL `ImageOps.expand` / `ImageOps.fit` | `tools/canvas.mjs` |
| 3 | Crop | PIL `crop(box)` / ffmpeg `crop=w:h:x:y` | `tools/compose.mjs` |
| 4 | Rotate / straighten | PIL `rotate(angle, expand=True, BICUBIC)` | `tools/compose.mjs` |
| 5 | Flip canvas | PIL `transpose(FLIP_LEFT_RIGHT / FLIP_TOP_BOTTOM)` | `tools/compose.mjs` |
| 6 | Remove background? | no pure PIL/ffmpeg; rembg (U2Net, OFL-safe) or Kaggle cutout lane; gap | — |
| 7 | Select subject / mask | no one-click free; closest: manual box mask + PIL `putalpha` | `tools/compose.mjs` |
| 8 | Brightness / Contrast | PIL `ImageEnhance.Brightness / Contrast` | `tools/cover.mjs` |
| 9 | Hue / Saturation | PIL `ImageEnhance.Color` / HSV shift via `convert("HSV")` | `tools/cover.mjs` |
| 10 | Levels / Curves | PIL `ImageOps.autocontrast` / numpy LUT point map | `tools/cover.mjs` |
| 11 | Color Balance / Photo Filter | PIL channel scale / color matrix multiply | `tools/tokens.mjs` |
| 12 | Black and White / desaturate | PIL `convert("L").convert("RGB")` | `tools/cover.mjs` |
| 13 | Gaussian Blur | PIL `ImageFilter.GaussianBlur` / ffmpeg `gblur` | `tools/compose.mjs` |
| 14 | Sharpen | PIL `ImageFilter.UnsharpMask` / ffmpeg `unsharp` | `tools/sharp.mjs` |
| 15 | Reduce Noise | PIL `MedianFilter` / ffmpeg `hqdn3d` | `tools/compose.mjs` |
| 16 | Type / text layer | PIL `ImageDraw.text` + OFL font from fonts shelf | `tools/fonts.mjs`, `tools/canvas.mjs` |
| 17 | Export PNG / JPEG | PIL `save` / sharp `png()/jpeg()`; thumb check at 256px | `tools/render.mjs`, `tools/thumb.mjs` |
| 18 | Export GIF / timeline | ffmpeg `palettegen + paletteuse` from PNG frames | `tools/gifcap.mjs` |
| 19 | Contact sheet / artboards | PIL montage grid / ffmpeg `tile`; atlas pack for game-ui | `tools/atlas.mjs` |
| 20 | Generative Fill | no free local equal; opt-in image lane only, never default | `tools/image.mjs` |
