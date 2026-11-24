# Mukesh Babu — AI, Technology & Open-Source Portfolio

Personal portfolio for an ISC student exploring AI tools, technology, website management and open-source projects.

**Live portfolio:** https://mmukeshbabu2010-dot.github.io/mukesh-portfolio/  
**LinkedIn:** https://linkedin.com/in/mmukesh-babu

## Separate pages

- `index.html` — Home and portfolio overview
- `experience.html` — Independent initiatives
- `projects.html` — Selected projects and existing repository links
- `ai-lab.html` — AI tool explorations, learning workflows and responsible-use principles\n- `world.html` — Optional interactive 3D portfolio museum with guided and free exploration
- `education.html` — Academic journey
- `about.html` — About and areas of interest
- `contact.html` — Contact details and profile links
- `privacy.html` / `terms.html` — Existing policy pages

## Shared assets

- `assets/css/style.css` — Shared luxury graphite and champagne-gold design, responsive layouts, CSS 3D artwork and motion
- `assets/js/main.js` — Reveal animations, accessible mobile navigation, cursor glow and lightweight pointer parallax\n- `assets/css/world.css` / `assets/js/world.js` — Isolated 3D museum presentation and interaction layer (Three.js + GSAP via CDN)
- `favicon.svg` — Existing site icon
- `images/` — Existing project imagery

## Design and performance

The standard multi-page website remains the lightweight default. The optional `world.html` museum loads Three.js and GSAP on demand from a CDN and builds its book, gallery, globe and AI core from procedural geometry, so no large model assets or build step are required. Motion respects `prefers-reduced-motion`; the museum supports mouse, touch and keyboard controls, and a fallback links visitors to the standard pages when WebGL is unavailable.

## Run locally

Open `index.html` in a browser using a local static server for module support. Open `world.html` to enter the optional 3D museum; it needs a network connection to load Three.js and GSAP from the CDN. Keep the `assets/`, `images/`, and policy pages alongside the HTML files.

## Profile and project links

- [LinkedIn](https://linkedin.com/in/mmukesh-babu)
- [Personal GitHub](https://github.com/mmukeshbabu2010-dot)
- [Vruntime Labs](https://github.com/vruntime-labs)
- [PhantomX OS](https://github.com/vruntime-labs/phantomx-os)
- [Oqerun Store](https://github.com/vruntime-labs/oqerun-store)
- [Vruntime Ink Theme](https://github.com/vruntime-labs/vruntime-ink-theme)

Project descriptions are intentionally concise; visit each repository for current scope and development status. The AI Lab describes ongoing exploration rather than claiming production AI engineering experience.
