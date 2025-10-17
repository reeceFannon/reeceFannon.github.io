# JSON-Driven GitHub Pages (No Jekyll)

This is a minimal site that renders from `data/projects.json` using vanilla JavaScript.
- No Jekyll, no build step, no frameworks.
- Update `data/projects.json`, push, and the site updates.

## Structure
```
index.html          # home + projects grid
project.html        # details page (reads ?id=...)
about.html
assets/
  style.css
  site.js
data/
  projects.json     # edit this to add projects
files/              # put your PDFs here (e.g., my-report.pdf)
```

## Usage
1. Copy these files to your GitHub Pages repo (e.g., `username.github.io`).
2. Commit and push. Enable Pages in **Settings → Pages → Deploy from branch** if needed.
3. Edit `data/projects.json` to add or update projects. Drop PDFs into `/files/` and point `pdf` fields to them.

### Project schema
```json
[
  {
    "id": "unique-slug",
    "title": "Project Title",
    "date": "2025-01-15",
    "tags": ["tag1", "tag2"],
    "abstract": "One-paragraph summary…",
    "pdf": "files/your-report.pdf",
    "code_url": "https://github.com/yourhandle/repo",
    "thumbnail": "path-or-url-to-image.png",
    "hero": "larger image for detail page (optional)",
    "details": "<p>Optional HTML for a longer write-up.</p>"
  }
]
```

### Notes
- **Images:** Put local images anywhere and reference by relative path, or paste full URLs.
- **PDFs:** Place in `/files/` and set `"pdf": "files/your-report.pdf"`.
- **Project detail page:** Links are `project.html?id=the-id`.
- **Searching/Filtering:** The search box and tag dropdown work client-side.

Enjoy!
