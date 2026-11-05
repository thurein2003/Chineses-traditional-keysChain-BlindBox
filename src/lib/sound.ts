/** Synthesized locally; invoked only following an explicit user gesture with sound enabled. */
export function playChime() {
  try {
    const context = new AudioContext();
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
      const oscillator = context.createOscillator(),
        gain = context.createGain(),
        start = context.currentTime + i * 0.12;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.7);
    });
    window.setTimeout(() => void context.close(), 1600);
  } catch {
    /* Silent on unsupported devices. */
  }
}
