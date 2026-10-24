// Download buttons read the latest GitHub release, so publishing a new build is just
// "create a release, attach the mac + windows zips". Asset names only need to contain
// "mac" / "win", so renaming the game doesn't break the links.
const REPO = "wjreed2/spacegame-site";
const RELEASES = `https://github.com/${REPO}/releases`;

// img/* is cached for a week (render.yaml): bump IMG_V when screenshots are replaced under the same names.
const IMG_V = 2;
const SHOTS = [
  ["combat", "A capital ship against a pirate Warlord"],
  ["dogfight", "A gunship in the thick of a pirate pack"],
  ["broadside", "Dreadnought and Warlord trading broadsides"],
  ["hangar", "The hangar builder"],
  ["flight", "In flight"],
  ["mining", "Mining an asteroid"],
  ["station", "Trading at a station"],
  ["command", "The command table"],
  ["map", "Sector map"],
  ["galaxy", "Galaxy map"],
  ["scanning", "Scanning a moon"],
  ["blackhole", "Arriving at a black hole"],
  ["outpost", "A Kestrel station"],
  ["hero", "Warlord-class ship"],
];

const $ = (id) => document.getElementById(id);

const isMobile = () => /iphone|ipad|android/.test(navigator.userAgent.toLowerCase());
const mb = (bytes) => `${Math.round(bytes / 1048576)} MB`;

// Two identical buttons, Windows then macOS, whatever the visitor is on. A platform missing from the newest
// release links to the releases page instead.
function setButtons(assets, label) {
  for (const key of ["win", "mac"]) {
    const a = assets[key];
    $(`dl-${key}`).href = a ? a.browser_download_url : RELEASES;
    $(`dl-${key}-sub`).textContent = a ? `Download · ${mb(a.size)}` : "Download";
  }
  if (label) $("build-tag").textContent = label;
  if (isMobile())
    $("dl-note").innerHTML = `Windows &amp; macOS only for now · <a href="#install">install notes</a>`;
}

// ---------- what's new ----------
// Release bodies come from the game repo's tools/publish.sh (CHANGELOG.md → tools/changelog.py notes): an optional
// opening line, "### New / Improved / Fixed / Also" headings and "- " bullets. Only that much markdown is rendered.
const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

function notesHTML(md) {
  let html = "", list = false;
  const close = () => { if (list) { html += "</ul>"; list = false; } };
  for (const raw of md.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { close(); continue; }
    const h = line.match(/^#{1,6}\s+(.*)$/), li = line.match(/^[-*]\s+(.*)$/);
    if (h) { close(); html += `<h4>${inline(h[1])}</h4>`; }
    else if (li) { if (!list) { html += "<ul>"; list = true; } html += `<li>${inline(li[1])}</li>`; }
    else { close(); html += `<p>${inline(line)}</p>`; }
  }
  close();
  return html;
}

// placeholder bodies from before the changelog ("Dev build v0.1.1.", "Dev build 2.") say nothing, so they're skipped
const hasNotes = (rel) => rel.body && !/^\s*dev build [^\n]*$/i.test(rel.body);
const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function renderNews(releases) {
  const withNotes = releases.filter((r) => !r.draft && hasNotes(r)).slice(0, 5);
  if (!withNotes.length) return;
  const [latest, ...earlier] = withNotes;
  const name = (r) => esc(r.name || r.tag_name);
  $("log-latest").innerHTML = `<article class="entry">
      <div class="entry-head"><span class="entry-ver">${name(latest)}</span>
        <span class="entry-date">${shortDate(latest.published_at)}</span>
        ${latest === releases.find((r) => !r.draft) ? '<span class="entry-tag">Latest</span>' : ""}</div>
      <div class="notes">${notesHTML(latest.body)}</div></article>`;
  for (const r of earlier) {
    const d = document.createElement("details");
    d.innerHTML = `<summary><span class="entry-ver">${name(r)}</span><span class="entry-date">${shortDate(r.published_at)}</span></summary>
      <div class="notes">${notesHTML(r.body)}</div>`;
    $("log-earlier").appendChild(d);
  }
  $("log-earlier").hidden = !earlier.length;
  $("news").hidden = false;
  $("dl-note").insertAdjacentHTML("beforeend", ` · <a href="#news">what's new</a>`);
}

async function loadRelease() {
  $("releases-link").href = RELEASES;
  setButtons({}, null);   // sensible links even if the API call fails or is rate-limited
  try {
    // newest release, pre-releases included (/releases/latest skips them, and dev builds are pre-releases)
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) return;
    const all = await r.json();
    const rel = all.find((x) => !x.draft && x.assets?.length);
    if (rel) {
      const assets = {};
      for (const a of rel.assets || []) {
        const n = a.name.toLowerCase();
        if (!n.endsWith(".zip") && !n.endsWith(".dmg")) continue;
        if (n.includes("mac") || n.includes("osx")) assets.mac = a;
        else if (n.includes("win")) assets.win = a;
      }
      setButtons(assets, `${rel.name || rel.tag_name} · ${shortDate(rel.published_at)}`);
    }
    renderNews(all);   // after setButtons, which rewrites the download note on phones
  } catch (_) { /* keep the fallback links */ }
}

function buildGallery() {
  const g = $("gallery"), box = $("lightbox"), big = $("lightbox-img");
  for (const [file, alt] of SHOTS) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `View: ${alt}`);
    b.innerHTML = `<img src="img/${file}.jpg?v=${IMG_V}" alt="${alt}" loading="lazy">`;
    b.onclick = () => { big.src = `img/${file}.jpg?v=${IMG_V}`; big.alt = alt; box.showModal(); };
    g.appendChild(b);
  }
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
}

$("year").textContent = new Date().getFullYear();
buildGallery();
loadRelease();
