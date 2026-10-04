# UI/material formats (code-read, 2026-10-04)
1. engine2040 UI is pure data, no IO: `crates/ui/src/lib.rs` (`Hud` permille struct), `menus.rs` (`Menu`/`MenuItem`), `lobby_ui.rs`.
2. HUD text: `crates/ui/src/text.rs` hand-authored 3x5 monospace bitmap `Atlas` (placeholder, ASCII `0x20..=0x7E`) + `layout` cells + `emit_quads`; game draws the quads (`upload_mesh` shape ref).
3. UI picture format: self-authored bitmap atlas; no PNG loader for UI found -> loader file unknown.
4. UI data format: layout cells (origin top-left) + atlas UV rects `0..=1` + quad position arrays; palette sRGB `[u8;3]` triads, contrast gate 3.0.
5. engine2040 materials: `crates/assets/src/mesh_import.rs` reads glTF bufferView slices + `data:` URIs only; external file URIs fail the cook.
6. Material picture format: JPEG/PNG, max 2k POT with mips, REPEAT sampler; ORM PNG `(R=255,G=rough,B=metal)`; metallic cup reads B=0.9.
7. Material data format: glTF PBR (`baseColorTexture`/`normalTexture`/`metallicRoughnessTexture`, white `baseColorFactor`); digests in `content/arena/manifest.json`.
8. forge textures: `bridge/Media.cs` `TexExts` = png/jpg/jpeg/tga/dds/exr; import verb `Asset.Import` stages `src` -> `Content/*.png`.
9. forge HUD-specific loader (which file draws HUD sprites): unknown after code read.
10. Open question: which engine2040 renderer file consumes `emit_quads`, and which forge file owns HUD sprites -> next read before any atlas delivery.
