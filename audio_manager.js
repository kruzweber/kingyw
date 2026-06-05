(function () {
  const audioFiles = {
    bgm: {},
    ambience: {
      home: "./assets/audio/ambience/home_room.mp3",
      shop: "./assets/audio/ambience/shop_room.mp3",
      dex: "./assets/audio/ambience/dex_room.mp3",
      fresh: "./assets/audio/ambience/fresh_water.mp3",
      valley: "./assets/audio/ambience/valley_water.mp3",
      sea: "./assets/audio/ambience/sea_waves_gulls.mp3",
      ocean: "./assets/audio/ambience/ocean_wind_waves.mp3"
    },
    sfx: {
      click: "./assets/audio/sfx/click.wav",
      confirm: "./assets/audio/sfx/confirm.wav",
      tab: "./assets/audio/sfx/tab.wav",
      buy: "./assets/audio/sfx/buy.wav",
      denied: "./assets/audio/sfx/denied.wav",
      splash: "./assets/audio/sfx/splash.wav",
      biteTap: "./assets/audio/sfx/bite_tap.wav",
      biteStrong: "./assets/audio/sfx/bite_strong.wav",
      reel: "./assets/audio/sfx/reel.wav",
      tensionDanger: "./assets/audio/sfx/tension_danger.wav",
      catchSuccess: "./assets/audio/sfx/catch_success.wav",
      miss: "./assets/audio/sfx/miss.wav",
      junk: "./assets/audio/sfx/junk.wav",
      title: "./assets/audio/sfx/title.wav",
      event: "./assets/audio/sfx/event.wav",
      rare: "./assets/audio/sfx/rare.wav"
    },
    voice: {
      cast: "./assets/audio/voice/youngwoo/cast.wav",
      bite: "./assets/audio/voice/youngwoo/bite.wav",
      bigFish: "./assets/audio/voice/youngwoo/big_fish.wav",
      success: "./assets/audio/voice/youngwoo/success.wav",
      miss: "./assets/audio/voice/youngwoo/miss.wav",
      panic: "./assets/audio/voice/youngwoo/panic.wav"
    }
  };

  const state = {
    ctx: null,
    unlocked: false,
    master: null,
    bgmGain: null,
    ambienceGain: null,
    sfxGain: null,
    voiceGain: null,
    currentBgm: null,
    currentAmbience: null,
    fileCache: new Map(),
    loops: new Map(),
    lastPlayed: new Map()
  };

  const volumes = {
    master: 0.75,
    bgm: 0.22,
    ambience: 0.28,
    sfx: 0.58,
    voice: 0.62
  };

  function init() {
    if (state.ctx) return state.ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    state.ctx = new AudioContext();
    state.master = state.ctx.createGain();
    state.bgmGain = state.ctx.createGain();
    state.ambienceGain = state.ctx.createGain();
    state.sfxGain = state.ctx.createGain();
    state.voiceGain = state.ctx.createGain();
    state.master.gain.value = volumes.master;
    state.bgmGain.gain.value = volumes.bgm;
    state.ambienceGain.gain.value = volumes.ambience;
    state.sfxGain.gain.value = volumes.sfx;
    state.voiceGain.gain.value = volumes.voice;
    state.bgmGain.connect(state.master);
    state.ambienceGain.connect(state.master);
    state.sfxGain.connect(state.master);
    state.voiceGain.connect(state.master);
    state.master.connect(state.ctx.destination);
    return state.ctx;
  }

  function unlock() {
    const ctx = init();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    state.unlocked = true;
  }

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, unlock, { once: true, passive: true });
  });

  function now() {
    return state.ctx?.currentTime || 0;
  }

  function setGain(gain, value, ramp = 0.08) {
    if (!gain || !state.ctx) return;
    gain.gain.cancelScheduledValues(now());
    gain.gain.setTargetAtTime(value, now(), ramp);
  }

  function tone(freq, duration, options = {}) {
    const ctx = init();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const target = options.target || state.sfxGain;
    osc.type = options.type || "square";
    osc.frequency.setValueAtTime(freq, now());
    if (options.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, options.to), now() + duration);
    gain.gain.setValueAtTime(0.0001, now());
    gain.gain.exponentialRampToValueAtTime(options.volume || 0.22, now() + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now() + duration);
    osc.connect(gain);
    gain.connect(target);
    osc.start(now());
    osc.stop(now() + duration + 0.02);
  }

  function noise(duration, options = {}) {
    const ctx = init();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = options.filter || "lowpass";
    filter.frequency.value = options.freq || 900;
    gain.gain.setValueAtTime(options.volume || 0.18, now());
    gain.gain.exponentialRampToValueAtTime(0.0001, now() + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(options.target || state.sfxGain);
    source.start(now());
    source.stop(now() + duration);
  }

  function tryFile(kind, id, { loop = false, gain = null } = {}) {
    const src = audioFiles[kind]?.[id];
    if (!src) return null;
    const key = `${kind}:${id}`;
    let audio = state.fileCache.get(key);
    if (!audio) {
      audio = new Audio(src);
      audio.preload = "auto";
      audio.loop = loop;
      audio.volume = gain ?? volumes[kind] ?? 0.5;
      state.fileCache.set(key, audio);
      audio.addEventListener("error", () => {
        state.fileCache.delete(key);
      }, { once: true });
    }
    if (audio.readyState < 2) {
      audio.load();
      return null;
    }
    const play = audio.play();
    if (play?.catch) play.catch(() => {});
    return audio;
  }

  function stopFile(audio) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  function makeLoop(id, builder, targetGain) {
    const ctx = init();
    if (!ctx) return null;
    const loopGain = ctx.createGain();
    loopGain.gain.value = 0;
    loopGain.connect(targetGain);
    const handles = builder(loopGain).filter(Boolean);
    return { id, gain: loopGain, handles };
  }

  function stopLoop(type) {
    const loop = state.loops.get(type);
    if (!loop) return;
    setGain(loop.gain, 0, 0.12);
    setTimeout(() => {
      loop.handles.forEach((handle) => {
        try { handle.stop?.(); } catch (error) {}
      });
      state.loops.delete(type);
    }, 260);
  }

  function ambienceLoop(id, target) {
    const handles = [];
    const water = state.ctx.createOscillator();
    const gain = state.ctx.createGain();
    water.type = "sine";
    water.frequency.value = id === "sea" || id === "ocean" ? 82 : 118;
    gain.gain.value = id === "sea" || id === "ocean" ? 0.045 : 0.028;
    water.connect(gain);
    gain.connect(target);
    water.start();
    handles.push(water);
    const interval = setInterval(() => {
      if (!state.loops.has("ambience")) return;
      if (id === "sea" || id === "ocean") {
        noise(0.45, { target, volume: 0.055, freq: 620 });
        if (Math.random() < 0.38) {
          tone(randPick([1180, 1320, 1480]), 0.16, { target, type: "sine", volume: 0.045, to: randPick([880, 960]) });
        }
      } else if (id === "fresh" || id === "valley") {
        noise(0.2, { target, volume: 0.028, freq: 1300 });
        if (Math.random() < 0.28) tone(randPick([920, 1080, 1220]), 0.08, { target, type: "triangle", volume: 0.025 });
      }
    }, id === "ocean" ? 1900 : 2600);
    handles.push({ stop: () => clearInterval(interval) });
    return handles;
  }

  function randPick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function playBgm(id) {
    stopLoop("bgm");
    stopFile(state.currentBgm?.file);
    state.currentBgm = null;
  }

  function playAmbience(id) {
    unlock();
    if (state.currentAmbience?.id === id) return;
    stopLoop("ambience");
    stopFile(state.currentAmbience?.file);
    const file = tryFile("ambience", id, { loop: true, gain: volumes.ambience });
    state.currentAmbience = { id, file };
    if (file) return;
    const loop = makeLoop(id, (target) => ambienceLoop(id, target), state.ambienceGain);
    if (loop) {
      state.loops.set("ambience", loop);
      setGain(loop.gain, 0.55, 0.18);
    }
  }

  function cooldown(id, ms = 90) {
    const t = performance.now();
    if (t - (state.lastPlayed.get(id) || 0) < ms) return false;
    state.lastPlayed.set(id, t);
    return true;
  }

  function playSfx(id) {
    unlock();
    if (!cooldown(`sfx:${id}`, id === "reel" ? 180 : 70)) return;
    if (tryFile("sfx", id, { gain: volumes.sfx })) return;
    const map = {
      click: () => tone(520, 0.045, { volume: 0.11, to: 360 }),
      confirm: () => { tone(620, 0.055, { volume: 0.13 }); tone(880, 0.06, { volume: 0.09 }); },
      tab: () => tone(460, 0.05, { volume: 0.1, type: "triangle", to: 680 }),
      buy: () => { tone(680, 0.08, { volume: 0.12 }); setTimeout(() => tone(980, 0.1, { volume: 0.12 }), 70); },
      denied: () => tone(180, 0.18, { volume: 0.16, type: "sawtooth", to: 110 }),
      cast: () => noise(0.18, { volume: 0.12, freq: 1800 }),
      splash: () => noise(0.28, { volume: 0.18, freq: 740 }),
      biteTap: () => tone(820, 0.04, { volume: 0.13, type: "triangle" }),
      biteStrong: () => { tone(180, 0.08, { volume: 0.18, type: "sawtooth", to: 90 }); noise(0.12, { volume: 0.12, freq: 520 }); },
      reel: () => noise(0.12, { volume: 0.08, freq: 1600 }),
      tensionDanger: () => tone(240, 0.12, { volume: 0.14, type: "sawtooth" }),
      catchSuccess: () => { tone(620, 0.08, { volume: 0.14 }); setTimeout(() => tone(980, 0.12, { volume: 0.13 }), 90); },
      miss: () => tone(260, 0.2, { volume: 0.15, to: 120 }),
      junk: () => { noise(0.12, { volume: 0.12, freq: 950 }); tone(420, 0.08, { volume: 0.08 }); },
      title: () => { tone(720, 0.1, { volume: 0.13 }); setTimeout(() => tone(1080, 0.16, { volume: 0.14 }), 100); },
      event: () => { noise(0.18, { volume: 0.14, freq: 520 }); tone(520, 0.16, { volume: 0.11 }); },
      rare: () => { tone(220, 0.1, { volume: 0.16, type: "sawtooth" }); setTimeout(() => tone(740, 0.18, { volume: 0.14, type: "triangle" }), 90); }
    };
    (map[id] || map.click)();
  }

  function playVoice(id) {
    unlock();
    if (!cooldown(`voice:${id}`, 700)) return;
    if (tryFile("voice", id, { gain: volumes.voice })) return;
    const phrases = {
      cast: [420, 560],
      bite: [520, 680, 610],
      bigFish: [360, 520, 760],
      success: [620, 820, 980],
      miss: [330, 260],
      panic: [760, 520, 380]
    }[id] || [460, 560];
    phrases.forEach((freq, index) => {
      setTimeout(() => tone(freq, 0.07, { target: state.voiceGain, volume: 0.09, type: "triangle" }), index * 82);
    });
  }

  function setScene(scene, detail = "") {
    const sceneMap = {
      home: "home",
      shop: "shop",
      dex: "dex",
      fresh: "fresh",
      valley: "valley",
      sea: "sea",
      ocean: "ocean"
    };
    const ambience = sceneMap[detail] || sceneMap[scene] || sceneMap.home;
    playAmbience(ambience);
  }

  function installGlobalUiSounds(root = document) {
    root.addEventListener("click", (event) => {
      const button = event.target.closest?.("button");
      if (!button || button.disabled) return;
      if (button.matches("[data-tab], .tab")) playSfx("tab");
      else playSfx("click");
    }, true);
  }

  window.GameAudio = {
    init,
    unlock,
    playBgm,
    playAmbience,
    playSfx,
    playVoice,
    setScene,
    installGlobalUiSounds
  };
}());
