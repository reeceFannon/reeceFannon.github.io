// Vanilla JS site that renders from /data/projects.json
// Works on GitHub Pages (no Jekyll).
// - index.html: renders grid + search/tag filter
// - project.html: renders one project by ?id=...

(function(){
  const byId = (id)=>document.getElementById(id);
  const grid = byId('projects-grid');
  const empty = byId('empty-state');
  const search = byId('search');
  const tagFilter = byId('tagFilter');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  async function load() {
    const res = await fetch('data/portfolio.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Failed to load data/projects.json');
    return res.json();
  }

  function fmtDate(iso){
    try { return new Date(iso).toLocaleDateString(undefined, {year:'numeric', month:'short'}); }
    catch { return iso; }
  }

  function matchQuery(p, q){
    if (!q) return true;
    const hay = (p.title + ' ' + (p.abstract||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function matchTag(p, tag){
    if (!tag) return true;
    return (p.tags||[]).map(t=>t.toLowerCase()).includes(tag.toLowerCase());
  }

  function cardHTML(p){
    const thumb = p.thumbnail ? `<img class="thumb" src="${p.thumbnail}" alt="">` : `<div class="thumb">No image</div>`;
    const date = p.date ? `<span>${fmtDate(p.date)}</span>` : '';
    const tags = (p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('');
    const detail = `project.html?id=${encodeURIComponent(p.id)}`;
    const pdf = p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">Report (PDF)</a>` : '';
    const code = p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener">Code</a>` : '';
    return `<article class="card">
      ${thumb}
      <div class="card-body">
        <h3><a href="${detail}">${p.title}</a></h3>
        <div class="meta">${date}</div>
        <p>${p.abstract||''}</p>
        <div class="tags">${tags}</div>
      </div>
      <div class="card-actions">${pdf} ${code}</div>
    </article>`;
  }

  function renderList(projects){
    if (!grid) return;
    const q = (search && search.value || '').trim();
    const t = (tagFilter && tagFilter.value || '').trim();

    const filtered = projects.filter(p => matchQuery(p, q) && matchTag(p, t));
    grid.innerHTML = filtered.map(cardHTML).join('');

    empty && (empty.classList.toggle('hidden', filtered.length>0));
  }

  function populateTags(projects){
    if (!tagFilter) return;
    const tags = new Set();
    projects.forEach(p => (p.tags||[]).forEach(t => tags.add(t)));
    [...tags].sort().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      tagFilter.appendChild(opt);
    });
  }

  async function initIndex(){
    if (!grid) return;
    const projects = await load();
    populateTags(projects);
    renderList(projects);
    search && search.addEventListener('input', ()=>renderList(projects));
    tagFilter && tagFilter.addEventListener('change', ()=>renderList(projects));
  }

  async function renderProjectDetail(){
    const article = document.getElementById('project');
    if (!article) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const projects = await load();
    const p = projects.find(x => String(x.id) === String(id));
    if (!p){
      article.innerHTML = `<p>Project not found.</p>`;
      return;
    }
    document.title = p.title + ' · Your Name';
    const tags = (p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ');
    const pdf = p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">Download report (PDF)</a>` : '';
    const code = p.code_url ? `<a href="${p.code_url}" target="_blank" rel="noopener">View code</a>` : '';
    const links = [pdf, code].filter(Boolean).join(' · ');
    const img = p.hero || p.thumbnail ? `<img src="${p.hero||p.thumbnail}" alt="" style="border-radius:10px; border:1px solid var(--border); margin:8px 0 12px">` : '';
    article.innerHTML = `
      <h1>${p.title}</h1>
      <div class="meta">${p.date ? fmtDate(p.date) : ''}</div>
      ${img}
      <p>${p.abstract||''}</p>
      ${p.details ? `<div class="prose">${p.details}</div>` : ''}
      <p>${links}</p>
      <div class="tags">${tags}</div>
    `;
  }

  // Expose detail renderer globally for project.html
  window.renderProjectDetail = renderProjectDetail;

  // Auto init if we are on index
  initIndex().catch(err => {
    if (grid) grid.innerHTML = '<p>Could not load projects. Check data/projects.json path.</p>';
    console.error(err);
  });
})();
