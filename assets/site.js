/* assets/site.js
   JSON-driven GitHub Pages (no Jekyll, no build)
   - Expects JSON at data/profile.json with { about: {...}, projects: [...] }
   - Renders:
       - index.html   -> hero/about + projects grid (with search & tag filter)
       - about.html   -> full about section
       - project.html -> project detail (via ?id=...)
*/

(function () {
  const JSON_PATH = "data/portfolio.json";

  // ---- helpers ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const byId = (id) => document.getElementById(id);

  const setYear = () => {
    const y = byId("year");
    if (y) y.textContent = new Date().getFullYear();
  };

  const fmtDate = (str) => {
    if (!str) return "";
    // If the date is already a readable string (e.g., "14 September 2024"), just return it.
    // If it's ISO, make it nice.
    const maybeISO = /^\d{4}-\d{2}-\d{2}/.test(str);
    if (!maybeISO) return str;
    try {
      return new Date(str).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return str;
    }
  };

  const extLabel = (href) => {
    if (!href) return "";
    const lower = href.toLowerCase();
    if (lower.endsWith(".pdf")) return "View PDF";
    if (lower.endsWith(".html") || lower.endsWith(".htm")) return "View Report";
    if (lower.includes("github.com")) return "View Code";
    return "Open";
  };

  const safe = (s) => (s ?? "").toString();

  const uniqueSortedTags = (projects) => {
    const set = new Set();
    projects.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  };

  const matchesQuery = (p, q) => {
    if (!q) return true;
    const hay =
      safe(p.title) +
      " " +
      safe(p.author) +
      " " +
      safe(p.abstract).replace(/<[^>]+>/g, "") +
      " " +
      (p.tags || []).join(" ");
    return hay.toLowerCase().includes(q.toLowerCase());
  };

  const matchesTag = (p, tag) => {
    if (!tag) return true;
    return (p.tags || []).map((t) => t.toLowerCase()).includes(tag.toLowerCase());
  };

  // ---- data ----
  async function loadData() {
    const res = await fetch(JSON_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${JSON_PATH}`);
    return res.json();
  }

  // ---- render: About (for index.html hero and for about.html) ----
  function renderAbout(data) {
    if (!data?.about) return;

    const { name, title, bio, photo, email, location, social, skills } = data.about;

    // On index.html (hero-style)
    const heroName = byId("about-name");
    const heroTitle = byId("about-title");
    const heroBio = byId("about-bio");
    const heroPhoto = byId("about-photo");
    const heroSkills = byId("skills-inline");

    if (heroName) heroName.textContent = name || "";
    if (heroTitle) heroTitle.textContent = title || "";
    if (heroBio) heroBio.innerHTML = bio || "";
    if (heroPhoto && photo) {
      heroPhoto.src = photo;
      heroPhoto.alt = name ? `${name} photo` : "Profile photo";
    }
    if (heroSkills && Array.isArray(skills)) {
      heroSkills.innerHTML = skills.map((s) => `<span class="tag">${s}</span>`).join(" ");
    }

    // On about.html (full)
    const aboutName = byId("about-full-name");
    const aboutTitle = byId("about-full-title");
    const aboutBio = byId("about-full-bio");
    const aboutPhoto = byId("about-full-photo");
    const aboutSkills = byId("skills-list");
    const aboutEmail = byId("about-email");
    const aboutLoc = byId("about-location");
    const aboutLinks = byId("about-links");

    if (aboutName) aboutName.textContent = name || "";
    if (aboutTitle) aboutTitle.textContent = title || "";
    if (aboutBio) aboutBio.innerHTML = bio || "";
    if (aboutPhoto && photo) {
      aboutPhoto.src = photo;
      aboutPhoto.alt = name ? `${name} photo` : "Profile photo";
    }
    if (aboutSkills && Array.isArray(skills)) {
      aboutSkills.innerHTML = skills.map((s) => `<li>${s}</li>`).join("");
    }
    if (aboutEmail && email) aboutEmail.innerHTML = `<a href="mailto:${email}">${email}</a>`;
    if (aboutLoc && location) aboutLoc.textContent = location;

    if (aboutLinks && social) {
      const links = [];
      if (social.github) links.push(`<a href="${social.github}" target="_blank" rel="noopener">GitHub</a>`);
      if (social.linkedin) links.push(`<a href="${social.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`);
      aboutLinks.innerHTML = links.join(" · ");
    }
  }

  // ---- render: Projects list (index.html) ----
  function renderProjectsList(projects) {
    const grid = byId("projects-grid");
    if (!grid) return;

    const search = byId("search");
    const tagFilter = byId("tagFilter");
    const empty = byId("empty-state");

    // Populate tag dropdown
    if (tagFilter && tagFilter.options.length <= 1) {
      uniqueSortedTags(projects).forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        tagFilter.appendChild(opt);
      });
    }

    function cardHTML(p) {
      const thumb = p.thumbnail
        ? `<img class="thumb" src="${p.thumbnail}" alt="">`
        : `<div class="thumb">No image</div>`;
      const dateStr = p.date ? `<span>${fmtDate(p.date)}</span>` : "";
      const tags = (p.tags || []).map((t) => `<span class="tag">${t}</span>`).join(" ");
      const detailHref = `project.html?id=${encodeURIComponent(p.id)}`;

      // action buttons
      const reportBtn = p.file
        ? `<a href="${p.file}" target="_blank" rel="noopener">${extLabel(p.file)}</a>`
        : "";
      const codeBtn = p.code_url
        ? `<a href="${p.code_url}" target="_blank" rel="noopener">${extLabel(p.code_url)}</a>`
        : "";

      return `
        <article class="card">
          ${thumb}
          <div class="card-body">
            <h3><a href="${detailHref}">${safe(p.title)}</a></h3>
            <div class="meta">${dateStr}${p.author ? (dateStr ? " · " : "") + safe(p.author) : ""}</div>
            <p>${safe(p.abstract)}</p>
            <div class="tags">${tags}</div>
          </div>
          <div class="card-actions">${reportBtn} ${codeBtn}</div>
        </article>`;
    }

    function applyFilters() {
      const q = (search && search.value.trim()) || "";
      const t = (tagFilter && tagFilter.value) || "";
      const filtered = projects.filter((p) => matchesQuery(p, q) && matchesTag(p, t));
      grid.innerHTML = filtered.map(cardHTML).join("");
      if (empty) empty.classList.toggle("hidden", filtered.length > 0);
    }

    // initial render + listeners
    applyFilters();
    if (search) search.addEventListener("input", applyFilters);
    if (tagFilter) tagFilter.addEventListener("change", applyFilters);
  }

  // ---- render: Project detail (project.html) ----
  function renderProjectDetail(projects) {
    const container = byId("project");
    if (!container) return;

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const p = projects.find((x) => String(x.id) === String(id));

    if (!p) {
      container.innerHTML = `<p>Project not found.</p>`;
      return;
    }

    document.title = `${safe(p.title)} · ${safe((window.SITE_OWNER || "Portfolio"))}`;

    const tags = (p.tags || []).map((t) => `<span class="tag">${t}</span>`).join(" ");
    const dateStr = p.date ? fmtDate(p.date) : "";
    const actions = [
      p.file ? `<a href="${p.file}" target="_blank" rel="noopener">${extLabel(p.file)}</a>` : "",
      p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener">${extLabel(p.code_url)}</a>` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    const heroImg =
      p.hero || p.thumbnail
        ? `<img src="${p.hero || p.thumbnail}" alt="" style="border-radius:10px;border:1px solid var(--border);margin:8px 0 12px">`
        : "";

    container.innerHTML = `
      <h1>${safe(p.title)}</h1>
      <div class="meta">
        ${dateStr}
        ${p.author ? (dateStr ? " · " : "") + safe(p.author) : ""}
      </div>
      ${heroImg}
      ${p.abstract ? `<div class="prose">${p.abstract}</div>` : ""}
      <p>${actions}</p>
      <div class="tags">${tags}</div>
    `;
  }

  // ---- main init ----
  async function init() {
    setYear();

    let data;
    try {
      data = await loadData();
    } catch (e) {
      console.error(e);
      const grid = byId("projects-grid");
      if (grid) grid.innerHTML = `<p>Could not load ${JSON_PATH}. Ensure the path and filename are correct.</p>`;
      return;
    }

    renderAbout(data);
    if (Array.isArray(data.projects)) {
      renderProjectsList(data.projects);
      renderProjectDetail(data.projects);
    }
  }

  // Start
  init();
})();
