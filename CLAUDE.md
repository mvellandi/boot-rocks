# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boot Rocks is an interactive product review website featuring a synchronized video and content navigation system. The site reviews Boot.dev (an online software engineering education platform) through a 7-minute video divided into 10 navigable sections. This is a static site built with vanilla JavaScript, using Mux Player for video integration.

**Live Site:** https://boot.rocks

## Common Commands

### Development
```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Build production bundle to docs/
npm run preview    # Preview production build locally
```

### Testing
No automated tests are currently configured. Manual testing uses Chrome DevTools and responsive design testing across 7 breakpoints.

## Architecture

### Core Synchronization System

The application's key architectural feature is **bi-directional video-content synchronization**:

1. **Content → Video**: When users click a navigation section, the video seeks to the corresponding timestamp
2. **Video → Content**: As the video plays, the active section and navigation state update automatically

This is managed through:
- `data-start` attributes on HTML sections containing video timestamps (in seconds)
- Mux Player event listeners (`timeupdate`)
- State flag `isUserNavigating` to prevent feedback loops between playback sync and manual navigation

### Multi-Entry Build System

Vite builds two independent HTML pages:
- `src/index.html` → Main video review page with 10 sections
- `src/about.html` → Project information page

Both pages share the same JavaScript (`script.js`) and CSS (`styles.css`, `colors.css`).

Configuration in [vite.config.js](vite.config.js):
- **Root**: `src/`
- **Output**: `docs/` (GitHub Pages convention)
- **Public assets**: `../public/` (OG images)

### Responsive Layout Architecture

The site uses a **three-column desktop layout** that transforms responsively:

```
Desktop (≥1024px):
┌──────────┬────────────────┬─────────────┐
│  Video   │    Content     │ Navigation  │
│ (fixed)  │   (scrolls)    │  (sticky)   │
└──────────┴────────────────┴─────────────┘

Mobile (<1024px):
┌─────────────────────────────────────────┐
│            Header + Menu Button          │
├─────────────────────────────────────────┤
│              Video (full-width)          │
├─────────────────────────────────────────┤
│          Content (scrollable)            │
└─────────────────────────────────────────┘
(Navigation becomes overlay menu)
```

Seven breakpoints defined in CSS custom properties:
- Mobile: <640px
- Tablet small: ≥640px
- Tablet: ≥768px
- Desktop: ≥1024px
- Desktop large: ≥1280px
- 2XL: ≥1536px
- HD: ≥1920px

### State Management

The JavaScript uses a simple state model without frameworks:

```javascript
let player = null;                    // Mux player instance
let currentSectionId = null;          // Active section ID
let isUserNavigating = false;         // Prevents sync conflicts
let playerInitialized = false;        // Initialization flag
```

Navigation uses hash-based routing (`window.location.hash`) for bookmarkability and direct linking to sections.

## Key Files

| File | Purpose |
|------|---------|
| [src/index.html](src/index.html) | Main page with 10 video sections (469 lines) |
| [src/about.html](src/about.html) | About/project info page (86 lines) |
| [src/script.js](src/script.js) | All interactivity: Mux Player, navigation sync, mobile menu (323 lines) |
| [docs/mux-player-customization.md](docs/mux-player-customization.md) | Mux Player control customization guide |
| [src/styles.css](src/styles.css) | Main styles: layout, responsive, typography (800+ lines) |
| [src/colors.css](src/colors.css) | Design system color variables and scales (152 lines) |
| [vite.config.js](vite.config.js) | Build configuration for multi-entry setup |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | GitHub Actions deployment to GitHub Pages |

## Code Conventions

### CSS Architecture

1. **Nested CSS with ampersand syntax**:
   ```css
   body {
     padding: 0 var(--screen-padX);
     &.no-scroll { /* nested */ }
     @media (min-width: 640px) { /* nested media query */ }
   }
   ```

2. **Custom properties for responsive values**:
   - Padding: `--screen-padX`, `--screen-padX-sm`, `--screen-padX-lg`, etc.
   - Max widths: `--video-page-max-width`, `--standard-page-max-width`
   - Typography: `--header-text`, `--header-text-lg`, `--header-text-xl`

3. **Advanced color system using `color-mix()`**:
   Instead of static colors, [colors.css](src/colors.css) generates 40+ shade variations:
   ```css
   --color-brown-940: color-mix(in srgb,
     var(--color-brown-900) 40%,
     var(--color-brown-950) 60%);
   ```

4. **Tailwind usage**: While Tailwind is included, most styles are in custom CSS due to the static, content-focused nature of the site. Tailwind utilities are used selectively.

### JavaScript Patterns

1. **Data attributes for configuration**:
   - `data-section`: Section identifier
   - `data-start`: Video timestamp in seconds

2. **Event-driven architecture**:
   - Mux Player events (`timeupdate`, `loadedmetadata`)
   - Hash change events for navigation
   - Click handlers for mobile menu

3. **Scroll prevention during navigation**:
   When transitioning sections, `no-scroll` class prevents background scrolling:
   ```css
   body.no-scroll {
     overflow: hidden;
     position: fixed;
     width: 100%;
     height: 100%;
   }
   ```

## Deployment

The site deploys automatically via GitHub Actions:

1. **Trigger**: Every push to `main` branch
2. **Build**: Node.js 18, npm ci, npm run build
3. **Deploy**: Upload `docs/` to GitHub Pages
4. **Live**: https://boot.rocks (custom domain via CNAME)

Workflow file: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## Third-Party Integrations

- **Mux Player** (web component): Video streaming and programmatic control
  - Loaded via CDN: `https://cdn.jsdelivr.net/npm/@mux/mux-player`
  - Uses HTML5-like media API (no external SDK needed)
  - Customized via CSS variables (see [docs/mux-player-customization.md](docs/mux-player-customization.md))
- **Plausible Analytics**: Privacy-focused analytics (script tag in HTML head)
- **Custom domain**: boot.rocks via CNAME in GitHub Pages settings

### Video Player Customization

The Mux Player is customized to show a minimal control bar. Unwanted controls (seek buttons, quality selector, playback rate, PiP, AirPlay, Cast) are hidden using CSS variables in [src/styles.css](src/styles.css):

```css
.video-container mux-player {
  --seek-backward-button: none;
  --seek-forward-button: none;
  --playback-rate-button: none;
  --rendition-menu-button: none;
  --airplay-button: none;
  --cast-button: none;
  --pip-button: none;
}
```

For complete customization documentation, see [docs/mux-player-customization.md](docs/mux-player-customization.md).

## Project Context

This is a portfolio/marketing project created independently (unsponsored) to demonstrate:
- Video production skills (7-minute review split into 10 sections)
- Web engineering (interactive synchronized navigation)
- Marketing capabilities (social media campaign across 7 platforms)

The synchronized video-content system is the core innovation, enabling users to navigate like a YouTube video with chapters, but with richer textual content and better mobile UX.
