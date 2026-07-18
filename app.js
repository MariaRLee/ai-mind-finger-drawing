"use strict";

(() => {
  const EXTRA_SECONDS = 10;
  const MIN_POINTS = 6;
  const TAU = Math.PI * 2;

  const drawingCanvas = document.getElementById("drawingCanvas");
  const artCanvas = document.getElementById("artCanvas");
  const drawCtx = drawingCanvas.getContext("2d", { alpha: true });
  const artCtx = artCanvas.getContext("2d", { alpha: false });

  const canvasOverlay = document.getElementById("canvasOverlay");
  const timerEl = document.getElementById("timer");
  const statusMessage = document.getElementById("statusMessage");
  const pressureNote = document.getElementById("pressureNote");
  const resultCard = document.getElementById("resultCard");
  const saveNotice = document.getElementById("saveNotice");

  const startModeActions = document.getElementById("startModeActions");
  const duringActions = document.getElementById("duringActions");
  const start5Button = document.getElementById("start5Button");
  const start10Button = document.getElementById("start10Button");
  const finishNowButton = document.getElementById("finishNowButton");
  const clearButton = document.getElementById("clearButton");
  const drawAgainButton = document.getElementById("drawAgainButton");
  const downloadArtButton = document.getElementById("downloadArtButton");
  const downloadDrawingFromResultButton = document.getElementById("downloadDrawingFromResultButton");

  const saveModal = document.getElementById("saveModal");
  const saveModalBackdrop = document.getElementById("saveModalBackdrop");
  const saveModalClose = document.getElementById("saveModalClose");
  const savePreviewImage = document.getElementById("savePreviewImage");
  const downloadPreviewButton = document.getElementById("downloadPreviewButton");
  const closePreviewButton = document.getElementById("closePreviewButton");

  const langZhButton = document.getElementById("langZh");
  const langEnButton = document.getElementById("langEn");
  const colorButtons = Array.from(document.querySelectorAll(".color-dot"));

  const moodName = document.getElementById("moodName");
  const moodMessage = document.getElementById("moodMessage");
  const speedMetric = document.getElementById("speedMetric");
  const pressureMetric = document.getElementById("pressureMetric");
  const curveMetric = document.getElementById("curveMetric");
  const energyMetric = document.getElementById("energyMetric");

  let currentLanguage = localStorage.getItem("aimind-language") === "en" ? "en" : "zh";
  let selectedColor = localStorage.getItem("aimind-color") || "#7b61ff";
  let selectedMainSeconds = [5, 10].includes(Number(localStorage.getItem("aimind-main-duration"))) ? Number(localStorage.getItem("aimind-main-duration")) : 5;

  let uiState = "idle"; // idle, armed, drawing, result
  let drawingEnabled = false;
  let pointerDown = false;
  let currentStroke = null;
  let strokes = [];
  let points = [];
  let countdownStart = 0;
  let countdownFrame = 0;
  let currentPhase = "idle"; // idle, main, extra
  let mainDuration = 5;
  let variablePressureObserved = false;
  let pressureValues = [];
  let lastPointerType = "unknown";
  let lastAnalysis = null;

  const moods = {
    calm: [
      { zh: ["流光安定", "你正在慢慢回到自己的節奏，讓今天留一點空間給內心。"], en: ["Steady Light", "You are gently returning to your own rhythm. Leave a little inner space for today."] },
      { zh: ["柔波靜心", "你的線條帶著柔和的流動，今天適合穩穩地前進。"], en: ["Gentle Wave", "Your lines carry a soft flow. Today is a good day to move forward steadily."] }
    ],
    lively: [
      { zh: ["躍動星河", "你的能量正在向外延伸，把這份活力用在最重要的事情上。"], en: ["Dancing Galaxy", "Your energy is reaching outward. Use this vitality for what matters most today."] },
      { zh: ["彩光奔流", "今天的你充滿推進力，也別忘了在速度中保留呼吸。"], en: ["Flowing Color", "You have strong momentum today. Remember to leave room to breathe within the pace."] }
    ],
    focused: [
      { zh: ["凝光軌跡", "你的心正在聚焦，沿著清楚的方向一步一步完成。"], en: ["Focused Light", "Your mind is gathering its focus. Follow the clear path one step at a time."] },
      { zh: ["深境專注", "穩定而集中的線條，提醒你相信持續累積的力量。"], en: ["Deep Focus", "Steady, concentrated lines remind you to trust the power of consistent effort."] }
    ],
    exploring: [
      { zh: ["未知花園", "你的線條充滿轉折與探索，今天可以允許自己多看一種可能。"], en: ["Unknown Garden", "Your lines are full of turns and discovery. Allow yourself to see one more possibility today."] },
      { zh: ["曲線漫遊", "你正在尋找新的路徑，不必急著立刻得到答案。"], en: ["Curved Journey", "You are exploring a new path. There is no need to find the answer immediately."] }
    ],
    gentle: [
      { zh: ["微光花語", "你的線條細緻而溫柔，今天也請用同樣的善意對待自己。"], en: ["Whispering Light", "Your lines are delicate and gentle. Offer yourself the same kindness today."] },
      { zh: ["柔彩呼吸", "輕柔的節奏提醒你，不必用力證明，也能持續成長。"], en: ["Soft-Color Breath", "A gentle rhythm reminds you that growth does not require proving yourself."] }
    ],
    intense: [
      { zh: ["熾光交響", "你的內在能量很強，先辨認最重要的感受，再決定下一步。"], en: ["Radiant Symphony", "Your inner energy is strong. Notice the most important feeling before choosing your next step."] },
      { zh: ["心潮迴響", "強烈的線條正在說話，給自己片刻停頓，聽見真正的需要。"], en: ["Echoing Tide", "Your strong lines are speaking. Pause for a moment and listen to what you truly need."] }
    ]
  };

  const colorMeanings = {
    "#7b61ff": { label: { zh: "直覺", en: "Intuition" }, hue: 255 },
    "#2f80ed": { label: { zh: "清晰", en: "Clarity" }, hue: 213 },
    "#18a999": { label: { zh: "平衡", en: "Balance" }, hue: 174 },
    "#f2c94c": { label: { zh: "明亮", en: "Brightness" }, hue: 46 },
    "#f2994a": { label: { zh: "溫暖", en: "Warmth" }, hue: 28 },
    "#eb5757": { label: { zh: "力量", en: "Strength" }, hue: 0 },
    "#e56bb3": { label: { zh: "柔情", en: "Tenderness" }, hue: 326 },
    "#30343f": { label: { zh: "沉靜", en: "Stillness" }, hue: 220 }
  };

  const translations = {
    zh: {
      home: "首頁",
      eyebrow: "5／10 秒心境靈感藝術",
      subtitle: "腦心畫",
      intro: "5／10 秒主創作＋10 秒完成作品，時間結束後自動分析，並可儲存原始手繪圖與 AI 心境藝術。",
      controlKicker: "創作設定",
      controlTitle: "跟著直覺，開始一筆",
      timeLeft: "剩餘時間",
      seconds: "秒",
      chooseColor: "選擇今日直覺色彩",
      beginCreate: "開始創作",
      start5: "開始 5 秒",
      start10: "開始 10 秒",
      finishNow: "提早完成",
      startOver: "重新開始",
      canvasKicker: "創作畫布",
      canvasTitle: "用手指或滑鼠自由畫畫",
      localOnly: "僅在本機",
      ready: "準備好了嗎？",
      overlayHint: "先選擇時間，再觸碰畫布開始",
      resultEyebrow: "今日心境靈感藝術",
      resultTitle: "你的今日心境靈感藝術",
      todayMood: "藝術靈感",
      speed: "線條速度",
      pressure: "觸控力度",
      curve: "曲線流動",
      energy: "畫面能量",
      saveAIMoodArt: "儲存 AI 心境藝術",
      saveOriginalDrawing: "儲存原始手繪圖",
      drawAgain: "再畫一次",
      saveGuide: "手機：按儲存按鈕後顯示圖片，長按圖片選擇「儲存到照片」；電腦：圖片會下載到 Downloads。",
      disclaimer: "此作品依線條特徵生成，僅供創意表達與自我覺察，不是心理、醫療或健康評估或診斷。",
      howTitle: "腦心畫如何運作？",
      step1Title: "選擇 5 秒或 10 秒",
      step1Text: "先選擇主創作時間：5 秒快速模式，或 10 秒細緻模式。",
      step2Title: "再多 10 秒完成作品",
      step2Text: "主創作時間結束後，系統再提供 10 秒完成作品；您也可按「提早完成」。",
      step3Title: "自動分析並可儲存兩種作品",
      step3Text: "時間結束後會自動分析，並可儲存原始手繪圖與 AI 心境藝術。",
      durationExplanation: "5 秒與 10 秒皆為創意互動選項，不代表經科學驗證的心理測量時間；作品僅供創意表達與自我覺察。",
      privacyTitle: "本機隱私模式",
      privacyText: "繪圖與分析只在您的瀏覽器中進行，不會自動上傳或由本網站保存。您可自行將作品儲存到手機或電腦。",
      pressureWaiting: "觸控壓力：等待偵測裝置能力",
      pressureReal: "觸控壓力：裝置已提供可變化的 PointerEvent 壓力資料",
      pressureTouch: "觸控力度：本裝置未提供可變壓力，已使用觸控面積與線條變化輔助估算",
      pressureMouse: "觸控力度：滑鼠不提供真實壓力，已使用線條速度與變化輔助估算",
      idleStatus: "請選擇「開始 5 秒」或「開始 10 秒」。",
      armedStatus: "已準備好，請在畫布上落下第一筆；倒數會從第一筆開始。",
      mainStatus: "主創作時間進行中，請自由畫畫。",
      extraStatus: "主創作時間已完成，還有 {seconds} 秒可完成作品。",
      generating: "創作時間結束，正在分析作品。",
      tooShort: "線條太少了，請再試一次並在畫布上多畫幾筆。",
      resultReady: "作品已完成。您可儲存原始手繪圖或 AI 心境藝術。",
      savePreviewTitle: "儲存到手機照片",
      savePreviewInstruction: "請長按下方圖片，再選擇「儲存到照片」或「下載圖片」。不同手機的選項名稱可能略有不同。",
      downloadFile: "下載 PNG 檔案",
      done: "完成",
      downloadArtDone: "AI 心境藝術已準備好；手機可長按圖片儲存，電腦可在 Downloads 查看。",
      downloadDrawingDone: "原始手繪圖已準備好；手機可長按圖片儲存，電腦可在 Downloads 查看。",
      downloadFailed: "無法準備圖片，請改用截圖儲存。",
      speedLevels: ["舒緩", "流動", "迅捷"],
      pressureLevels: ["輕柔", "適中", "鮮明"],
      curveLevels: ["簡潔", "柔和", "豐富"],
      energyLevels: ["靜謐", "平衡", "充沛"]
    },
    en: {
      home: "Home",
      eyebrow: "5 / 10-SECOND MOOD-INSPIRED ART",
      subtitle: "Mind Art",
      intro: "A 5- or 10-second main drawing period is followed by 10 more seconds to finish your work. When time is up, the system analyzes it automatically, and you can save both the original drawing and the AI mood artwork.",
      controlKicker: "Creative Setup",
      controlTitle: "Follow your intuition and begin a line",
      timeLeft: "Time left",
      seconds: "sec",
      chooseColor: "Choose today’s intuitive color",
      beginCreate: "Start Drawing",
      start5: "Start 5 Seconds",
      start10: "Start 10 Seconds",
      finishNow: "Finish Now",
      startOver: "Start Over",
      canvasKicker: "Creative Canvas",
      canvasTitle: "Draw freely with your finger or mouse",
      localOnly: "Local only",
      ready: "Ready?",
      overlayHint: "Choose a time, then touch the canvas to begin",
      resultEyebrow: "TODAY’S MOOD-INSPIRED ART",
      resultTitle: "Your Mood-Inspired Art Today",
      todayMood: "Art inspiration",
      speed: "Line speed",
      pressure: "Touch force",
      curve: "Curve flow",
      energy: "Visual energy",
      saveAIMoodArt: "Save AI Mood Artwork",
      saveOriginalDrawing: "Save Original Drawing",
      drawAgain: "Draw Again",
      saveGuide: "Mobile: after tapping a save button, long-press the image and choose Save to Photos or Download Image. Computer: the PNG downloads to Downloads.",
      disclaimer: "This artwork is generated from line features for creative expression and self-reflection only. It is not a psychological, medical, or health assessment or diagnosis.",
      howTitle: "How does it work?",
      step1Title: "Choose 5 seconds or 10 seconds",
      step1Text: "Choose a main drawing time first: a 5-second quick mode or a 10-second more detailed mode.",
      step2Title: "Then get 10 more seconds to finish",
      step2Text: "After the main drawing time ends, the system gives 10 more seconds to finish the artwork. You can also tap Finish Now.",
      step3Title: "Auto-analyze and save two kinds of work",
      step3Text: "When time is up, the system analyzes automatically, and you can save both the original drawing and the AI mood artwork.",
      durationExplanation: "The 5- and 10-second choices are creative interaction options, not scientifically validated psychological measurement durations. The artwork is for creative expression and self-reflection only.",
      privacyTitle: "Local Privacy Mode",
      privacyText: "Drawing and analysis take place only in your browser. Your work is not automatically uploaded or stored by this website. You may save it to your phone or computer.",
      pressureWaiting: "Touch pressure: waiting to detect device capability",
      pressureReal: "Touch pressure: this device provides variable PointerEvent pressure data",
      pressureTouch: "Touch force: this device does not provide variable pressure, so touch area and line variation are used as estimation support",
      pressureMouse: "Touch force: a mouse does not provide real pressure, so line speed and variation are used as estimation support",
      idleStatus: "Choose Start 5 Seconds or Start 10 Seconds.",
      armedStatus: "Ready. Touch the canvas to make your first stroke; the timer starts with that stroke.",
      mainStatus: "Main drawing time is in progress. Draw freely.",
      extraStatus: "Main drawing time is complete. You have {seconds} more seconds to finish the artwork.",
      generating: "Drawing time is over. Analyzing artwork...",
      tooShort: "Too few lines were captured. Please try again and draw a few more strokes.",
      resultReady: "Your artwork is ready. You may save the original drawing or the AI mood artwork.",
      savePreviewTitle: "Save to Photos",
      savePreviewInstruction: "Long-press the image below, then choose Save to Photos or Download Image. Wording may differ by phone and browser.",
      downloadFile: "Download PNG File",
      done: "Done",
      downloadArtDone: "The AI mood artwork is ready. On mobile, long-press the image to save it; on a computer, check Downloads.",
      downloadDrawingDone: "The original drawing is ready. On mobile, long-press the image to save it; on a computer, check Downloads.",
      downloadFailed: "Unable to prepare the image. Please use a screenshot to save it.",
      speedLevels: ["Calm", "Flowing", "Swift"],
      pressureLevels: ["Soft", "Balanced", "Strong"],
      curveLevels: ["Simple", "Smooth", "Rich"],
      energyLevels: ["Quiet", "Balanced", "Vibrant"]
    }
  };

  function t(key, vars = {}) {
    let str = translations[currentLanguage][key] || key;
    Object.keys(vars).forEach((name) => {
      str = str.replaceAll(`{${name}}`, String(vars[name]));
    });
    return str;
  }

  function setLanguage(lang) {
    currentLanguage = lang === "en" ? "en" : "zh";
    localStorage.setItem("aimind-language", currentLanguage);
    document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-Hant";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    langZhButton.classList.toggle("active", currentLanguage === "zh");
    langEnButton.classList.toggle("active", currentLanguage === "en");
    updatePressureNote();
    updateOverlayHint();
    if (lastAnalysis) applyAnalysisToUI(lastAnalysis);
    if (uiState === "idle") statusMessage.textContent = t("idleStatus");
    if (uiState === "armed") statusMessage.textContent = t("armedStatus");
  }

  function setSelectedColor(color) {
    selectedColor = color;
    localStorage.setItem("aimind-color", color);
    colorButtons.forEach((btn) => btn.classList.toggle("selected", btn.dataset.color === color));
  }

  function updateOverlayHint() {
    const overlaySpan = canvasOverlay.querySelector("span");
    if (overlaySpan) overlaySpan.textContent = t("overlayHint");
  }

  function updatePressureNote() {
    if (lastPointerType === "mouse") pressureNote.textContent = t("pressureMouse");
    else if (variablePressureObserved) pressureNote.textContent = t("pressureReal");
    else if (lastPointerType === "touch" || lastPointerType === "pen") pressureNote.textContent = t("pressureTouch");
    else pressureNote.textContent = t("pressureWaiting");
  }

  function resizeCanvasIfNeeded() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = drawingCanvas.getBoundingClientRect();
    const size = Math.max(300, Math.round(Math.min(rect.width || 900, rect.height || rect.width || 900) * dpr));
    if (drawingCanvas.width !== size || drawingCanvas.height !== size) {
      drawingCanvas.width = size;
      drawingCanvas.height = size;
      redrawDrawing();
    }
  }

  function clearDrawingSurface() {
    drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  }

  function redrawDrawing() {
    clearDrawingSurface();
    strokes.forEach((stroke) => {
      if (!stroke.points.length) return;
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      for (let i = 1; i < stroke.points.length; i += 1) {
        const a = stroke.points[i - 1];
        const b = stroke.points[i];
        const width = ((a.width || 4) + (b.width || 4)) / 2;
        drawCtx.strokeStyle = stroke.color;
        drawCtx.lineWidth = width;
        drawCtx.beginPath();
        drawCtx.moveTo(a.x, a.y);
        drawCtx.lineTo(b.x, b.y);
        drawCtx.stroke();
      }
      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        drawCtx.fillStyle = stroke.color;
        drawCtx.beginPath();
        drawCtx.arc(p.x, p.y, (p.width || 4) / 2, 0, TAU);
        drawCtx.fill();
      }
    });
  }

  function resetExperience() {
    cancelAnimationFrame(countdownFrame);
    uiState = "idle";
    currentPhase = "idle";
    drawingEnabled = false;
    pointerDown = false;
    currentStroke = null;
    strokes = [];
    points = [];
    pressureValues = [];
    variablePressureObserved = false;
    lastAnalysis = null;
    clearDrawingSurface();
    resultCard.classList.add("hidden");
    startModeActions.classList.remove("hidden");
    duringActions.classList.add("hidden");
    finishNowButton.disabled = false;
    canvasOverlay.classList.remove("hide");
    timerEl.textContent = "5 / 10";
    statusMessage.textContent = t("idleStatus");
    saveNotice.classList.remove("is-message");
    saveNotice.textContent = t("saveGuide");
    updatePressureNote();
  }

  function startExperience(seconds) {
    resetExperience();
    selectedMainSeconds = seconds;
    localStorage.setItem("aimind-main-duration", String(seconds));
    uiState = "armed";
    currentPhase = "armed";
    drawingEnabled = true;
    mainDuration = seconds;
    startModeActions.classList.add("hidden");
    duringActions.classList.remove("hidden");
    finishNowButton.disabled = true;
    timerEl.textContent = mainDuration.toFixed(1);
    statusMessage.textContent = t("armedStatus");
    canvasOverlay.classList.remove("hide");
    const overlayStrong = canvasOverlay.querySelector("strong");
    const overlaySpan = canvasOverlay.querySelector("span");
    if (overlayStrong) overlayStrong.textContent = currentLanguage === "zh" ? "觸碰畫布開始" : "Touch the canvas to begin";
    if (overlaySpan) overlaySpan.textContent = currentLanguage === "zh" ? `第一筆落下後開始 ${seconds} 秒倒數` : `The ${seconds}-second timer starts with your first stroke`;
    if (window.innerWidth <= 860) {
      drawingCanvas.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function beginTimedDrawing() {
    if (uiState !== "armed") return;
    uiState = "drawing";
    currentPhase = "main";
    countdownStart = performance.now();
    finishNowButton.disabled = false;
    canvasOverlay.classList.add("hide");
    statusMessage.textContent = t("mainStatus");
    tickCountdown();
  }

  function tickCountdown(now = performance.now()) {
    if (uiState !== "drawing") return;
    const elapsed = (now - countdownStart) / 1000;
    const totalDuration = mainDuration + EXTRA_SECONDS;

    if (elapsed < mainDuration) {
      currentPhase = "main";
      timerEl.textContent = Math.max(0, mainDuration - elapsed).toFixed(1);
      statusMessage.textContent = t("mainStatus");
      countdownFrame = requestAnimationFrame(tickCountdown);
      return;
    }

    if (elapsed < totalDuration) {
      currentPhase = "extra";
      const remainingExtra = Math.max(0, totalDuration - elapsed);
      timerEl.textContent = remainingExtra.toFixed(1);
      statusMessage.textContent = t("extraStatus", { seconds: EXTRA_SECONDS });
      countdownFrame = requestAnimationFrame(tickCountdown);
      return;
    }

    timerEl.textContent = "0.0";
    finishArtwork(true);
  }

  function finishArtwork(autoTriggered = false) {
    if (points.length < MIN_POINTS) {
      statusMessage.textContent = t("tooShort");
      if (autoTriggered) {
        drawingEnabled = false;
        duringActions.classList.add("hidden");
        startModeActions.classList.remove("hidden");
      }
      return;
    }
    cancelAnimationFrame(countdownFrame);
    uiState = "result";
    drawingEnabled = false;
    pointerDown = false;
    currentStroke = null;
    duringActions.classList.add("hidden");
    statusMessage.textContent = t("generating");
    const analysis = analyzeDrawing(points);
    lastAnalysis = analysis;
    generateArtwork(analysis, points);
    applyAnalysisToUI(analysis);
    resultCard.classList.remove("hidden");
    saveNotice.classList.remove("is-message");
    saveNotice.textContent = t("saveGuide");
    timerEl.textContent = "0.0";
    statusMessage.textContent = t("resultReady");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function analyzeDrawing(analysisPts) {
    let distance = 0;
    let timeDelta = 0;
    let angleChange = 0;
    let widthSum = 0;
    const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

    for (let i = 0; i < analysisPts.length; i += 1) {
      const p = analysisPts[i];
      box.minX = Math.min(box.minX, p.x);
      box.minY = Math.min(box.minY, p.y);
      box.maxX = Math.max(box.maxX, p.x);
      box.maxY = Math.max(box.maxY, p.y);
      widthSum += p.width || 4;
      if (i > 0) {
        const prev = analysisPts[i - 1];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        distance += Math.hypot(dx, dy);
        timeDelta += Math.max(1, p.t - prev.t);
      }
      if (i > 1) {
        const a = analysisPts[i - 2];
        const b = analysisPts[i - 1];
        const v1x = b.x - a.x, v1y = b.y - a.y;
        const v2x = p.x - b.x, v2y = p.y - b.y;
        const len1 = Math.hypot(v1x, v1y) || 1;
        const len2 = Math.hypot(v2x, v2y) || 1;
        const dot = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (len1 * len2)));
        angleChange += Math.acos(dot);
      }
    }

    const avgSpeed = distance / Math.max(1, timeDelta);
    const widthAvg = widthSum / Math.max(1, analysisPts.length);
    const area = Math.max(1, (box.maxX - box.minX) * (box.maxY - box.minY));
    const density = analysisPts.length / (area / 10000);
    const pressureAvg = pressureValues.length
      ? pressureValues.reduce((sum, value) => sum + value, 0) / pressureValues.length
      : Math.max(0.1, Math.min(1, widthAvg / 18));
    const curveValue = angleChange / Math.max(1, analysisPts.length - 2);
    const durationNormalizer = mainDuration === 10 ? 0.86 : 1;
    const energyScore = Math.max(0, Math.min(1, ((density / 12) * 0.55 + avgSpeed * 110 * 0.45) * durationNormalizer));

    const speedIndex = avgSpeed < 0.75 ? 0 : avgSpeed < 1.55 ? 1 : 2;
    const pressureIndex = pressureAvg < 0.34 ? 0 : pressureAvg < 0.62 ? 1 : 2;
    const curveIndex = curveValue < 0.4 ? 0 : curveValue < 0.85 ? 1 : 2;
    const energyIndex = energyScore < 0.33 ? 0 : energyScore < 0.66 ? 1 : 2;

    let moodKey = "calm";
    if (energyIndex === 2 && speedIndex === 2) moodKey = "intense";
    else if (speedIndex === 2 && curveIndex >= 1) moodKey = "lively";
    else if (curveIndex === 2 && speedIndex <= 1) moodKey = "exploring";
    else if (speedIndex <= 1 && pressureIndex === 0) moodKey = "gentle";
    else if (energyIndex <= 1 && curveIndex <= 1) moodKey = "calm";
    else moodKey = "focused";

    const moodOptions = moods[moodKey];
    const mood = moodOptions[(analysisPts.length + Math.round(avgSpeed * 10)) % moodOptions.length][currentLanguage];

    return {
      speedIndex,
      pressureIndex,
      curveIndex,
      energyIndex,
      moodName: mood[0],
      moodMessage: mood[1],
      avgSpeed,
      pressureAvg,
      curveValue,
      energyScore
    };
  }

  function applyAnalysisToUI(analysis) {
    moodName.textContent = analysis.moodName;
    moodMessage.textContent = analysis.moodMessage;
    speedMetric.textContent = translations[currentLanguage].speedLevels[analysis.speedIndex];
    pressureMetric.textContent = translations[currentLanguage].pressureLevels[analysis.pressureIndex];
    curveMetric.textContent = translations[currentLanguage].curveLevels[analysis.curveIndex];
    energyMetric.textContent = translations[currentLanguage].energyLevels[analysis.energyIndex];
  }

  function generateArtwork(analysis, fullPts) {
    const w = artCanvas.width;
    const h = artCanvas.height;
    const baseHue = colorMeanings[selectedColor]?.hue ?? 255;

    artCtx.clearRect(0, 0, w, h);
    const bg = artCtx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, `hsla(${baseHue}, 82%, 96%, 1)`);
    bg.addColorStop(1, `hsla(${(baseHue + 80) % 360}, 72%, 93%, 1)`);
    artCtx.fillStyle = bg;
    artCtx.fillRect(0, 0, w, h);

    for (let i = 0; i < 5; i += 1) {
      artCtx.beginPath();
      const hue = (baseHue + i * 28 + analysis.energyIndex * 10) % 360;
      const alpha = 0.08 + i * 0.03;
      const radius = 130 + i * 70 + analysis.curveIndex * 22;
      const x = w * (0.25 + (i % 3) * 0.24) + Math.sin(i + analysis.avgSpeed * 7) * 45;
      const y = h * (0.24 + Math.floor(i / 2) * 0.22) + Math.cos(i + analysis.curveValue) * 45;
      artCtx.fillStyle = `hsla(${hue}, 78%, 62%, ${alpha})`;
      artCtx.arc(x, y, radius, 0, TAU);
      artCtx.fill();
    }

    artCtx.save();
    artCtx.translate(w / 2, h / 2);
    const subset = fullPts.filter((_, index) => index % Math.max(1, Math.floor(fullPts.length / 260)) === 0);
    artCtx.lineCap = "round";
    artCtx.lineJoin = "round";
    subset.forEach((p, index) => {
      const prev = subset[Math.max(0, index - 1)] || p;
      const nx = (p.x / drawingCanvas.width - 0.5) * w * 0.8;
      const ny = (p.y / drawingCanvas.height - 0.5) * h * 0.8;
      const px = (prev.x / drawingCanvas.width - 0.5) * w * 0.8;
      const py = (prev.y / drawingCanvas.height - 0.5) * h * 0.8;
      const hue = (baseHue + index * 4 + analysis.curveIndex * 12) % 360;
      artCtx.strokeStyle = `hsla(${hue}, 82%, ${48 + (index % 5) * 6}%, ${0.12 + analysis.energyScore * 0.2})`;
      artCtx.lineWidth = 1.4 + (p.width || 4) * 0.8;
      artCtx.beginPath();
      artCtx.moveTo(px, py);
      artCtx.quadraticCurveTo((px + nx) / 2 + Math.sin(index) * 12, (py + ny) / 2 + Math.cos(index) * 12, nx, ny);
      artCtx.stroke();
    });
    artCtx.restore();

    const rings = 18 + analysis.energyIndex * 5;
    for (let i = 0; i < rings; i += 1) {
      const hue = (baseHue + i * 11) % 360;
      const alpha = 0.07 + analysis.curveIndex * 0.015;
      const radius = 80 + i * 22 + Math.sin(i + analysis.avgSpeed * 20) * 10;
      artCtx.strokeStyle = `hsla(${hue}, 80%, 58%, ${alpha})`;
      artCtx.lineWidth = 1.2 + (i % 3) * 0.55;
      artCtx.beginPath();
      artCtx.arc(w / 2 + Math.sin(i * 0.8) * 16, h / 2 + Math.cos(i * 0.7) * 16, radius, 0, TAU);
      artCtx.stroke();
    }

    artCtx.fillStyle = "rgba(255,255,255,.18)";
    for (let i = 0; i < 36; i += 1) {
      const x = ((i * 97) % w) + 8;
      const y = ((i * 163) % h) + 10;
      const r = 2 + (i % 4) * 1.8;
      artCtx.beginPath();
      artCtx.arc(x, y, r, 0, TAU);
      artCtx.fill();
    }
  }

  function getCanvasPoint(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function getNormalizedPressure(event) {
    if (typeof event.pressure === "number" && event.pressure > 0 && event.pressure <= 1) {
      variablePressureObserved = variablePressureObserved || event.pressure !== 0.5;
      pressureValues.push(event.pressure);
      return Math.max(0.12, event.pressure);
    }
    if (event.width && event.height) {
      const areaEstimate = Math.min(1, Math.max(0.1, ((event.width + event.height) / 2) / 30));
      pressureValues.push(areaEstimate);
      return areaEstimate;
    }
    pressureValues.push(0.42);
    return 0.42;
  }

  function addPoint(event) {
    if (!drawingEnabled || !pointerDown || !currentStroke) return;
    const { x, y } = getCanvasPoint(event);
    const pressure = getNormalizedPressure(event);
    const width = 2 + pressure * 10;
    const tNow = performance.now();
    const point = { x, y, pressure, width, t: tNow };

    const prev = currentStroke.points[currentStroke.points.length - 1];
    currentStroke.points.push(point);
    points.push(point);

    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";
    drawCtx.strokeStyle = currentStroke.color;
    drawCtx.lineWidth = width;
    if (prev) {
      drawCtx.beginPath();
      drawCtx.moveTo(prev.x, prev.y);
      drawCtx.lineTo(point.x, point.y);
      drawCtx.stroke();
    } else {
      drawCtx.fillStyle = currentStroke.color;
      drawCtx.beginPath();
      drawCtx.arc(point.x, point.y, width / 2, 0, TAU);
      drawCtx.fill();
    }
  }

  function beginStroke(event) {
    if (!drawingEnabled) return;
    if (event.cancelable) event.preventDefault();
    lastPointerType = event.pointerType || "unknown";
    updatePressureNote();
    if (uiState === "armed") beginTimedDrawing();
    pointerDown = true;
    currentStroke = { color: selectedColor, points: [] };
    strokes.push(currentStroke);
    try {
      if (typeof drawingCanvas.setPointerCapture === "function" && event.pointerId !== undefined) {
        drawingCanvas.setPointerCapture(event.pointerId);
      }
    } catch (_) {
      // Some mobile browsers reject pointer capture; drawing still works without it.
    }
    addPoint(event);
  }

  function moveStroke(event) {
    if (!pointerDown) return;
    if (event.cancelable) event.preventDefault();
    addPoint(event);
  }

  function endStroke(event) {
    if (!pointerDown) return;
    if (event.cancelable) event.preventDefault();
    pointerDown = false;
    currentStroke = null;
    try { drawingCanvas.releasePointerCapture(event.pointerId); } catch (_) {}
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to create PNG image"));
      }, "image/png");
    });
  }

  function isMobileLike() {
    return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 860;
  }

  function showSaveMessage(key) {
    saveNotice.classList.add("is-message");
    saveNotice.textContent = t(key);
  }

  function openSavePreview(canvas, filename, doneKey) {
    try {
      savePreviewImage.src = canvas.toDataURL("image/png");
      savePreviewImage.dataset.filename = filename;
      saveModal.classList.remove("hidden");
      document.body.classList.add("modal-open");
      showSaveMessage(doneKey);
    } catch (error) {
      console.error(error);
      showSaveMessage("downloadFailed");
    }
  }

  function closeSavePreview() {
    saveModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  async function downloadCanvas(canvas, filename, doneKey, forceDownload = false) {
    if (isMobileLike() && !forceDownload) {
      openSavePreview(canvas, filename, doneKey);
      return;
    }
    try {
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      showSaveMessage(doneKey);
    } catch (error) {
      console.error(error);
      showSaveMessage("downloadFailed");
    }
  }

  langZhButton.addEventListener("click", () => setLanguage("zh"));
  langEnButton.addEventListener("click", () => setLanguage("en"));
  colorButtons.forEach((btn) => btn.addEventListener("click", () => setSelectedColor(btn.dataset.color)));
  start5Button.addEventListener("click", () => startExperience(5));
  start10Button.addEventListener("click", () => startExperience(10));
  finishNowButton.addEventListener("click", () => finishArtwork(false));
  clearButton.addEventListener("click", resetExperience);
  drawAgainButton.addEventListener("click", resetExperience);
  downloadArtButton.addEventListener("click", () => downloadCanvas(artCanvas, `ai-mind-ai-mood-artwork-${Date.now()}.png`, "downloadArtDone"));
  downloadDrawingFromResultButton.addEventListener("click", () => downloadCanvas(drawingCanvas, `ai-mind-original-drawing-${Date.now()}.png`, "downloadDrawingDone"));

  saveModalClose.addEventListener("click", closeSavePreview);
  closePreviewButton.addEventListener("click", closeSavePreview);
  saveModalBackdrop.addEventListener("click", closeSavePreview);
  downloadPreviewButton.addEventListener("click", async () => {
    const src = savePreviewImage.src;
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = savePreviewImage.dataset.filename || `ai-mind-artwork-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !saveModal.classList.contains("hidden")) closeSavePreview();
  });

  if (window.PointerEvent) {
    drawingCanvas.addEventListener("pointerdown", beginStroke, { passive: false });
    drawingCanvas.addEventListener("pointermove", moveStroke, { passive: false });
    drawingCanvas.addEventListener("pointerup", endStroke, { passive: false });
    drawingCanvas.addEventListener("pointercancel", endStroke, { passive: false });
    drawingCanvas.addEventListener("pointerleave", (event) => {
      if (pointerDown && event.pointerType === "mouse") endStroke(event);
    });
  } else {
    const touchToPointerLike = (touch, originalEvent) => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      pointerType: "touch",
      pointerId: touch.identifier,
      pressure: touch.force || 0.5,
      width: touch.radiusX ? touch.radiusX * 2 : 10,
      height: touch.radiusY ? touch.radiusY * 2 : 10,
      cancelable: originalEvent.cancelable,
      preventDefault: () => originalEvent.preventDefault()
    });
    drawingCanvas.addEventListener("touchstart", (event) => {
      if (!event.changedTouches.length) return;
      beginStroke(touchToPointerLike(event.changedTouches[0], event));
    }, { passive: false });
    drawingCanvas.addEventListener("touchmove", (event) => {
      if (!event.changedTouches.length) return;
      moveStroke(touchToPointerLike(event.changedTouches[0], event));
    }, { passive: false });
    drawingCanvas.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0] || { clientX: 0, clientY: 0, identifier: 0 };
      endStroke(touchToPointerLike(touch, event));
    }, { passive: false });

    drawingCanvas.addEventListener("mousedown", (event) => beginStroke({
      clientX: event.clientX, clientY: event.clientY, pointerType: "mouse", pointerId: 1,
      pressure: 0.5, width: 1, height: 1, cancelable: event.cancelable,
      preventDefault: () => event.preventDefault()
    }));
    window.addEventListener("mousemove", (event) => moveStroke({
      clientX: event.clientX, clientY: event.clientY, pointerType: "mouse", pointerId: 1,
      pressure: 0.5, width: 1, height: 1, cancelable: event.cancelable,
      preventDefault: () => event.preventDefault()
    }));
    window.addEventListener("mouseup", (event) => endStroke({
      clientX: event.clientX, clientY: event.clientY, pointerType: "mouse", pointerId: 1,
      pressure: 0.5, width: 1, height: 1, cancelable: event.cancelable,
      preventDefault: () => event.preventDefault()
    }));
  }

  window.addEventListener("resize", resizeCanvasIfNeeded);

  setSelectedColor(selectedColor);
  resizeCanvasIfNeeded();
  setLanguage(currentLanguage);
  resetExperience();
})();
