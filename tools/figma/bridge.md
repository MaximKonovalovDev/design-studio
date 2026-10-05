# Figma bridge (plan, no key yet)

Credit: steal from `grab/cursor-talk-to-figma-mcp`.
That project shows how AI reads and writes Figma.

How it works:
1. A small Figma plugin runs inside Figma.
2. The plugin opens a socket to a local server.
3. The server exposes Figma actions as tools.
4. AI calls a tool, server sends a command, plugin runs it.

Read commands (AI looks at the file):
- get selection, get node tree, get styles.
- export node as image.
- read text, colors, sizes, positions.

Write commands (AI changes the file):
- create rectangle, ellipse, frame, text.
- set fill, stroke, corner radius.
- move, resize, rename, delete.
- apply auto-layout and components.

What we wire when the key lands:
- keep token in `secrets/` or env, never in git.
- add one `figma` MCP server in `opencode.jsonc`.
- keep `tools/figma.mjs --check` green.
- map Landing pages to templates, gate on SHIP verdict.

Read-only steps today (no key, no network):
- design in `templates/`, judge with `tools/judge.mjs`.
- export PNG with `tools/render.mjs`.
- paste into Figma by hand when needed.
- do not add fetch calls to `tools/figma.mjs`.
