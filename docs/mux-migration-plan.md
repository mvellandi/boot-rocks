# Mux Migration Plan - Vimeo to Mux Free Tier

**Decision:** Migrate to Mux Free Tier ($0/month) to save $240/year

**Current Setup:** Vimeo Pro (~$20/month) with complete white-label control

**New Setup:** Mux Free Tier with small badge in corner (acceptable trade-off for cost savings)

---

## Quick Start Prompt for New Session

```
I need to migrate the Boot Rocks video player from Vimeo to Mux Free Tier.

Context:
- This is a portfolio/marketing site (boot.rocks) with synchronized video-content navigation
- Current: Vimeo Player SDK with 10 time-indexed sections
- Goal: Migrate to Mux Free Tier to save $240/year
- Mux Playback ID: [USER WILL PROVIDE AFTER ACCOUNT SETUP]

Key files to modify:
- src/index.html (replace vimeo iframe with mux-player web component)
- src/script.js (update player initialization and API calls)
- src/styles.css (update iframe selector to mux-player)
- package.json (swap @vimeo/player for @mux/mux-player)

Please follow the step-by-step plan in docs/mux-migration-plan.md
```

---

## Prerequisites (User Must Complete First)

Before starting migration, user must:

1. **Sign up for Mux Free Tier**
   - Go to [mux.com](https://mux.com)
   - Create account (no credit card required)

2. **Upload video to Mux**
   - Access Mux dashboard
   - Upload the 7-minute Boot.dev review video (currently on Vimeo ID: 1072643347)
   - Wait for encoding to complete

3. **Get Mux Playback ID**
   - Navigate to video asset in Mux dashboard
   - Copy the Playback ID
   - This replaces the Vimeo video ID
   - **Provide this ID to Claude when starting migration**

4. **Optional:** Add payment method for $20 free credit (not required for free tier)

---

## Migration Steps

### Phase 1: Update Dependencies

**File:** [package.json](../package.json)

**Action:** Replace Vimeo SDK with Mux Player

```bash
# Remove Vimeo player
npm uninstall @vimeo/player

# Install Mux player
npm install @mux/mux-player

# Verify installation
npm list @mux/mux-player
```

**Expected package.json change:**
```diff
  "dependencies": {
    "@tailwindcss/vite": "^4.0.17",
-   "@vimeo/player": "^2.26.0",
+   "@mux/mux-player": "^2.0.0",
    "tailwindcss": "^4.0.17"
  }
```

---

### Phase 2: Update HTML Structure

**File:** [src/index.html](../src/index.html) (Lines 90-100)

**Change 1: Add Mux Player script to `<head>`**

Add before closing `</head>` tag:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@mux/mux-player"></script>
```

**Change 2: Replace Vimeo iframe with Mux player**

**OLD:**
```html
<div class="video-container">
  <iframe
    id="vimeo-player"
    src=""
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    style="background: #000000"
  ></iframe>
</div>
```

**NEW:**
```html
<div class="video-container">
  <mux-player
    id="mux-player"
    playback-id="YOUR_MUX_PLAYBACK_ID"
    metadata-video-title="Boot.Rocks Review"
    accent-color="#d97706"
    style="--controls: auto; aspect-ratio: 16/9;"
  ></mux-player>
</div>
```

**Note:** Replace `YOUR_MUX_PLAYBACK_ID` with actual playback ID from Mux dashboard.

---

### Phase 3: Update JavaScript Integration

**File:** [src/script.js](../src/script.js)

#### Change 1: Remove Vimeo Import (Line 1)

**OLD:**
```javascript
import Player from "@vimeo/player";
```

**NEW:**
```javascript
// No import needed - Mux player loaded via script tag
```

#### Change 2: Update Constants (Line 5)

**OLD:**
```javascript
const VIMEO_VIDEO_ID = "1072643347";
```

**NEW:**
```javascript
const MUX_PLAYBACK_ID = "YOUR_MUX_PLAYBACK_ID"; // Get from Mux dashboard
```

#### Change 3: Update Player Initialization (Lines 133-158)

**OLD:**
```javascript
const iframe = document.getElementById("vimeo-player");
iframe.src = `https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?background=0&autopause=0&transparent=0&autoplay=0&loop=0&title=0&byline=0&portrait=0&quality=1080p&dnt=1&controls=1&cc=false&texttrack=false`;

player = new Player(iframe, {
  id: VIMEO_VIDEO_ID,
  width: "100%",
  height: "100%",
  responsive: true,
  autoplay: false,
  controls: true,
  title: false,
  byline: false,
  portrait: false,
  playsinline: true,
  background: false,
  quality: "1080p",
  dnt: 1,
  cc: false,
  texttrack: false,
});
```

**NEW:**
```javascript
player = document.getElementById("mux-player");
```

#### Change 4: Update Ready Handler (Lines 161-176)

**OLD:**
```javascript
async function initPlayer() {
  await player.ready();

  // Handle initial section from hash
  // ... rest of code
}
```

**NEW:**
```javascript
async function initPlayer() {
  // Wait for Mux player to be ready
  await new Promise(resolve => {
    if (player.readyState >= 1) {
      resolve();
    } else {
      player.addEventListener('loadedmetadata', resolve, { once: true });
    }
  });

  playerInitialized = true;

  // Handle initial section from hash
  // ... rest of code (keep existing logic)
}
```

#### Change 5: Update Event Listener (Line 165)

**OLD:**
```javascript
player.on("timeupdate", handleTimeUpdate);
```

**NEW:**
```javascript
player.addEventListener("timeupdate", (e) => {
  handleTimeUpdate({ seconds: player.currentTime });
});
```

#### Change 6: Update Seek Method

**Locations:** Lines 169, 204, 226, 290, 313

**OLD:**
```javascript
await player.setCurrentTime(startTime);
```

**NEW:**
```javascript
player.currentTime = startTime;
```

#### Change 7: Update Playback State Check

**Locations:** Lines 200, 222, 286, 309

**OLD:**
```javascript
const isPaused = await player.getPaused();
```

**NEW:**
```javascript
const isPaused = player.paused;
```

#### Change 8: Update Play/Pause Methods

**Locations:** Lines 202, 206, 224, 228, 288, 292, 311, 316

**OLD:**
```javascript
await player.pause();
await player.play();
```

**NEW:**
```javascript
player.pause();
player.play();
```

---

### Phase 4: Update CSS

**File:** [src/styles.css](../src/styles.css) (Lines 315-339)

**Change:** Update iframe selector to mux-player

**OLD:**
```css
.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
}
```

**NEW:**
```css
.video-container mux-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
}
```

**Note:** The `.video-container` styles remain unchanged - only the child selector changes from `iframe` to `mux-player`.

---

### Phase 5: Testing Locally

Run development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and test:

**Critical Tests:**
- [ ] Video loads and displays correctly
- [ ] Video plays/pauses with controls
- [ ] Section navigation clicks seek to correct timestamps
- [ ] Active section highlights during video playback
- [ ] URL hash updates as video plays (#section-id)
- [ ] Direct links work (e.g., http://localhost:5173/#great-deal)
- [ ] Mobile menu navigation works
- [ ] Play/pause state preserved during section navigation
- [ ] Fullscreen button works
- [ ] Volume controls work

**Responsive Tests:**
- [ ] Mobile (<640px): Video displays correctly, menu overlay works
- [ ] Tablet (768px): Layout adapts properly
- [ ] Desktop (1024px): Three-column layout correct
- [ ] Large (1920px): Extra margins applied correctly

**Edge Cases:**
- [ ] Navigate to section while video paused (should pause, seek, stay paused)
- [ ] Navigate to section while video playing (should seek and continue playing)
- [ ] Hash navigation from page load (e.g., refresh on #community)
- [ ] Fast section switching (multiple clicks)

---

### Phase 6: Build and Deploy

**Build production bundle:**
```bash
npm run build
```

**Verify build output:**
- Check `docs/` directory contains built files
- Look for `index.html`, `about.html`, and asset bundles

**Deploy to GitHub Pages:**
```bash
git add .
git commit -m "Migrate from Vimeo to Mux Free Tier

