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

  const speedMetric = document.getElementById('speedMetric');
  const pressureMetric = document.getElementById('pressureMetric');
  const curveMetric = document.getElementById('curveMetric');
  const energyMetric = document.getElementById('energyMetric');
  const moodName = document.getElementById('moodName');
  const moodMessage = document.getElementById('moodMessage');

  let selectedColor = '#7b61ff';
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
      ['流光安定', '你正在慢慢回到自己的節奏，讓今天留一點空間給內心。'],
      ['柔波靜心', '你的線條帶著柔和的流動，今天適合穩穩地前進。'],
      ['清風留白', '安靜不是停下，而是為下一步整理出更清楚的方向。']
    ],
    lively: [
      ['躍動星河', '你的能量正在向外延伸，把這份活力用在最重要的事情上。'],
      ['彩光奔流', '今天的你充滿推進力，也別忘了在速度中保留呼吸。'],
      ['晴日飛舞', '你的線條帶著明亮行動感，適合勇敢展開新的嘗試。']
    ],
    focused: [
      ['凝光軌跡', '你的心正在聚焦，沿著清楚的方向一步一步完成。'],
      ['深境專注', '穩定而集中的線條，提醒你相信持續累積的力量。'],
      ['靜定之弧', '你正把分散的思緒收回來，專注會帶你走得更遠。']
    ],
    exploring: [
      ['未知花園', '你的線條充滿轉折與探索，今天可以允許自己多看一種可能。'],
      ['曲線漫遊', '你正在尋找新的路徑，不必急著立刻得到答案。'],
      ['心象航線', '每一次轉向都可能是新的發現，保持好奇，也照顧自己的步調。']
    ],
    intense: [
      ['熾光交響', '你的內在能量很強，先辨認最重要的感受，再決定下一步。'],
      ['烈焰流線', '今天的情緒力量鮮明，把能量轉成清楚而溫柔的行動。'],
      ['心潮迴響', '強烈的線條正在說話，給自己片刻停頓，聽見真正的需要。']
    ],
    gentle: [
      ['微光花語', '你的線條細緻而溫柔，今天也請用同樣的善意對待自己。'],
      ['柔彩呼吸', '輕柔的節奏提醒你，不必用力證明，也能持續成長。'],
      ['晨霧心景', '你正在細細感受世界，保持敏銳，也記得守護自己的界線。']
    ]
  };

  const colorMeanings = {
    '#7b61ff': { label: '直覺', hue: 255 },
    '#2f80ed': { label: '清晰', hue: 213 },
    '#18a999': { label: '平衡', hue: 174 },
    '#f2c94c': { label: '明亮', hue: 46 },
    '#f2994a': { label: '溫暖', hue: 28 },
    '#eb5757': { label: '力量', hue: 0 },
    '#e56bb3': { label: '柔情', hue: 326 },
    '#30343f': { label: '沉靜', hue: 220 }
  };

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
    statusMessage.textContent = '按「開始畫 5 秒」後，用手指在畫布上自由畫。';
    pressureNote.textContent = '觸控壓力：等待偵測裝置能力';
    canvasOverlay.classList.remove('hide');
    startButton.disabled = false;
    startButton.textContent = '開始畫 5 秒';
    clearButton.disabled = false;
    resetCanvasVisual();
    if (hideResult) resultCard.classList.add('hidden');
  }

  function beginSession() {
    resetExperience({ hideResult: true });
    drawingEnabled = true;
    startTime = performance.now();
    startButton.disabled = true;
    clearButton.disabled = true;
    startButton.textContent = '請在畫布上畫…';
    statusMessage.textContent = '開始！跟著直覺自由移動手指。';
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
    startButton.textContent = '分析完成';
    clearButton.disabled = false;

    if (points.length < MIN_POINTS_FOR_RESULT) {
      statusMessage.textContent = '線條太少了，請再試一次並在畫布上多畫幾筆。';
      startButton.disabled = false;
      startButton.textContent = '再試一次';
      canvasOverlay.classList.remove('hide');
      return;
    }

    statusMessage.textContent = '完成！正在生成你的今日心境藝術。';
    const analysis = analyzeDrawing();
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
      name: selectedMood[0],
      message: selectedMood[1],
      color: selectedColor,
      colorLabel: colorMeanings[selectedColor]?.label || '直覺',
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

  function renderResult(analysis) {
    moodName.textContent = analysis.name;
    moodMessage.textContent = analysis.message;
    speedMetric.textContent = descriptor(analysis.normalizedSpeed, ['舒緩', '流動', '迅捷']);
    pressureMetric.textContent = descriptor(analysis.avgPressure, ['輕柔', '適中', '鮮明']);
    curveMetric.textContent = descriptor(analysis.curvature, ['簡潔', '柔和', '豐富']);
    energyMetric.textContent = descriptor(analysis.energy, ['靜謐', '平衡', '充沛']);

    if (analysis.hasRealPressure) {
      pressureNote.textContent = '觸控壓力：裝置已提供可變化的 PointerEvent 壓力資料';
    } else if (analysis.pointerType === 'touch') {
      pressureNote.textContent = '觸控力度：本裝置未提供可變壓力，已使用觸控面積與線條變化輔助估算';
    } else if (analysis.pointerType === 'pen') {
      pressureNote.textContent = '觸控力度：手寫筆壓力變化有限，已搭配線條變化分析';
    } else {
      pressureNote.textContent = '觸控力度：滑鼠不提供真實壓力，已使用線條速度與變化輔助估算';
    }

    generateArt(analysis);
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

  resetExperience({ hideResult: true });
})();
