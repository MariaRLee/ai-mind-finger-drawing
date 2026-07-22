# AI-Mind Care: Figure Drawing（腦心畫）V2.6.1 IP Protection Edition

## V2.6.1 — Copyright and Terms of Use

V2.6.1 keeps all V2.6 functionality and adds an in-page bilingual **Full Copyright & Terms of Use** notice.

- Footer version and copyright line updated to V2.6.1 / © 2026
- Clickable **完整著作權與使用條款 / Full Copyright & Terms of Use**
- Bilingual IP ownership, permitted-use, user-creation, prohibited-use, disclaimer, and commercial-licensing provisions
- Dedicated `COPYRIGHT-AND-TERMS.md` file included in the package

## V2.6 — User Guide and device compatibility guidance

V2.6 keeps all V2.5.1 drawing, timing, privacy, result-card, timestamp, and saving features. It adds a compact bilingual **使用指南｜User Guide** without connecting to external services.

### User Guide

The guide explains:

1. Choose an intuitive color.
2. Choose the 5-second or 10-second mode.
3. Touch the canvas to start the countdown.
4. Wait for automatic analysis, or use **Finish Now / Start Over**.
5. Save the original drawing or the complete AI mood result card.

### Apple, Android, and LINE guidance

- **iPhone / iPad:** Safari is recommended. On mobile, long-press the displayed image and choose **Save to Photos**.
- **Android:** Google Chrome is recommended. Long-press the displayed image or download the PNG.
- **LINE in-app browser:** If drawing or saving does not work correctly, use LINE’s top-right menu to open the page in Safari or Chrome.
- When LINE’s in-app browser is detected, the website displays a short compatibility reminder automatically.

### Compatibility safeguards

- Pointer Events are used when available.
- Touch and mouse fallbacks remain available for older browsers.
- PNG creation includes a fallback for browsers without `canvas.toBlob()`.
- Canvas drawing prevents accidental page movement only while drawing on the canvas.
- No LINE API, login, sharing integration, analytics, visitor counter, or external tracking is included.

## Timing

- **5-second mode:** 5 seconds main drawing + 5 seconds finishing time.
- **10-second mode:** 10 seconds main drawing + 10 seconds finishing time.
- The countdown starts only when the first line touches the canvas.
- The system analyzes automatically when the full time ends.

## Save options

- **儲存原始手繪圖 / Save Original Drawing**
- **儲存 AI 心境成果卡 / Save AI Mood Result Card**

The result card includes the AI artwork, art inspiration, four indicators, reminder text, company attribution, and the local completion date and time.

## Privacy

All drawing and analysis remain local in the browser. The website does not automatically upload or store artwork.
