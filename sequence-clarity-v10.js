(function () {
  "use strict";

  window.ECHO_GARDEN_VERSION = "v10";

  const originalSetTimeout = window.setTimeout.bind(window);
  const timingMap = new Map([
    [120, 360],
    [180, 520],
    [360, 920],
    [420, 820],
    [460, 980],
    [620, 1260],
    [860, 1540]
  ]);

  window.setTimeout = function (callback, delay, ...args) {
    const nextDelay = timingMap.get(delay) || delay;
    return originalSetTimeout(callback, nextDelay, ...args);
  };

  if (window.CanvasRenderingContext2D) {
    const originalStroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function (...args) {
      if (this.canvas && this.canvas.id === "ambientCanvas") {
        return undefined;
      }
      return originalStroke.apply(this, args);
    };
  }

  function removeDetachedLightRings() {
    document.querySelectorAll(".ripple, .trail").forEach((element) => {
      element.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeDetachedLightRings, { once: true });
  } else {
    removeDetachedLightRings();
  }
})();