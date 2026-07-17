# AI-Mind Finger Drawing（腦心畫）V1.0

用手指在手機或平板上自由畫 5 秒，系統在瀏覽器本機分析線條速度、曲線、畫面密度、顏色，以及裝置可提供的觸控壓力或觸控面積資料，並生成「今日心境藝術」。

## V1.0 功能

- 5 秒倒數手指繪圖
- 8 種直覺色彩
- 線條速度、觸控力度、曲線與畫面能量分析
- 生成個人化抽象心境藝術
- 心境名稱、鼓勵話語與四項簡要指標
- PNG 圖片儲存
- 手機、平板與桌面瀏覽器支援
- Home 按鈕連至 https://www.hyloveclub.com

## 隱私與安全

- 所有繪圖、分析與圖像生成都在瀏覽器本機完成
- 無後端、無資料庫、無帳號系統
- 不使用 Cookie、localStorage、sessionStorage 或 IndexedDB
- 不使用 Google Analytics、GoatCounter、訪客計數器或其他追蹤工具
- Content Security Policy 設為 `connect-src 'none'`，網頁不向外部伺服器傳送資料
- 結果僅為藝術化自我覺察體驗，不是心理、醫療或健康診斷

## 關於觸控壓力

程式使用 Pointer Events。若手機、平板或手寫筆提供可變化的 `PointerEvent.pressure`，會納入分析。許多一般手機觸控螢幕不會提供真實壓力值；此時程式會使用觸控面積、線條速度與線條變化作為輔助估算，並在畫面上清楚標示。

## 檔案

- `index.html`：網頁結構
- `style.css`：版面與手機響應式設計
- `app.js`：繪圖、5 秒計時、分析與藝術生成
- `README.md`：專案說明與部署步驟
- `.nojekyll`：讓 GitHub Pages 直接發布靜態檔案

## 本機測試

直接開啟 `index.html` 即可測試。若瀏覽器限制本機檔案功能，可在此資料夾執行：

```bash
python -m http.server 8000
```

然後開啟：

```text
http://localhost:8000
```

## 部署至 GitHub Pages

建議建立新的 Public repository：

```text
ai-mind-finger-drawing
```

1. 在 GitHub 建立新的 Public repository。
2. 將本資料夾內四個檔案上傳到 repository 根目錄。
3. 前往 `Settings → Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選擇 `main`，Folder 選擇 `/ (root)`。
6. 儲存後，網站網址預計為：

```text
https://mariarlee.github.io/ai-mind-finger-drawing/
```
Deployment refresh: 2026-07-17
## 版本定位

V1.0 採用透明、可解釋的本機規則分析與程序式藝術生成，不會宣稱心理診斷或醫療效能。後續版本可加入每日紀錄、13 級情緒花卡連動、腦波音樂連動或更多藝術模式，但新增資料保存功能前應先重新檢視隱私設計。
