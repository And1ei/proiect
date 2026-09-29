// Tiny synthesized sounds (Web Audio oscillators, no audio files). Only ever called in response
// to a user action, and only when the learner has turned sound on.

let ctx = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, to, duration, type = 'sine', gain = 0.07, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  // Quick attack, exponential tail: a soft "pop" rather than a beep
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

export const SOUNDS = {
  correct: () => tone({ freq: 540, to: 900, duration: 0.13 }),
  incorrect: () => tone({ freq: 240, to: 180, duration: 0.18, type: 'triangle', gain: 0.05 }),
  complete: () => {
    tone({ freq: 523, duration: 0.14 });
    tone({ freq: 659, duration: 0.14, delay: 0.1 });
    tone({ freq: 784, duration: 0.24, delay: 0.2 });
  },
};
