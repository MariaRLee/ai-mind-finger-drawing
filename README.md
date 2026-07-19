# AI-Mind Care: Figure Drawing（腦心畫）V2.5.1

## V2.4.2 fixes

1. **Draw Again reset**
   - Clears the original drawing canvas and generated result.
   - Returns the page to the top creative workspace.

2. **Mobile drawing controls stay visible**
   - During drawing, a compact fixed control bar remains visible at the bottom:
     - **提早完成 / Finish Now**
     - **重新開始 / Start Over**

3. **Balanced timing**
   - **5-second mode:** 5 seconds main drawing + 5 seconds finishing time.
   - **10-second mode:** 10 seconds main drawing + 10 seconds finishing time.
   - The system analyzes automatically when the full time ends.

## Save options

- **儲存原始手繪圖 / Save Original Drawing**
- **儲存 AI 心境藝術 / Save AI Mood Artwork**

All drawing and analysis remain local in the browser.


## V2.5 — Save the complete result card

The **Save AI Mood Result Card** button now exports one 1920 × 1080 PNG containing:

- AI mood artwork
- Art inspiration name and message
- Line speed
- Touch force
- Curve flow
- Visual energy
- Creative-expression / non-diagnostic reminder

**Save Original Drawing** continues to export the clean hand-drawn image without added text.


## V2.5.1 — Local date and time

The saved AI mood result card now includes a subtle local timestamp in the lower-right footer, for example:

`2026.07.19  20:35`

The timestamp represents when the artwork was completed and is generated locally by the browser. No location or timezone information is added.

Both exported filenames also include the same completion timestamp:

- `AI-Mind-Mood-Result-Card-20260719-2035.png`
- `AI-Mind-Original-Drawing-20260719-2035.png`
