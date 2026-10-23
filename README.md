# Game site

Static download page for the game. Hosted on Render (see `render.yaml`) — no build step.

**Release a new build:** from the game repo, `tools/build_all.sh` then `tools/publish.sh`.
That uploads both zips as pre-release `vX.Y.Z` (patch bumped each build, from `tools/version.txt`); the download buttons read the newest release through the GitHub API (asset names just need to contain `mac` / `win`).

**What's new:** the release body is the player notes `tools/publish.sh` builds from the game repo's `CHANGELOG.md` (an optional opening line, `### New / Improved / Fixed / Also` headings, `- ` bullets). `site.js` renders the latest release with notes in full and up to four earlier ones collapsed (five releases in all), from the same API call. Placeholder bodies ("Dev build …") are skipped.

Fonts: Bebas Neue and Barlow Condensed (SIL OFL, licences in `fonts/`).