- Replace @vimeo/player with @mux/mux-player
- Update player initialization to use Mux web component
- Simplify API calls (no async/await needed)
- Update CSS selector from iframe to mux-player
- Saves $240/year with minimal UX impact (small Mux badge)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

**Monitor deployment:**
- GitHub Actions will build and deploy automatically
- Check Actions tab for build status
- Wait 1-2 minutes for deployment

**Test on live site:**
- Visit [https://boot.rocks](https://boot.rocks)
- Repeat all tests from Phase 5
- Test on actual mobile devices if possible

---

### Phase 7: Monitor Usage

**Mux Dashboard:**
- Log into [mux.com](https://mux.com)
- Navigate to Analytics
- Monitor delivery minutes usage
- Free tier includes 100K minutes/month

**Expected usage for portfolio site:**
- 7-minute video
- Estimate: <1,000 delivery minutes/month
- Well within 100K limit

---

## Rollback Plan

If issues occur after deployment:

**Option 1: Git Revert**
```bash
git revert HEAD
git push origin main
```

**Option 2: Manual Rollback**
1. Keep Vimeo Pro subscription active for 1 week during testing
2. If major issues, restore previous commit:
   ```bash
   git reset --hard HEAD~1
   git push origin main --force
   ```

**Option 3: Feature Branch Approach (Recommended)**
Before making changes, create feature branch:
```bash
git checkout -b mux-migration
# Make all changes on this branch
git push origin mux-migration
# Test thoroughly before merging to main
```

---

## API Comparison Reference

| Function | Vimeo Player SDK | Mux Player | Notes |
|----------|-----------------|------------|-------|
| **Import** | `import Player from "@vimeo/player"` | Via `<script type="module">` tag | Mux is web component |
| **Initialize** | `new Player(iframe, {options})` | `document.getElementById()` | Mux is already initialized |
| **Ready** | `await player.ready()` | `addEventListener('loadedmetadata')` | Different event pattern |
| **Seek** | `await player.setCurrentTime(sec)` | `player.currentTime = sec` | Direct property assignment |
| **Get Paused** | `await player.getPaused()` | `player.paused` | Property instead of method |
| **Pause** | `await player.pause()` | `player.pause()` | No await needed |
| **Play** | `await player.play()` | `player.play()` | No await needed |
| **Timeupdate** | `player.on("timeupdate", fn)` | `player.addEventListener("timeupdate", fn)` | Standard DOM events |
| **Current Time** | Inside event handler | `player.currentTime` | Direct property access |

---

## Troubleshooting

### Video doesn't load
- Verify Mux Playback ID is correct
- Check browser console for errors
- Ensure script tag is in `<head>` section
- Verify Mux video encoding is complete

### Seeking doesn't work
- Check `player.currentTime = value` syntax
- Ensure player is ready before seeking
- Verify section timestamps in HTML data attributes

### Timeupdate event not firing
- Verify event listener syntax: `addEventListener("timeupdate", fn)`
- Check that `handleTimeUpdate` receives `{ seconds: player.currentTime }`
- Ensure video is playing (event doesn't fire when paused)

### Styling issues
- Verify CSS selector changed from `iframe` to `mux-player`
- Check that `.video-container` maintains aspect-ratio
- Inspect element to confirm mux-player is rendering

### Build fails
- Run `npm install` to ensure dependencies installed
- Check for syntax errors in JavaScript
- Verify all imports removed from script.js

---

## Optional: Future Upgrade to Mux Creator ($25/month)

To remove the Mux branding badge, upgrade to Creator plan and add:

**HTML:**
```html
<mux-player
  id="mux-player"
  playback-id="YOUR_MUX_PLAYBACK_ID"
  metadata-video-title="Boot.Rocks Review"
  accent-color="#d97706"
  theme="minimal"
  primary-color="#422006"
  secondary-color="#78350f"
  style="--controls: auto; aspect-ratio: 16/9;"
></mux-player>
```

**CSS:**
```css
mux-player {
  --media-object-fit: contain;
  --media-object-position: center;
  --controls: auto;
  --controls-backdrop-color: rgba(0, 0, 0, 0.7);
}
```

Upgrade is instant - no code changes needed beyond adding attributes.

---

## Cost Savings Summary

| Plan | Monthly | Annual | Savings vs Vimeo |
|------|---------|--------|------------------|
| **Vimeo Pro** | $20 | $240 | - |
| **Mux Free** | $0 | $0 | **$240/year** |
| **Mux Creator** | $25 | $300 | -$60/year (but white-label) |

**Decision:** Start with Mux Free, upgrade to Creator later if white-label becomes critical.

---

## Support Resources

- **Mux Documentation:** [https://docs.mux.com](https://docs.mux.com)
- **Mux Player Reference:** [https://docs.mux.com/guides/player-api-reference](https://docs.mux.com/guides/player-api-reference)
- **Mux Support:** support@mux.com
- **This Project:** See [CLAUDE.md](../CLAUDE.md) for architecture overview
