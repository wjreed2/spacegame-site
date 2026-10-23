# Game site

Static download page for the game. Hosted on Render (see `render.yaml`) — no build step.

**Release a new build:** `gh release create build-N <path>/Untitled-mac.zip <path>/Untitled-windows.zip --repo wjreed2/spacegame-site --title "Dev build N"`.
The download buttons read the latest release through the GitHub API; asset names just need to contain `mac` / `win`.

Fonts: Bebas Neue and Barlow Condensed (SIL OFL, licences in `fonts/`).
