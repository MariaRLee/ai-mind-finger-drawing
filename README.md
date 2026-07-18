# AI-Mind Care: Figure Drawing（腦心畫）V2.3

A privacy-friendly browser experience for creative self-awareness.

## New in V1.5

### 1. Compact one-screen result

The result area is redesigned so the following information stays together as much as possible on one screen:

- **你的今日心境靈感藝術 / Your Mood-Inspired Art Today**
- Generated artwork
- Mood-inspired name and description
- Four compact line-feature indicators
- Save and restart controls

Desktop uses a two-column result view. Mobile uses a compact vertical view with a smaller artwork area.

### 2. Refined PC workspace

The desktop drawing page now uses a dashboard-style layout:

- Left: creative settings, timer, duration, color, and action controls
- Right: larger dedicated drawing canvas with a clear canvas heading and local-privacy badge
- Better spacing, balance, hierarchy, and visual grouping

### Previous V1.4 functions retained

- Choose 5 or 10 seconds
- Timed feature analysis followed by optional free drawing
- **Keep Drawing / Finish Artwork / Start Over**
- Save raw drawing
- Save generated mood-inspired artwork
- Chinese / English switch
- Local browser privacy mode

## Files

- `index.html`
- `style.css`
- `app.js`
- `.nojekyll`
- `README.md`

## GitHub Pages deployment

Replace the existing repository files with these V1.5 files and commit to `main`.

GitHub Pages settings:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

## Interpretation boundary

The 5- and 10-second choices are creative interaction options, not scientifically validated psychological measurement durations. Results are for creative expression and self-reflection only, not psychological or medical assessment or diagnosis.


## V2.0 updates

- Page title updated to **AI-Mind Care: Figure Drawing 腦心畫**
- Privacy wording updated to clarify that the site does **not automatically upload or store** artworks, while users may still save works to their own phone or computer.


## V2.1 updates

- Split the former combined save/share control into two clear actions:
  - **下載作品 / Download Artwork**
  - **分享作品 / Share Artwork**
- Direct image sharing is used only when the browser supports secure file sharing.
- Unsupported browsers show a clear fallback: download first, then share from Photos or Files.
- Added guidance for LINE, Facebook, and other in-app browsers: open the site in Safari or Chrome.
- Raw drawings continue to be downloadable separately.


## V2.2 updates

- Removed **Share Artwork** and all Web Share API code.
- Kept only **Download Artwork** and **Download Raw Drawing**.
- Renamed **Finish Artwork** to **Analyze Artwork / 分析作品**.
- On mobile, the post-timer action panel is fixed near the bottom so **Keep Drawing / Analyze Artwork / Start Over** remain visible.
- Shortened the Chinese introduction to one compact line on mobile.


## V2.3 updates

- Mobile pages can scroll normally; only the canvas captures finger movement while drawing.
- After 5 / 10 seconds, drawing continues automatically. There is no separate Keep Drawing button.
- The user decides when to stop by tapping **Analyze Artwork**.
- On mobile, **Save Artwork** opens a real image preview. Long-press the image and choose **Save to Photos** or **Download Image**.
- On desktop, artwork continues to download as a PNG file.
- No sharing API or third-party application integration is used.
