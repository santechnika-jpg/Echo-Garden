(function () {
  "use strict";

  const CACHE_BEST_KEY = "echoGardenBestRound";
  const initialLength = 3;
  const plants = Array.from(document.querySelectorAll(".plant"));
  const garden = document.getElementById("garden");
  const stateText = document.getElementById("stateText");
  const messagePanel = document.getElementById("messagePanel");
  const roundValue = document.getElementById("roundValue");
  const lengthValue = document.getElementById("lengthValue");
  const bestValue = document.getElementById("bestValue");
  const startButton = document.getElementById("startButton");
  const replayButton = document.getElementById("replayButton");
  const pauseButton = document.getElementById("pauseButton");
  const resetButton = document.getElementById("resetButton");
  const soundToggle = document.getElementById("soundToggle");
  const canvas = document.getElementById("ambientCanvas");
  const ctx = canvas.getContext("2d");

  const tones = [329.63, 392.0, 493.88, 587.33, 659.25, 739.99];
  const state = {
    mode: "intro",
    sequence: [],
    inputIndex: 0,
    round: 0,
    best: Number(localStorage.getItem(CACHE_BEST_KEY) || "0"),
    soundEnabled: true,
    audioReady: false,
    audioContext: null,
    masterGain: null,
    pausedBefore: "intro",
    animationStart: performance.now(),
    particles: [],
    fireflies: [],
    stars: []
  };

  function init() {
    bestValue.textContent = String(state.best);
    lengthValue.textContent = String(initialLength);
    setPlantsEnabled(false);
    resizeCanvas();
    seedAmbient();
    updateStageClass();
    bindEvents();
    requestAnimationFrame(drawAmbient);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      });
    }
  }

  function bindEvents() {
    startButton.addEventListener("click", startGame);
    replayButton.addEventListener("click", replaySequence);
    pauseButton.addEventListener("click", togglePause);
    resetButton.addEventListener("click", resetGame);
    soundToggle.addEventListener("click", toggleSound);
    window.addEventListener("resize", resizeCanvas);

    plants.forEach((plant) => {
      plant.addEventListener("click", () => {
        handlePlantInput(Number(plant.dataset.plant));
      });
    });
  }

  function ensureAudio() {
    if (state.audioReady || !state.soundEnabled) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      state.soundEnabled = false;
      updateSoundButton();
      return;
    }

    state.audioContext = new AudioContext();
    state.masterGain = state.audioContext.createGain();
    state.masterGain.gain.value = 0.26;
    state.masterGain.connect(state.audioContext.destination);
    state.audioReady = true;
  }

  function playTone(index, soft) {
    if (!state.soundEnabled) {
      return;
    }

    ensureAudio();
    if (!state.audioContext || !state.masterGain) {
      return;
    }

    const now = state.audioContext.currentTime;
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    const filter = state.audioContext.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(tones[index], now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1450, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(soft ? 0.12 : 0.18, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(state.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  function playMistakeTone() {
    if (!state.soundEnabled) {
      return;
    }

    ensureAudio();
    if (!state.audioContext || !state.masterGain) {
      return;
    }

    const now = state.audioContext.currentTime;
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    osc.connect(gain);
    gain.connect(state.masterGain);
    osc.start(now);
    osc.stop(now + 0.34);
  }

  function startGame() {
    ensureAudio();
    state.sequence = randomSequence(initialLength);
    state.inputIndex = 0;
    state.round = 1;
    setMode("playback");
    startButton.textContent = "Iš naujo";
    startButton.setAttribute("aria-label", "Pradėti iš naujo");
    pauseButton.disabled = false;
    updateStats();
    showMessage("Sodas rodo pavyzdį. Stebėk šviesą ir ritmą.");
    playSequence();
  }

  function resetGame() {
    state.sequence = [];
    state.inputIndex = 0;
    state.round = 0;
    setMode("intro");
    setPlantsEnabled(false);
    replayButton.disabled = true;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pauzė";
    startButton.textContent = "Pradėti";
    startButton.setAttribute("aria-label", "Pradėti žaidimą");
    updateStats();
    showMessage("Pradžia: 3 impulsai. Kiekvienas teisingas raundas prideda dar vieną aidą.");
  }

  function replaySequence() {
    if (!state.sequence.length || state.mode === "playback" || state.mode === "paused") {
      return;
    }
    setMode("playback");
    state.inputIndex = 0;
    showMessage("Pakartoju tą pačią sodo melodiją.");
    playSequence();
  }

  function togglePause() {
    if (state.mode === "intro") {
      return;
    }

    if (state.mode === "paused") {
      pauseButton.textContent = "Pauzė";
      if (state.pausedBefore === "playback") {
        setMode("playback");
        showMessage("Tęsiame nuo sekos rodymo.");
        playSequence();
        return;
      }

      setMode(state.pausedBefore);
      showMessage(state.mode === "input" ? "Gali spausti augalus." : "Tęsiame sodą.");
      setPlantsEnabled(state.mode === "input");
      return;
    }

    state.pausedBefore = state.mode;
    setMode("paused");
    setPlantsEnabled(false);
    pauseButton.textContent = "Tęsti";
    showMessage("Žaidimas pristabdytas.");
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    updateSoundButton();
    if (state.soundEnabled) {
      ensureAudio();
      playTone(0, true);
    }
  }

  function handlePlantInput(index) {
    if (state.mode !== "input") {
      return;
    }

    ensureAudio();
    activatePlant(index, false);

    if (index !== state.sequence[state.inputIndex]) {
      handleMistake();
      return;
    }

    state.inputIndex += 1;
    if (state.inputIndex >= state.sequence.length) {
      handleSuccess();
    } else {
      showMessage(`Teisingai. Liko ${state.sequence.length - state.inputIndex}.`);
    }
  }

  function handleSuccess() {
    setMode("success");
    setPlantsEnabled(false);
    state.best = Math.max(state.best, state.round);
    localStorage.setItem(CACHE_BEST_KEY, String(state.best));
    document.body.classList.add("success-glow");
    showMessage("Sodas atsakė šviesa. Naujas impulsas prisijungia prie sekos.");
    updateStats();

    setTimeout(() => {
      document.body.classList.remove("success-glow");
      state.round += 1;
      state.sequence.push(randomPlantIndex());
      state.inputIndex = 0;
      updateStats();
      setMode("playback");
      showMessage("Stebėk naują ilgesnę melodiją.");
      playSequence();
    }, 920);
  }

  function handleMistake() {
    setMode("mistake");
    setPlantsEnabled(false);
    playMistakeTone();
    document.body.classList.add("mistake-flash");
    showMessage("Švelnus nukrypimas. Ta pati seka grįžta dar kartą.");

    setTimeout(() => {
      document.body.classList.remove("mistake-flash");
      state.inputIndex = 0;
      setMode("playback");
      playSequence();
    }, 980);
  }

  function playSequence() {
    setPlantsEnabled(false);
    replayButton.disabled = true;
    let step = 0;

    const next = () => {
      if (state.mode !== "playback") {
        return;
      }

      if (step >= state.sequence.length) {
        state.inputIndex = 0;
        setMode("input");
        setPlantsEnabled(true);
        replayButton.disabled = false;
        showMessage("Dabar tavo eilė. Paliesk augalus ta pačia seka.");
        return;
      }

      activatePlant(state.sequence[step], true);
      step += 1;
      setTimeout(next, 620);
    };

    setTimeout(next, 420);
  }

  function activatePlant(index, soft) {
    const plant = plants[index];
    if (!plant) {
      return;
    }

    plant.classList.remove("active");
    void plant.offsetWidth;
    plant.classList.add("active");
    playTone(index, soft);
    addLightTrail(plant);

    setTimeout(() => {
      plant.classList.remove("active");
    }, 460);
  }

  function addLightTrail(plant) {
    const plantRect = plant.getBoundingClientRect();
    const x = plantRect.left + plantRect.width / 2;
    const y = plantRect.top + plantRect.height / 2;
    state.particles.push({
      x,
      y,
      age: 0,
      life: 820,
      radius: 8 + Math.random() * 5,
      color: getComputedStyle(plant).getPropertyValue("--accent").trim()
    });
  }

  function setMode(mode) {
    state.mode = mode;
    updateStageClass();
  }

  function updateStageClass() {
    document.body.classList.toggle("is-showing", state.mode === "playback");
    document.body.classList.toggle("is-input", state.mode === "input");
    document.body.classList.toggle("paused", state.mode === "paused");
    document.body.classList.toggle("level-5", state.best >= 5 || state.round >= 5);
    document.body.classList.toggle("level-10", state.best >= 10 || state.round >= 10);
    document.body.classList.toggle("level-15", state.best >= 15 || state.round >= 15);

    const labels = {
      intro: "Paliesk „Pradėti“ ir įsimink sodo aidą.",
      playback: "Sodas rodo seką.",
      input: "Tavo eilė atkartoti seką.",
      success: "Raundas pavyko.",
      mistake: "Seka kartojama.",
      paused: "Žaidimas pristabdytas."
    };
    stateText.textContent = labels[state.mode] || labels.intro;
  }

  function updateStats() {
    roundValue.textContent = String(state.round);
    lengthValue.textContent = String(state.sequence.length || initialLength);
    bestValue.textContent = String(state.best);
    updateStageClass();
  }

  function updateSoundButton() {
    soundToggle.textContent = state.soundEnabled ? "Garsas įj." : "Garsas išj.";
    soundToggle.setAttribute("aria-label", state.soundEnabled ? "Išjungti garsą" : "Įjungti garsą");
    soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
  }

  function showMessage(text) {
    messagePanel.textContent = text;
  }

  function setPlantsEnabled(enabled) {
    plants.forEach((plant) => {
      plant.disabled = !enabled;
    });
  }

  function randomSequence(length) {
    return Array.from({ length }, randomPlantIndex);
  }

  function randomPlantIndex() {
    return Math.floor(Math.random() * plants.length);
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedAmbient();
  }

  function seedAmbient() {
    const width = window.innerWidth || 360;
    const height = window.innerHeight || 720;
    const level = Math.max(state.best, state.round);
    const starCount = level >= 5 ? 58 : 34;
    const flyCount = level >= 10 ? 9 : 4;

    state.stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.72,
      size: 0.7 + Math.random() * 1.6,
      pulse: Math.random() * Math.PI * 2
    }));

    state.fireflies = Array.from({ length: flyCount }, () => ({
      x: Math.random() * width,
      y: height * (0.18 + Math.random() * 0.64),
      speed: 0.15 + Math.random() * 0.22,
      drift: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? "rgba(242,207,115," : "rgba(126,230,168,"
    }));
  }

  function drawAmbient(now) {
    const width = window.innerWidth || 360;
    const height = window.innerHeight || 720;
    ctx.clearRect(0, 0, width, height);

    drawStars(now);
    drawMist(now, width, height);
    drawFireflies(now, width, height);
    drawParticles(now);

    requestAnimationFrame(drawAmbient);
  }

  function drawStars(now) {
    state.stars.forEach((star) => {
      const alpha = 0.18 + Math.sin(now / 1200 + star.pulse) * 0.12;
      ctx.fillStyle = `rgba(214, 247, 226, ${Math.max(0.08, alpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMist(now, width, height) {
    const level = Math.max(state.best, state.round);
    if (level < 10) {
      return;
    }

    for (let i = 0; i < 3; i += 1) {
      const x = ((now * 0.012 * (i + 1)) % (width + 260)) - 130;
      const y = height * (0.34 + i * 0.17);
      const gradient = ctx.createRadialGradient(x, y, 20, x, y, 180);
      gradient.addColorStop(0, "rgba(196, 241, 221, 0.055)");
      gradient.addColorStop(1, "rgba(196, 241, 221, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, 190, 54, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFireflies(now, width, height) {
    state.fireflies.forEach((fly, index) => {
      fly.drift += 0.006 + index * 0.0004;
      fly.x += fly.speed;
      fly.y += Math.sin(fly.drift) * 0.18;
      if (fly.x > width + 20) {
        fly.x = -20;
        fly.y = height * (0.18 + Math.random() * 0.64);
      }

      const alpha = 0.2 + Math.sin(now / 460 + index) * 0.14;
      ctx.fillStyle = `${fly.color}${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(fly.x, fly.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawParticles(now) {
    const last = state.lastParticleFrame || now;
    const delta = Math.min(40, now - last);
    state.lastParticleFrame = now;

    state.particles = state.particles.filter((particle) => {
      particle.age += delta;
      const progress = particle.age / particle.life;
      if (progress >= 1) {
        return false;
      }

      const alpha = (1 - progress) * 0.22;
      const radius = particle.radius + progress * 34;
      ctx.strokeStyle = particle.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      return true;
    });
  }

  init();
})();
