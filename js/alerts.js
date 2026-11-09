const BEEP_TONES = [880, 1320];
const BEEP_SECONDS = 0.12;
const VIBRATE_PATTERN = [120, 60, 120];

/**
 * Plays a short chime and vibrates when a spell comes back.
 * Browsers only allow audio after a user gesture, so call unlock() from a click handler.
 */
export function createAlerter(win, isSoundEnabled) {
  let audioContext = null;

  function unlock() {
    if (audioContext || !win.AudioContext) return;
    try {
      audioContext = new win.AudioContext();
    } catch (error) {
      console.warn('[spell-checker] audio unavailable:', error.message);
    }
  }

  function beep() {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    const start = audioContext.currentTime;
    BEEP_TONES.forEach((frequency, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const t = start + i * BEEP_SECONDS;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + BEEP_SECONDS);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(t);
      osc.stop(t + BEEP_SECONDS);
    });
  }

  function notifyReady() {
    if (!isSoundEnabled()) return;
    beep();
    win.navigator.vibrate?.(VIBRATE_PATTERN);
  }

  return { unlock, notifyReady };
}
