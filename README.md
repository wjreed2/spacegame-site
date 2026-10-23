# Game site

Static download page for the game. Hosted on Render (see `render.yaml`) — no build step.

**Release a new build:** from the game repo, `tools/build_all.sh` then `tools/publish.sh "what changed"`.
That uploads both zips as pre-release `build-N`; the download buttons read the newest release through the GitHub API (asset names just need to contain `mac` / `win`).

Fonts: Bebas Neue and Barlow Condensed (SIL OFL, licences in `fonts/`).
