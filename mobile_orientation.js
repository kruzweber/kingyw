(function () {
  const BASE_W = 1180;
  const BASE_H = 664;
  const root = document.documentElement;

  function viewportSize() {
    const viewport = window.visualViewport;
    return {
      width: viewport?.width || window.innerWidth,
      height: viewport?.height || window.innerHeight
    };
  }

  function isPhoneLike() {
    const { width, height } = viewportSize();
    const shortSide = Math.min(width, height);
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    return coarse && shortSide <= 760;
  }

  function shouldRotate() {
    const { width, height } = viewportSize();
    return isPhoneLike() && height > width;
  }

  function applyMobileOrientation() {
    const { width, height } = viewportSize();
    const rotate = shouldRotate();
    root.classList.toggle("phone-rotate", rotate);
    root.classList.toggle("phone-landscape", isPhoneLike() && !rotate);

    if (rotate) {
      const scale = Math.min(width / BASE_H, height / BASE_W) * 0.985;
      root.style.setProperty("--game-scale", String(Math.max(0.1, scale)));
      return;
    }

    if (isPhoneLike()) {
      const scale = Math.min(width / BASE_W, height / BASE_H) * 0.985;
      root.style.setProperty("--game-scale", String(Math.max(0.1, scale)));
    }
  }

  async function requestImmersiveMode() {
    if (!isPhoneLike()) return;

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch (_) {}

    try {
      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (_) {}

    window.setTimeout(applyMobileOrientation, 120);
  }

  function installStyles() {
    if (document.getElementById("mobileOrientationStyle")) return;
    const style = document.createElement("style");
    style.id = "mobileOrientationStyle";
    style.textContent = `
      html.phone-rotate,
      html.phone-rotate body {
        width: 100%;
        height: 100%;
        overflow: hidden !important;
        touch-action: none;
      }

      html.phone-rotate *,
      html.phone-landscape * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      html.phone-rotate button,
      html.phone-landscape button,
      html.phone-rotate canvas,
      html.phone-landscape canvas,
      html.phone-rotate img,
      html.phone-landscape img,
      html.phone-rotate .game-frame,
      html.phone-landscape .game-frame {
        touch-action: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }

      html.phone-rotate body {
        display: block !important;
        background: #101522;
      }

      html.phone-rotate .game-frame {
        position: fixed !important;
        left: 50% !important;
        top: 50% !important;
        width: calc(${BASE_W}px * var(--game-scale)) !important;
        height: calc(${BASE_H}px * var(--game-scale)) !important;
        transform: translate(-50%, -50%) rotate(90deg) !important;
        transform-origin: center center !important;
      }

      html.phone-landscape,
      html.phone-landscape body {
        overflow: hidden !important;
        touch-action: none;
      }
    `;
    document.head.appendChild(style);
  }

  window.MobileOrientation = {
    refresh: applyMobileOrientation,
    requestImmersiveMode
  };

  try {
    installStyles();
    window.addEventListener("resize", applyMobileOrientation);
    window.addEventListener("orientationchange", () => window.setTimeout(applyMobileOrientation, 80));
    window.visualViewport?.addEventListener("resize", applyMobileOrientation);
    window.addEventListener("load", applyMobileOrientation);
    document.addEventListener("click", requestImmersiveMode, { once: true, passive: true });
    document.addEventListener("touchstart", requestImmersiveMode, { once: true, passive: true });
    applyMobileOrientation();
  } catch (error) {
    window.MobileOrientation.error = error?.message || String(error);
  }
}());
