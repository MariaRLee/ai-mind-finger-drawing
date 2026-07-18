# AI-Mind Care: Figure Drawing（腦心畫）V2.4.1

## V2.4.1 interaction logic

This version uses a clearer, safer workflow with a built-in time limit:

- **Start 5 Seconds** = 5-second main drawing + 10-second finishing period
- **Start 10 Seconds** = 10-second main drawing + 10-second finishing period
- At the end of the finishing period, the system **automatically analyzes** the artwork
- During drawing, the buttons are simplified to:
  - **提早完成 / Finish Now**
  - **重新開始 / Start Over**

## Save options

After analysis, users can save two different outputs:

- **儲存原始手繪圖 / Save Original Drawing**
- **儲存 AI 心境藝術 / Save AI Mood Artwork**

On mobile, tapping a save button opens a preview so the user can **long-press the image** to save it to Photos. On desktop, the PNG file downloads normally.

## Privacy

Drawing and analysis happen only in the browser. The website does not automatically upload or store the work.


## V2.4.1 critical fix

- The timer no longer starts immediately when the mode button is pressed.
- After choosing 5 or 10 seconds, the app scrolls to the canvas on mobile and waits for the first stroke.
- The countdown starts with the first stroke, so users do not lose drawing time while moving to the canvas.
- Pointer capture is now optional and wrapped safely for iPhone, Android, Safari, and Chrome compatibility.
- Touch and mouse fallbacks were added for browsers without Pointer Events.
