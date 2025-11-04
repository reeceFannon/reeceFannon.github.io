# Reece Fannon — Personal Portfolio Website

This repository contains the source code for **[reecefannon.github.io](https://reecefannon.github.io)** — a personal portfolio site built with plain HTML, CSS, and JavaScript. It serves as a central hub for sharing my projects and research.

---

## 🌐 Live Site

**Visit:** [https://reecefannon.github.io](https://reecefannon.github.io)

---

## 🧭 Purpose

The goal of this site/repo is to
- Showcase my research, data analysis, and mathematics related projects.
- Learn the basics of frontend development (HTML, CSS and JavaScript) 

---

## 🧩 How It Works

### 1. **Static HTML files**
- `index.html` — Home page listing my personal information and all projects in a responsive grid. 
- `project.html` — Detail view for a single project, rendered when you click “Read More.”
- `about.html` — Biography, education, and contact information. Currently not actually used, but I may add this page back in the future.

### 2. **CSS Styling**
All visual design is handled through [assets/style.css], including:
- Page layout and typography
- Responsive project cards and buttons
- Hover and fade effects
- Light/dark color variables (using CSS custom properties)

### 3. **JavaScript Logic**
The main logic lives in [assets/site.js], which:
- Loads structured content from [data/portfolio.json]
- Dynamically generates the project cards on the home page
- Renders full project details on `project.html`
- Updates elements like the footer year and social links automatically

### 4. **Project Data**
All content is stored in [data/portfolio.json]:
- Data about me
- Links to my socials
- paths to images and files
- Metadata related to each project, used to fill out each project card and project page
- The [assets/site.js] automatically reads this file and renders the corresponding pages using this information

The website can easily be appended by simply editing or adding to [data/portfolio.json]. [assests/site.js] will automatically add cards and pages for each additional project added to [data/portoflio.json].
