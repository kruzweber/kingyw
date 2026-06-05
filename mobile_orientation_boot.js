(function () {
  const BASE_W = 1180;
  const BASE_H = 664;
  const root = document.documentElement;

  function size() {
    const viewport = window.visualViewport;
    return {
      width: viewport?.width || window.innerWidth || screen.width,
      height: viewport?.height || window.innerHeight || screen.height
    };
  }

  function phoneLike(width, height) {
    const shortSide = Math.min(width, height);
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    return Boolean(coarse && shortSide <= 760);
  }

  function apply() {
    const { width, height } = size();
    const isPhone = phoneLike(width, height);
    const rotate = isPhone && height > width;
    root.classList.toggle("phone-rotate", rotate);
    root.classList.toggle("phone-landscape", isPhone && !rotate);
    if (rotate) {
      root.style.setProperty("--game-scale", String(Math.max(0.1, Math.min(width / BASE_H, height / BASE_W) * 0.985)));
    } else if (isPhone) {
      root.style.setProperty("--game-scale", String(Math.max(0.1, Math.min(width / BASE_W, height / BASE_H) * 0.985)));
    }
  }

  const style = document.createElement("style");
  style.id = "mobileOrientationBootStyle";
  style.textContent = `
    html.phone-rotate,
    html.phone-rotate body {
      width: 100%;
      height: 100%;
      overflow: hidden !important;
      touch-action: none;
      background: #101522;
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

  function suppressMobileDefault(event) {
    const { width, height } = size();
    if (!phoneLike(width, height)) return;
    if (event.type === "touchmove" && event.target?.closest?.(".admin-panel, .shop-list, .entry-grid")) return;
    event.preventDefault();
  }

  ["contextmenu", "selectstart", "dragstart", "gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, suppressMobileDefault, { capture: true });
  });

  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd < 360) suppressMobileDefault(event);
    lastTouchEnd = now;
  }, { capture: true, passive: false });

  document.addEventListener("touchmove", suppressMobileDefault, { capture: true, passive: false });

  apply();
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", () => window.setTimeout(apply, 20));
  window.visualViewport?.addEventListener("resize", apply);
}());
