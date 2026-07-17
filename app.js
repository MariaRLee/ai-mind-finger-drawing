'use strict';

(() => {
  const DURATION_MS = 5000;
  const MIN_POINTS_FOR_RESULT = 6;
  const TAU = Math.PI * 2;

  const drawingCanvas = document.getElementById('drawingCanvas');
  const artCanvas = document.getElementById('artCanvas');
  const drawCtx = drawingCanvas.getContext('2d', { alpha: true });
  const artCtx = artCanvas.getContext('2d', { alpha: false });

  const canvasFrame = document.getElementById('canvasFrame');
  const canvasOverlay = document.getElementById('canvasOverlay');
  const startButton = document.getElementById('startButton');
  const clearButton = document.getElementById('clearButton');
  const drawAgainButton = document.getElementById('drawAgainButton');
  const saveButton = document.getElementById('saveButton');
  const timerElement = document.getElementById('timer');
  const statusMessage = document.getElementById('statusMessage');
  const pressureNote = document.getElementById('pressureNote');
  const resultCard = document.getElementById('resultCard');
  const langZhButton = document.getElementById('langZh');
  const langEnButton = document.getElementById('langEn');

  const speedMetric = document.getElementById('speedMetric');
  const pressureMetric = document.getElementById('pressureMetric');
  const curveMetric = document.getElementById('curveMetric');
  const energyMetric = document.getElementById('energyMetric');
  const moodName = document.getElementById('moodName');
  const moodMessage = document.getElementById('moodMessage');

  let selectedColor = '#7b61ff';
  let currentLanguage = localStorage.getItem('aimind-language') === 'en' ? 'en' : 'zh';
  let uiState = 'idle';
  let lastAnalysis = null;
  let drawingEnabled = false;
  let pointerDown = false;
  let currentStroke = null;
  let strokes = [];
  let points = [];
  let startTime = 0;
  let timerFrame = 0;
  let finishTimer = 0;
  let observedPressureVariation = false;
  let observedPressureValues = [];
  let lastPointerType = 'unknown';

  const moods = {
    calm: [
      { zh: ['流光安定', '你正在慢慢回到自己的節奏，讓今天留一點空間給內心。'], en: ['Steady Light', 'You are gently returning to your own rhythm. Leave a little inner space for today.'] },
      { zh: ['柔波靜心', '你的線條帶著柔和的流動，今天適合穩穩地前進。'], en: ['Gentle Wave', 'Your lines carry a soft flow. Today is a good day to move forward steadily.'] },
      { zh: ['清風留白', '安靜不是停下，而是為下一步整理出更清楚的方向。'], en: ['Quiet Breeze', 'Stillness is not stopping; it creates a clearer direction for your next step.'] }
    ],
    lively: [
      { zh: ['躍動星河', '你的能量正在向外延伸，把這份活力用在最重要的事情上。'], en: ['Dancing Galaxy', 'Your energy is reaching outward. Use this vitality for what matters most today.'] },
      { zh: ['彩光奔流', '今天的你充滿推進力，也別忘了在速度中保留呼吸。'], en: ['Flowing Color', 'You have strong momentum today. Remember to leave room to breathe within the pace.'] },
      { zh: ['晴日飛舞', '你的線條帶著明亮行動感，適合勇敢展開新的嘗試。'], en: ['Bright-Day Dance', 'Your lines feel bright and active, inviting you to begin something new with courage.'] }
    ],
    focused: [
      { zh: ['凝光軌跡', '你的心正在聚焦，沿著清楚的方向一步一步完成。'], en: ['Focused Light', 'Your mind is gathering its focus. Follow the clear path one step at a time.'] },
      { zh: ['深境專注', '穩定而集中的線條，提醒你相信持續累積的力量。'], en: ['Deep Focus', 'Steady, concentrated lines remind you to trust the power of consistent effort.'] },
      { zh: ['靜定之弧', '你正把分散的思緒收回來，專注會帶你走得更遠。'], en: ['Arc of Stillness', 'You are gathering scattered thoughts. Focus can carry you further.'] }
    ],
    exploring: [
      { zh: ['未知花園', '你的線條充滿轉折與探索，今天可以允許自己多看一種可能。'], en: ['Unknown Garden', 'Your lines are full of turns and discovery. Allow yourself to see one more possibility today.'] },
      { zh: ['曲線漫遊', '你正在尋找新的路徑，不必急著立刻得到答案。'], en: ['Curved Journey', 'You are exploring a new path. There is no need to find the answer immediately.'] },
      { zh: ['心象航線', '每一次轉向都可能是新的發現，保持好奇，也照顧自己的步調。'], en: ['Inner Voyage', 'Every turn may reveal something new. Stay curious while caring for your own pace.'] }
    ],
    intense: [
      { zh: ['熾光交響', '你的內在能量很強，先辨認最重要的感受，再決定下一步。'], en: ['Radiant Symphony', 'Your inner energy is strong. Notice the most important feeling before choosing your next step.'] },
      { zh: ['烈焰流線', '今天的情緒力量鮮明，把能量轉成清楚而溫柔的行動。'], en: ['Flame Current', 'Your emotional energy is vivid today. Turn it into clear and gentle action.'] },
      { zh: ['心潮迴響', '強烈的線條正在說話，給自己片刻停頓，聽見真正的需要。'], en: ['Echoing Tide', 'Your strong lines are speaking. Pause for a moment and listen to what you truly need.'] }
    ],
    gentle: [
      { zh: ['微光花語', '你的線條細緻而溫柔，今天也請用同樣的善意對待自己。'], en: ['Whispering Light', 'Your lines are delicate and gentle. Offer yourself the same kindness today.'] },
      { zh: ['柔彩呼吸', '輕柔的節奏提醒你，不必用力證明，也能持續成長。'], en: ['Soft-Color Breath', 'A gentle rhythm reminds you that growth does not require proving yourself.'] },
      { zh: ['晨霧心景', '你正在細細感受世界，保持敏銳，也記得守護自己的界線。'], en: ['Morning Mist', 'You are sensing the world with care. Stay receptive while protecting your boundaries.'] }
    ]
  };

  const colorMeanings = {
    '#7b61ff': { label: { zh: '直覺', en: 'Intuition' }, hue: 255 },
    '#2f80ed': { label: { zh: '清晰', en: 'Clarity' }, hue: 213 },
    '#18a999': { label: { zh: '平衡', en: 'Balance' }, hue: 174 },
    '#f2c94c': { label: { zh: '明亮', en: 'Brightness' }, hue: 46 },
    '#f2994a': { label: { zh: '溫暖', en: 'Warmth' }, hue: 28 },
    '#eb5757': { label: { zh: '力量', en: 'Strength' }, hue: 0 },
    '#e56bb3': { label: { zh: '柔情', en: 'Tenderness' }, hue: 326 },
    '#30343f': { label: { zh: '沉靜', en: 'Stillness' }, hue: 220 }
  };

  const translations = {
    zh: {
      home: '首頁', eyebrow: '五秒心境藝術', subtitle: '腦心畫',
      intro: '不用畫畫技巧。選一個顏色，手指自由畫 5 秒，生成你的今日心境藝術。',
      timeLeft: '剩餘時間', seconds: '秒', chooseColor: '選擇今日直覺色彩', reset: '重新開始',
      ready: '準備好了嗎？', overlayHint: '按上方開始鍵後，自由畫 5 秒',
      resultEyebrow: '今日心境藝術', resultTitle: '你的今日心境藝術', todayMood: '今日心境',
      speed: '線條速度', pressure: '觸控力度', curve: '曲線流動', energy: '畫面能量',
      drawAgain: '再畫一次', saveArt: '儲存今日藝術',
      disclaimer: '此結果為藝術化自我覺察體驗，不是心理、醫療或健康診斷。',
      howTitle: '腦心畫如何運作？', step1Title: '手指畫 5 秒', step1Text: '跟隨當下直覺，自由移動、停頓或轉彎。',
      step2Title: '分析線條特徵', step2Text: '在本機分析速度、曲線、密度、顏色與裝置可提供的觸控資料。',
      step3Title: '生成心境藝術', step3Text: '將你的線條轉化為每天不同的個人化抽象作品。',
      privacyTitle: '本機隱私模式', privacyText: '繪圖與分析只在您的瀏覽器中進行，不會上傳、儲存或提供給第三方。',
      idleStatus: '按「開始畫 5 秒」，再在畫布上自由畫。', pressureWaiting: '觸控壓力：等待偵測裝置能力',
      start: '開始畫 5 秒', drawing: '請在畫布上畫…', drawingStatus: '開始！跟著直覺自由移動手指。',
      completed: '分析完成', tooShort: '線條太少了，請再試一次並在畫布上多畫幾筆。', retry: '再試一次',
      generating: '完成！正在生成你的今日心境藝術。',
      pressureReal: '觸控壓力：裝置已提供可變化的 PointerEvent 壓力資料',
      pressureTouch: '觸控力度：本裝置未提供可變壓力，已使用觸控面積與線條變化輔助估算',
      pressurePen: '觸控力度：手寫筆壓力變化有限，已搭配線條變化分析',
      pressureMouse: '觸控力度：滑鼠不提供真實壓力，已使用線條速度與變化輔助估算',
      speedLevels: ['舒緩', '流動', '迅捷'], pressureLevels: ['輕柔', '適中', '鮮明'],
      curveLevels: ['簡潔', '柔和', '豐富'], energyLevels: ['靜謐', '平衡', '充沛'],
      colors: { purple: '紫色', blue: '藍色', green: '綠色', yellow: '黃色', orange: '橙色', red: '紅色', pink: '粉紅色', charcoal: '深灰色' }
    },
    en: {
      home: 'Home', eyebrow: '5-SECOND MIND ART', subtitle: 'Mind Art',
      intro: 'No drawing skill needed. Choose a color, draw freely for 5 seconds, and create your mood art of the day.',
      timeLeft: 'Time left', seconds: 'sec', chooseColor: "Choose today's intuitive color", reset: 'Reset',
      ready: 'Ready?', overlayHint: 'Tap Start above, then draw freely for 5 seconds',
      resultEyebrow: "TODAY'S MIND ART", resultTitle: 'Your Mind Art Today', todayMood: "Today's mood", 
      speed: 'Line speed', pressure: 'Touch force', curve: 'Curve flow', energy: 'Visual energy',
      drawAgain: 'Draw again', saveArt: 'Save artwork',
      disclaimer: 'This is an artistic self-awareness experience, not a psychological, medical, or health diagnosis.',
      howTitle: 'How does it work?', step1Title: 'Draw for 5 seconds', step1Text: 'Follow your intuition as you move, pause, or turn.',
      step2Title: 'Analyze line features', step2Text: 'Speed, curves, density, color, and available touch data are analyzed locally.',
      step3Title: 'Create mind art', step3Text: 'Your lines become a different personalized abstract artwork each day.',
      privacyTitle: 'Local Privacy Mode', privacyText: 'Drawing and analysis stay in your browser. Nothing is uploaded, stored, or shared with third parties.',
      idleStatus: 'Tap “Start 5-Second Drawing,” then draw freely on the canvas.', pressureWaiting: 'Touch pressure: waiting to detect device capability',
      start: 'Start 5-Second Drawing', drawing: 'Draw on the canvas…', drawingStatus: 'Start! Move your finger freely and follow your intuition.',
      completed: 'Analysis complete', tooShort: 'There are too few lines. Please try again and draw a little more.', retry: 'Try again',
      generating: 'Done! Creating your mind art of the day.',
      pressureReal: 'Touch pressure: the device provided variable PointerEvent pressure data',
      pressureTouch: 'Touch force: variable pressure was unavailable, so contact area and line changes were used as supporting estimates',
      pressurePen: 'Touch force: stylus pressure variation was limited, so line changes were also analyzed',
      pressureMouse: 'Touch force: a mouse does not provide real pressure, so line speed and variation were used as supporting estimates',
      speedLevels: ['Gentle', 'Flowing', 'Quick'], pressureLevels: ['Light', 'Moderate', 'Strong'],
      curveLevels: ['Simple', 'Soft', 'Rich'], energyLevels: ['Quiet', 'Balanced', 'Vibrant'],
      colors: { purple: 'Purple', blue: 'Blue', green: 'Green', yellow: 'Yellow', orange: 'Orange', red: 'Red', pink: 'Pink', charcoal: 'Charcoal' }
    }
  };

  function t(key) {
    return translations[currentLanguage][key];
  }

  function updatePressureText(analysis) {
    if (!analysis) {
      pressureNote.textContent = t('pressureWaiting');
    } else if (analysis.hasRealPressure) {
      pressureNote.textContent = t('pressureReal');
    } else if (analysis.pointerType === 'touch') {
      pressureNote.textContent = t('pressureTouch');
    } else if (analysis.pointerType === 'pen') {
      pressureNote.textContent = t('pressurePen');
    } else {
      pressureNote.textContent = t('pressureMouse');
    }
  }

  function syncDynamicText() {
    if (uiState === 'drawing') {
      startButton.textContent = t('drawing');
      statusMessage.textContent = t('drawingStatus');
    } else if (uiState === 'tooShort') {
      startButton.textContent = t('retry');
      statusMessage.textContent = t('tooShort');
    } else if (uiState === 'completed') {
      startButton.textContent = t('completed');
      statusMessage.textContent = t('generating');
    } else {
      startButton.textContent = t('start');
      statusMessage.textContent = t('idleStatus');
    }
    updatePressureText(lastAnalysis);
  }

  function setLanguage(language) {
    currentLanguage = language === 'en' ? 'en' : 'zh';
    localStorage.setItem('aimind-language', currentLanguage);
    document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'zh-Hant';
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (translations[currentLanguage][key] !== undefined) element.textContent = translations[currentLanguage][key];
    });
    document.querySelectorAll('.color-dot').forEach(dot => {
      const key = dot.dataset.colorKey;
      dot.setAttribute('aria-label', translations[currentLanguage].colors[key] || key);
    });
    langZhButton.classList.toggle('active', currentLanguage === 'zh');
    langEnButton.classList.toggle('active', currentLanguage === 'en');
    langZhButton.setAttribute('aria-pressed', String(currentLanguage === 'zh'));
    langEnButton.setAttribute('aria-pressed', String(currentLanguage === 'en'));
    syncDynamicText();
    if (lastAnalysis && !resultCard.classList.contains('hidden')) renderResult(lastAnalysis, false);
  }


  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resetCanvasVisual() {
    drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
  }

  function resetExperience({ hideResult = true } = {}) {
    cancelAnimationFrame(timerFrame);
    clearTimeout(finishTimer);
    drawingEnabled = false;
    pointerDown = false;
    currentStroke = null;
    strokes = [];
    points = [];
    startTime = 0;
    observedPressureVariation = false;
    observedPressureValues = [];
    lastPointerType = 'unknown';
    timerElement.textContent = '5.0';
    uiState = 'idle';
    lastAnalysis = null;
    statusMessage.textContent = t('idleStatus');
    pressureNote.textContent = t('pressureWaiting');
    canvasOverlay.classList.remove('hide');
    startButton.disabled = false;
    startButton.textContent = t('start');
    clearButton.disabled = false;
    resetCanvasVisual();
    if (hideResult) resultCard.classList.add('hidden');
  }

  function beginSession() {
    resetExperience({ hideResult: true });
    drawingEnabled = true;
    uiState = 'drawing';
    startTime = performance.now();
    startButton.disabled = true;
    clearButton.disabled = true;
    startButton.textContent = t('drawing');
    statusMessage.textContent = t('drawingStatus');
    canvasOverlay.classList.add('hide');
    updateTimer();
    finishTimer = window.setTimeout(finishSession, DURATION_MS + 30);
  }

  function updateTimer() {
    if (!drawingEnabled) return;
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, DURATION_MS - elapsed);
    timerElement.textContent = (remaining / 1000).toFixed(1);
    if (remaining > 0) timerFrame = requestAnimationFrame(updateTimer);
  }

  function finishSession() {
    if (!drawingEnabled) return;
    drawingEnabled = false;
    pointerDown = false;
    cancelAnimationFrame(timerFrame);
    timerElement.textContent = '0.0';
    uiState = 'completed';
    startButton.textContent = t('completed');
    clearButton.disabled = false;

    if (points.length < MIN_POINTS_FOR_RESULT) {
      uiState = 'tooShort';
      statusMessage.textContent = t('tooShort');
      startButton.disabled = false;
      startButton.textContent = t('retry');
      canvasOverlay.classList.remove('hide');
      return;
    }

    statusMessage.textContent = t('generating');
    const analysis = analyzeDrawing();
    lastAnalysis = analysis;
    renderResult(analysis);
    window.setTimeout(() => {
      resultCard.classList.remove('hidden');
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);
  }

  function getCanvasPoint(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * drawingCanvas.width,
      y: ((event.clientY - rect.top) / rect.height) * drawingCanvas.height
    };
  }

  function deriveContact(event) {
    const rawPressure = Number.isFinite(event.pressure) ? event.pressure : 0;
    const contactArea = Math.sqrt(Math.max(1, (event.width || 1) * (event.height || 1)));
    const contactNormalized = clamp((contactArea - 1) / 28, 0, 1);

    if (rawPressure > 0 && rawPressure < 1) {
      observedPressureValues.push(rawPressure);
      if (observedPressureValues.length > 2) {
        const min = Math.min(...observedPressureValues);
        const max = Math.max(...observedPressureValues);
        observedPressureVariation = max - min > 0.035;
      }
    }

    return {
      rawPressure,
      contactNormalized,
      effectivePressure: observedPressureVariation ? rawPressure : clamp(0.34 + contactNormalized * 0.42, 0.25, 0.82)
    };
  }

  function recordPoint(event) {
    if (!drawingEnabled) return null;
    const position = getCanvasPoint(event);
    const contact = deriveContact(event);
    lastPointerType = event.pointerType || 'unknown';

    const point = {
      x: position.x,
      y: position.y,
      t: performance.now() - startTime,
      pressure: contact.effectivePressure,
      rawPressure: contact.rawPressure,
      contact: contact.contactNormalized,
      pointerType: lastPointerType,
      color: selectedColor
    };
    points.push(point);
    currentStroke?.push(point);
    return point;
  }

  function drawSegment(previous, current) {
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const dt = Math.max(8, current.t - previous.t);
    const velocity = Math.hypot(dx, dy) / dt;
    const speedThin = clamp(1.12 - velocity * 0.5, 0.48, 1.12);
    const pressureWidth = lerp(7, 29, current.pressure);
    const lineWidth = pressureWidth * speedThin;

    drawCtx.strokeStyle = rgba(selectedColor, 0.88);
    drawCtx.lineWidth = lineWidth;
    drawCtx.shadowColor = rgba(selectedColor, 0.22);
    drawCtx.shadowBlur = 9;
    drawCtx.beginPath();
    drawCtx.moveTo(previous.x, previous.y);
    drawCtx.lineTo(current.x, current.y);
    drawCtx.stroke();
    drawCtx.shadowBlur = 0;
  }

  function onPointerDown(event) {
    if (!drawingEnabled) return;
    event.preventDefault();
    pointerDown = true;
    currentStroke = [];
    strokes.push(currentStroke);
    try { drawingCanvas.setPointerCapture(event.pointerId); } catch (_) { /* Optional enhancement. */ }
    recordPoint(event);
  }

  function onPointerMove(event) {
    if (!drawingEnabled || !pointerDown || !currentStroke) return;
    event.preventDefault();
    const previous = currentStroke[currentStroke.length - 1];
    const current = recordPoint(event);
    if (previous && current) drawSegment(previous, current);
  }

  function onPointerEnd(event) {
    if (!pointerDown) return;
    event.preventDefault();
    pointerDown = false;
    currentStroke = null;
    try { drawingCanvas.releasePointerCapture(event.pointerId); } catch (_) { /* Pointer may already be released. */ }
  }

  function analyzeDrawing() {
    let totalDistance = 0;
    let totalActiveTime = 0;
    let turnSum = 0;
    let turnCount = 0;
    let directionChanges = 0;
    let lastTurnSign = 0;
    const pressures = [];
    const contacts = [];

    let minX = drawingCanvas.width;
    let maxX = 0;
    let minY = drawingCanvas.height;
    let maxY = 0;

    for (const stroke of strokes) {
      if (!stroke.length) continue;
      for (const point of stroke) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
        pressures.push(point.pressure);
        contacts.push(point.contact);
      }

      for (let i = 1; i < stroke.length; i += 1) {
        const a = stroke[i - 1];
        const b = stroke[i];
        totalDistance += Math.hypot(b.x - a.x, b.y - a.y);
        totalActiveTime += Math.max(0, b.t - a.t);
      }

      for (let i = 2; i < stroke.length; i += 1) {
        const a = stroke[i - 2];
        const b = stroke[i - 1];
        const c = stroke[i];
        const angle1 = Math.atan2(b.y - a.y, b.x - a.x);
        const angle2 = Math.atan2(c.y - b.y, c.x - b.x);
        let delta = angle2 - angle1;
        while (delta > Math.PI) delta -= TAU;
        while (delta < -Math.PI) delta += TAU;
        const magnitude = Math.abs(delta);
        if (magnitude > 0.04) {
          turnSum += magnitude;
          turnCount += 1;
          const sign = Math.sign(delta);
          if (lastTurnSign && sign !== lastTurnSign && magnitude > 0.16) directionChanges += 1;
          lastTurnSign = sign;
        }
      }
    }

    const normalizedSpeed = clamp((totalDistance / Math.max(totalActiveTime, 1)) / 1.5, 0, 1);
    const avgPressure = pressures.reduce((sum, value) => sum + value, 0) / Math.max(pressures.length, 1);
    const avgContact = contacts.reduce((sum, value) => sum + value, 0) / Math.max(contacts.length, 1);
    const avgTurn = turnCount ? turnSum / turnCount : 0;
    const curvature = clamp(avgTurn / 0.72, 0, 1);
    const complexity = clamp((directionChanges / Math.max(points.length, 1)) * 16 + curvature * 0.45, 0, 1);

    const widthCoverage = clamp((maxX - minX) / drawingCanvas.width, 0, 1);
    const heightCoverage = clamp((maxY - minY) / drawingCanvas.height, 0, 1);
    const coverage = clamp(Math.sqrt(widthCoverage * heightCoverage), 0, 1);
    const strokeContinuity = clamp(1 - (strokes.length - 1) / 11, 0, 1);
    const density = clamp(totalDistance / (drawingCanvas.width * 5.2), 0, 1);
    const energy = clamp(normalizedSpeed * 0.38 + density * 0.27 + coverage * 0.2 + avgPressure * 0.15, 0, 1);

    let category = 'exploring';
    if (energy > 0.73 && avgPressure > 0.52) category = 'intense';
    else if (normalizedSpeed > 0.66 && coverage > 0.48) category = 'lively';
    else if (normalizedSpeed < 0.38 && curvature < 0.54) category = 'calm';
    else if (strokeContinuity > 0.72 && complexity < 0.52) category = 'focused';
    else if (avgPressure < 0.44 && normalizedSpeed < 0.58) category = 'gentle';

    const date = new Date();
    const seed = Math.floor(totalDistance + turnSum * 100 + avgPressure * 1000) +
      date.getFullYear() * 13 + (date.getMonth() + 1) * 31 + date.getDate() * 97;
    const variants = moods[category];
    const selectedMood = variants[Math.abs(seed) % variants.length];

    return {
      seed,
      category,
      mood: selectedMood,
      color: selectedColor,
      colorLabel: colorMeanings[selectedColor]?.label?.[currentLanguage] || (currentLanguage === 'en' ? 'Intuition' : '直覺'),
      normalizedSpeed,
      avgPressure,
      avgContact,
      curvature,
      complexity,
      coverage,
      density,
      strokeContinuity,
      energy,
      totalDistance,
      hasRealPressure: observedPressureVariation,
      pointerType: lastPointerType,
      strokes: strokes.map(stroke => stroke.map(point => ({ ...point })))
    };
  }

  function descriptor(value, levels) {
    if (value < 0.34) return levels[0];
    if (value < 0.67) return levels[1];
    return levels[2];
  }

  function renderResult(analysis, redrawArt = true) {
    const localizedMood = analysis.mood[currentLanguage];
    moodName.textContent = localizedMood[0];
    moodMessage.textContent = localizedMood[1];
    speedMetric.textContent = descriptor(analysis.normalizedSpeed, t('speedLevels'));
    pressureMetric.textContent = descriptor(analysis.avgPressure, t('pressureLevels'));
    curveMetric.textContent = descriptor(analysis.curvature, t('curveLevels'));
    energyMetric.textContent = descriptor(analysis.energy, t('energyLevels'));
    updatePressureText(analysis);
    if (redrawArt) generateArt(analysis);
  }

  function generateArt(analysis) {
    const width = artCanvas.width;
    const height = artCanvas.height;
    const random = seededRandom(analysis.seed);
    const base = analysis.color;
    const hue = colorMeanings[base]?.hue ?? 255;

    const gradient = artCtx.createRadialGradient(
      width * (0.25 + random() * 0.25),
      height * (0.2 + random() * 0.25),
      width * 0.04,
      width * 0.5,
      height * 0.5,
      width * 0.86
    );
    gradient.addColorStop(0, `hsl(${(hue + 26) % 360} 95% 96%)`);
    gradient.addColorStop(0.48, `hsl(${hue} 85% 94%)`);
    gradient.addColorStop(1, `hsl(${(hue + 315) % 360} 68% 88%)`);
    artCtx.fillStyle = gradient;
    artCtx.fillRect(0, 0, width, height);

    artCtx.save();
    artCtx.globalCompositeOperation = 'screen';
    const glowCount = 8 + Math.round(analysis.energy * 12);
    for (let i = 0; i < glowCount; i += 1) {
      const x = random() * width;
      const y = random() * height;
      const radius = width * (0.05 + random() * (0.12 + analysis.coverage * 0.12));
      const glow = artCtx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `hsla(${(hue + i * 17) % 360} 95% 70% / ${0.16 + random() * 0.2})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      artCtx.fillStyle = glow;
      artCtx.beginPath();
      artCtx.arc(x, y, radius, 0, TAU);
      artCtx.fill();
    }
    artCtx.restore();

    const scaleX = width / drawingCanvas.width;
    const scaleY = height / drawingCanvas.height;
    const copies = 2 + Math.round(analysis.complexity * 3);

    for (let copy = copies - 1; copy >= 0; copy -= 1) {
      artCtx.save();
      artCtx.translate(width / 2, height / 2);
      const rotation = (copy - (copies - 1) / 2) * (0.035 + analysis.curvature * 0.09);
      artCtx.rotate(rotation);
      const scale = 0.93 + copy * 0.025;
      artCtx.scale(scale, scale);
      artCtx.translate(-width / 2, -height / 2);
      artCtx.globalAlpha = copy === 0 ? 0.88 : 0.12 + analysis.energy * 0.07;
      artCtx.globalCompositeOperation = copy === 0 ? 'source-over' : 'multiply';
      artCtx.lineCap = 'round';
      artCtx.lineJoin = 'round';
      artCtx.shadowColor = rgba(base, 0.28);
      artCtx.shadowBlur = 18 + analysis.energy * 24;

      for (const stroke of analysis.strokes) {
        if (stroke.length < 2) continue;
        artCtx.beginPath();
        const first = stroke[0];
        artCtx.moveTo(first.x * scaleX, first.y * scaleY);
        for (let i = 1; i < stroke.length - 1; i += 1) {
          const point = stroke[i];
          const next = stroke[i + 1];
          const midX = ((point.x + next.x) / 2) * scaleX;
          const midY = ((point.y + next.y) / 2) * scaleY;
          artCtx.quadraticCurveTo(point.x * scaleX, point.y * scaleY, midX, midY);
        }
        const last = stroke[stroke.length - 1];
        artCtx.lineTo(last.x * scaleX, last.y * scaleY);
        artCtx.strokeStyle = copy === 0 ? rgba(base, 0.78) : `hsla(${(hue + copy * 24) % 360} 72% 48% / .5)`;
        artCtx.lineWidth = (11 + analysis.avgPressure * 30) * (copy === 0 ? 1 : 0.75 + copy * 0.12);
        artCtx.stroke();
      }
      artCtx.restore();
    }

    artCtx.save();
    artCtx.globalCompositeOperation = 'screen';
    const particleCount = 34 + Math.round(analysis.density * 85);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 2 + random() * (5 + analysis.energy * 10);
      const x = random() * width;
      const y = random() * height;
      artCtx.fillStyle = `hsla(${(hue + random() * 72 - 36 + 360) % 360} 96% 72% / ${0.18 + random() * 0.42})`;
      artCtx.beginPath();
      artCtx.arc(x, y, radius, 0, TAU);
      artCtx.fill();
    }
    artCtx.restore();

    artCtx.save();
    const vignette = artCtx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.72);
    vignette.addColorStop(0, 'rgba(255,255,255,0)');
    vignette.addColorStop(1, 'rgba(45,31,70,.13)');
    artCtx.fillStyle = vignette;
    artCtx.fillRect(0, 0, width, height);
    artCtx.restore();

    artCtx.save();
    artCtx.fillStyle = 'rgba(255,255,255,.72)';
    artCtx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    artCtx.textAlign = 'right';
    artCtx.fillText('AI-Mind Finger Drawing · 腦心畫', width - 42, height - 42);
    artCtx.restore();
  }

  function downloadArt() {
    const link = document.createElement('a');
    const date = new Date();
    const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    link.download = `AI-Mind-Finger-Drawing-${stamp}.png`;
    link.href = artCanvas.toDataURL('image/png');
    link.click();
    link.remove();
  }

  document.getElementById('palette').addEventListener('click', (event) => {
    const button = event.target.closest('.color-dot');
    if (!button || drawingEnabled) return;
    document.querySelectorAll('.color-dot').forEach(dot => {
      const selected = dot === button;
      dot.classList.toggle('selected', selected);
      dot.setAttribute('aria-checked', String(selected));
    });
    selectedColor = button.dataset.color;
  });

  drawingCanvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  drawingCanvas.addEventListener('pointermove', onPointerMove, { passive: false });
  drawingCanvas.addEventListener('pointerup', onPointerEnd, { passive: false });
  drawingCanvas.addEventListener('pointercancel', onPointerEnd, { passive: false });
  drawingCanvas.addEventListener('contextmenu', event => event.preventDefault());

  langZhButton.addEventListener('click', () => setLanguage('zh'));
  langEnButton.addEventListener('click', () => setLanguage('en'));

  startButton.addEventListener('click', beginSession);
  clearButton.addEventListener('click', () => resetExperience({ hideResult: true }));
  drawAgainButton.addEventListener('click', () => {
    resetExperience({ hideResult: true });
    window.scrollTo({ top: canvasFrame.offsetTop - 110, behavior: 'smooth' });
  });
  saveButton.addEventListener('click', downloadArt);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && drawingEnabled) finishSession();
  });

  setLanguage(currentLanguage);
  resetExperience({ hideResult: true });
})();
