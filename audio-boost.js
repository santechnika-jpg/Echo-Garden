(function () {
  "use strict";

  const boost = 1.85;
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;

  if (!NativeAudioContext || NativeAudioContext.prototype.__echoGardenBoosted) {
    return;
  }

  const createGain = NativeAudioContext.prototype.createGain;

  NativeAudioContext.prototype.createGain = function boostedCreateGain() {
    const node = createGain.apply(this, arguments);
    const gain = node && node.gain;

    if (!gain || gain.__echoGardenBoosted) {
      return node;
    }

    gain.__echoGardenBoosted = true;
    const originalSetValueAtTime = gain.setValueAtTime.bind(gain);
    const originalRampToValue = gain.exponentialRampToValueAtTime.bind(gain);
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(gain), "value");

    const boostedValue = (value) => Math.min(value * boost, 0.95);

    gain.setValueAtTime = (value, time) => originalSetValueAtTime(boostedValue(value), time);
    gain.exponentialRampToValueAtTime = (value, time) => originalRampToValue(boostedValue(value), time);

    if (descriptor && descriptor.get && descriptor.set) {
      Object.defineProperty(gain, "value", {
        configurable: true,
        get: () => descriptor.get.call(gain),
        set: (value) => descriptor.set.call(gain, boostedValue(value))
      });
    }

    return node;
  };

  NativeAudioContext.prototype.__echoGardenBoosted = true;
})();
