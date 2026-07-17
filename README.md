# AI-Mind Finger Drawing（腦心畫）V1.2

A privacy-aware, bilingual, five-second finger-drawing experience for GitHub Pages.

## V1.2 improvements

- Prevents the webpage from sliding or scrolling while the user is actively drawing on a phone.
- Removes automatic movement to the result. The user taps **查看結果 / View result** when ready.
- On supported phones, **儲存／分享藝術** opens the native share menu so the user can choose **Save Image**, **Save to Files**, Photos, or another app.
- On computers and unsupported browsers, the artwork downloads to the normal Downloads folder.
- Adds clear bilingual saving instructions below the save button.
- Uses a compact two-column desktop workspace so the controls and drawing canvas can fit in one screen on most computers.
- Keeps the compact mobile header, first-screen Start button, and 中文 / English switch from V1.1.
- Drawing, analysis, and artwork generation remain fully local in the browser.
- No account, database, cookies, analytics, visitor counter, or external data transmission.

## Files

- `index.html`
- `style.css`
- `app.js`
- `.nojekyll`

## Update the existing GitHub repository

1. Unzip this package.
2. Replace the existing `index.html`, `style.css`, `app.js`, `README.md`, and `.nojekyll` files in the `ai-mind-finger-drawing` repository.
3. Commit the changes to the `main` branch.
4. Wait for the GitHub Pages workflow to finish.
5. Refresh the published site. On a phone, close and reopen the page if an older cached version still appears.

## Mobile saving

- iPhone/iPad: tap **儲存／分享藝術**, then choose **Save Image** or **Save to Files** in the share sheet.
- Android: tap **儲存／分享藝術**, then choose Photos, Files, Drive, or another available destination.
- If the browser does not support file sharing, the image is sent to the browser's Downloads location.

## Privacy and interpretation

This is an artistic self-awareness experience, not a psychological, medical, or health diagnosis. When variable touch pressure is unavailable, the interface clearly states that contact area and line variation are used as supporting estimates.
