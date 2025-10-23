/* assets/site.js
   JSON-driven GitHub Pages (no Jekyll, no build)
   Expects JSON at data/profile.json with { about: {...}, projects: [...] }
*/
(function () {
  const JSON_PATH = "data/portfolio.json";

  const byId = (id) => document.getElementById(id);

  const setYear = () => {
    const y = byId("year");
    if (y) y.textContent = new Date().getFullYear();
  };

  const fmtDate = (str) => {
    if (!str) return "";
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
    const text = (safe(p.abstract)).replace(/<[^>]+>/g, "");
    const hay =
      safe(p.title) + " " +
      safe(p.author) + " " +
      text + " " +
      (p.tags || []).join(" ");
    return hay.toLowerCase().includes(q.toLowerCase());
  };

  const matchesTag = (p, tag) => {
    if (!tag) return true;
    return (p.tags || []).map((t) => t.toLowerCase()).includes(tag.toLowerCase());
  };

  async function loadData() {
    const res = await fetch(JSON_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${JSON_PATH}`);
    return res.json();
  }

  function renderAbout(data) {
    if (!data?.about) return;
    const { name, title, bio, photo, email, location, social } = data.about;

    const heroPhoto = byId("about-photo");
    const heroName = byId("about-name");
    const heroTitle = byId("about-title");
    const heroLoc = byId("about-location");
    const heroEmail = byId("about-email");
    const heroSocial = byId("about-social");
    const heroBio = byId("about-bio");
    if (heroName) heroName.textContent = name || "";
    if (heroTitle) heroTitle.textContent = title || "";
    if (heroLoc) heroLoc.textContent = location || "";
    if (heroBio) heroBio.innerHTML = bio || "";
    if (heroPhoto && photo){heroPhoto.src = photo; heroPhoto.alt = name ? `${name} photo` : "Profile photo";}
    if (heroEmail){heroEmail.innerHTML = email ? `<a href="mailto:${email}">${email}</a>` : "";}
    if (heroSocial){
      const items = [];

      if (social?.github){
        items.push(
          `<a class="icon-link" href="${social.github}" target="_blank" rel="noopener" aria-label="GitHub">
            <img src="imgs/github.svg" alt="GitHub" />
          </a>`
        );
      }

      if (social?.linkedin){
        items.push(
          `<a class="icon-link" href="${social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">
            <img src="imgs/linkedin.svg" alt="LinkedIn" />
          </a>`
        );
      }
    }
  }

  function renderProjectsList(projects) {
    const grid = byId("projects-grid");
    if (!grid) return;
    const search = byId("search");
    const tagFilter = byId("tagFilter");
    const empty = byId("empty-state");

    if (tagFilter && tagFilter.options.length <= 1) {
      uniqueSortedTags(projects).forEach((t)=>{
        const opt=document.createElement("option"); opt.value=t; opt.textContent=t; tagFilter.appendChild(opt);
      });
    }

    function cardHTML(p){
      const thumb = p.thumbnail ? `<img class="thumb" src="${p.thumbnail}" alt="">` : `<div class="thumb">No image</div>`;
      const dateStr = p.date ? `<span>${fmtDate(p.date)}</span>` : "";
      const tags = (p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(" ");
      const detail = `project.html?id=${encodeURIComponent(p.id)}`;
      const reportBtn = p.file ? `<a href="${p.file}" target="_blank" rel="noopener">${extLabel(p.file)}</a>` : "";
      const codeBtn = p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener">${extLabel(p.code_url)}</a>` : "";
      const descId = `desc-${String(p.id).replace(/[^a-z0-9-_]/gi,'')}`;
      return `
        <article class="card">
          ${thumb}
          <div class="card-body">
            <h3><a href="${detail}">${safe(p.title)}</a></h3>
            <div class="meta">${dateStr}${p.author ? (dateStr ? " · " : "") + safe(p.author) : ""}</div>
            <div class="tags">${tags}</div>
            <p class="desc" id="${descId}">${safe(p.abstract)}</p>
            <div class="fade" aria-hidden="true"></div>
            <div class="card-actions">
              ${reportBtn} ${codeBtn}
              <button class="read-more" data-target="${descId}" aria-controls="${descId}" aria-expanded="false">Read more</button>
            </div>
          </div>
        </article>`;
    }

    function applyFilters(){
      const q = (search && search.value.trim()) || "";
      const t = (tagFilter && tagFilter.value) || "";
      const filtered = projects.filter(p=>matchesQuery(p,q) && matchesTag(p,t));
      grid.innerHTML = filtered.map(cardHTML).join("");
      if (empty) empty.classList.toggle("hidden", filtered.length>0);
      setupClamps();
    }

    function setupClamps(){
      requestAnimationFrame(()=>{
        grid.querySelectorAll('.card').forEach(card=>{
          const desc = card.querySelector('.desc');
          const fade = card.querySelector('.fade');
          const btn  = card.querySelector('.read-more');
          if (!desc || !fade || !btn) return;
          const isOverflowing = desc.scrollHeight > desc.clientHeight + 2;
          fade.style.display = isOverflowing ? 'block' : 'none';
          btn.classList.toggle('hidden', !isOverflowing);
          btn.dataset.state = 'clamped';
        });
      });

      grid.addEventListener('click', (e)=>{
        const btn = e.target.closest('.read-more');
        if (!btn) return;
        const id = btn.getAttribute('data-target');
        const desc = document.getElementById(id);
        const fade = btn.closest('.card-body')?.querySelector('.fade');
        if (!desc || !fade) return;
        const expanding = btn.dataset.state !== 'expanded';
        if (expanding){
          desc.classList.add('expanded');
          fade.style.display = 'none';
          btn.textContent = 'Show less';
          btn.setAttribute('aria-expanded','true');
          btn.dataset.state = 'expanded';
        } else {
          desc.classList.remove('expanded');
          requestAnimationFrame(()=>{
            const isOverflowing = desc.scrollHeight > desc.clientHeight + 2;
            fade.style.display = isOverflowing ? 'block' : 'none';
          });
          btn.textContent = 'Read more';
          btn.setAttribute('aria-expanded','false');
          btn.dataset.state = 'clamped';
        }
      });
    }

    applyFilters();
    if (search) search.addEventListener('input', applyFilters);
    if (tagFilter) tagFilter.addEventListener('change', applyFilters);
  }

  function renderProjectDetail(projects){
    const container = byId("project");
    if (!container) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const p = projects.find(x => String(x.id) === String(id));
    if (!p){ container.innerHTML = `<p>Project not found.</p>`; return; }

    document.title = `${safe(p.title)} · ${safe((window.SITE_OWNER || "Portfolio"))}`;
    const tags = (p.tags || []).map(t=>`<span class="tag">${t}</span>`).join(" ");
    const dateStr = p.date ? fmtDate(p.date) : "";
    const actions = [
      p.file ? `<a href="${p.file}" target="_blank" rel="noopener">${extLabel(p.file)}</a>` : "",
      p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener">${extLabel(p.code_url)}</a>` : "",
    ].filter(Boolean).join(" · ");
    const heroImg = (p.hero || p.thumbnail) ? `<img src="${p.hero || p.thumbnail}" alt="" style="border-radius:10px;border:1px solid var(--border);margin:8px 0 12px">` : "";
    container.innerHTML = `
      <h1>${safe(p.title)}</h1>
      <div class="meta">${dateStr}${p.author ? (dateStr ? " · " : "") + safe(p.author) : ""}</div>
      ${heroImg}
      ${p.abstract ? `<div class="prose">${p.abstract}</div>` : ""}
      <p>${actions}</p>
      <div class="tags">${tags}</div>
    `;
  }

  async function init(){
    setYear();
    let data;
    try{
      data = await loadData();
    } catch(e){
      console.error(e);
      const grid = byId("projects-grid");
      if (grid) grid.innerHTML = `<p>Could not load ${JSON_PATH}. Ensure the path and filename are correct.</p>`;
      return;
    }
    renderAbout(data);
    if (Array.isArray(data.projects)){
      renderProjectsList(data.projects);
      renderProjectDetail(data.projects);
    }
  }
  init();
})();
