# Mux Player Customization Guide

This document explains how to customize the Mux Player web component used in Boot Rocks.

## Overview

Boot Rocks uses the Mux Player HTML web component (NOT the React version) loaded via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@mux/mux-player"></script>
```

## Hiding Player Controls

### CSS Variable Approach (Recommended)

Mux Player uses CSS custom properties (variables) to control which controls are visible. These variables must be set on the `mux-player` element or its container.

#### Correct Variable Names

The player reads these specific variable names (without the `--media-` prefix):

```css
.video-container mux-player {
  --seek-backward-button: none;      /* Hides 10-second backward button */
  --seek-forward-button: none;       /* Hides 10-second forward button */
  --playback-rate-button: none;      /* Hides playback speed button */
  --rendition-menu-button: none;     /* Hides quality selector */
  --airplay-button: none;            /* Hides AirPlay button */
  --cast-button: none;               /* Hides Chromecast button */
  --pip-button: none;                /* Hides picture-in-picture button */
}
```

### Variable Naming Convention

**IMPORTANT**: The variable names follow this pattern:

- ❌ **WRONG**: `--media-seek-backward-button-display: none`
- ✅ **CORRECT**: `--seek-backward-button: none`

The player's internal CSS uses cascading variables like:
```css
--media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
```

This means it checks `--seek-backward-button` FIRST, then falls back to section-specific variables.

### Available Controls

All controls that can be hidden:

| Variable | Control |
|----------|---------|
| `--play-button` | Play/pause button |
| `--seek-backward-button` | Seek backward button (10s) |
| `--seek-forward-button` | Seek forward button (10s) |
| `--mute-button` | Mute/unmute button |
| `--volume-range` | Volume slider |
| `--time-display` | Current time / duration display |
| `--time-range` | Seek/scrubber bar |
| `--captions-button` | Captions/subtitles button |
| `--playback-rate-button` | Playback speed button |
| `--rendition-menu-button` | Quality selector button |
| `--audio-track-menu-button` | Audio track selector |
| `--airplay-button` | AirPlay button |
| `--pip-button` | Picture-in-picture button |
| `--fullscreen-button` | Fullscreen button |
| `--cast-button` | Chromecast button |

### Section-Specific Controls

You can also hide controls in specific sections (top/center/bottom):

```css
mux-player {
  --bottom-seek-backward-button: none;  /* Hide only in bottom bar */
  --center-play-button: none;           /* Hide only in center overlay */
  --top-time-display: none;             /* Hide only in top bar */
}
```

## Implementation in Boot Rocks

### Current Setup

**File**: [src/styles.css](../src/styles.css)

```css
.video-container mux-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;

  /* Hide unwanted controls using Mux Player CSS variables */
  --seek-backward-button: none;
  --seek-forward-button: none;
  --playback-rate-button: none;
  --rendition-menu-button: none;
  --airplay-button: none;
  --cast-button: none;
  --pip-button: none;
}
```

### Result

The player displays a minimal control bar with ONLY:
- ✅ Play/pause button
- ✅ Time scrubber (seek bar)
- ✅ Time display (current time / duration)
- ✅ Mute button
- ✅ Volume slider
- ✅ Fullscreen button

All other controls are hidden:
- ❌ 10-second seek buttons
- ❌ Quality selector
- ❌ Playback speed
- ❌ AirPlay
- ❌ Chromecast
- ❌ Picture-in-picture

## Troubleshooting

### CSS Variables Not Working?

1. **Check variable names**: Ensure you're using `--seek-backward-button` NOT `--media-seek-backward-button-display`

2. **Check specificity**: The variables must be set on `mux-player` or an ancestor element

3. **Check syntax**: Use `none` as the value (not `display: none`)

4. **Inspect Shadow DOM**: Open DevTools → Elements → Find `<mux-player>` → Expand `#shadow-root` to verify controls are rendering

### JavaScript Approach (Not Recommended)

While you CAN hide controls via JavaScript by traversing the Shadow DOM, it's NOT recommended:

```javascript
// ❌ Don't do this - CSS is simpler and more reliable
const mediaTheme = player.shadowRoot?.querySelector('media-theme');
const controlBar = mediaTheme.shadowRoot?.querySelector('media-control-bar');
const button = controlBar.querySelector('media-seek-backward-button');
button.style.display = 'none';
```

**Why CSS is better**:
- Declarative and maintainable
- No timing issues waiting for DOM to load
- Works across all instances automatically
- Official Mux approach per documentation

## Additional Customization

### Colors

```css
mux-player {
  --media-accent-color: #d97706;        /* Primary brand color */
  --media-primary-color: #ffffff;       /* Text/icon color */
  --media-secondary-color: #000000;     /* Background color */
}
```

### Control Bar Styling

```css
mux-player {
  --media-control-height: 48px;         /* Control button size */
  --media-control-padding: 10px;        /* Button padding */
  --media-control-background: rgba(20, 20, 30, 0.7);  /* Control bar background */
}
```

## Resources

- [Mux Player HTML Documentation](https://www.mux.com/docs/guides/player-api-reference/html)
- [Media Chrome CSS Variables](https://www.media-chrome.org/docs/en/reference/styling)
- [Mux Player Customization Guide](https://www.mux.com/docs/guides/player-customize-look-and-feel)

## Migration Notes

### From Vimeo to Mux

When we migrated from Vimeo Player to Mux Player, the key differences were:

1. **Player type**: Vimeo used an iframe embed; Mux uses a web component
2. **Control customization**: Vimeo used URL parameters; Mux uses CSS variables
3. **API**: Vimeo used `player.` methods; Mux uses standard HTML5 media properties

The bi-directional video-content synchronization system worked with minimal changes - just updated the player instance reference.
