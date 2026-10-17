// Web Audio API Sound Effects, Music Box Synth & Click System
let ctx;
let isMuted = false;

export function setGlobalMuted(val) {
  isMuted = !!val;
  return isMuted;
}
export function getGlobalMuted() {
  return isMuted;
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(f0, f1, d, type = 'sine', v = 0.15) {
  if (isMuted) return;
  try {
    const c = getCtx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(t + d);
  } catch {}
}

const seq = (n, gap, fn) => {
  for (let i = 0; i < n; i++) setTimeout(() => { if (!isMuted) fn(i); }, i * gap);
};

export const sfx = {
  // UI Clicks & Interactions (+3 pts)
  click: () => tone(800, 400, 0.04, 'sine', 0.08),
  pop: () => tone(350, 850, 0.06, 'triangle', 0.12),
  tab: () => tone(450, 600, 0.05, 'sine', 0.09),
  success: () => seq(3, 80, i => tone(523 + i * 130, 650 + i * 130, 0.12, 'triangle', 0.1)),
  crack: () => seq(4, 30, () => tone(200 + Math.random() * 400, 100, 0.04, 'square', 0.08)),

  // Bobo reactions
  ouch: () => tone(750, 180, 0.3, 'sawtooth', 0.1),
  squeak: () => tone(500, 1100, 0.15, 'square', 0.07),
  boop: () => tone(300, 650, 0.12),
  purr: () => seq(8, 90, () => tone(95, 70, 0.08, 'sawtooth', 0.06)),
  giggle: () => seq(6, 110, i => tone(700 + i * 40, 950, 0.08, 'sine', 0.12)),
  chomp: () => seq(4, 95, i => tone(350 - i * 40, 160, 0.08, 'triangle', 0.14)),
  slurp: () => { tone(220, 620, 0.22, 'sine', 0.12); setTimeout(() => tone(480, 220, 0.18, 'triangle', 0.1), 220); },
  fart: () => seq(6, 35, i => tone(130 - i * 14, 55, 0.07, 'sawtooth', 0.16)),
  yawn: () => tone(440, 180, 0.9, 'sine', 0.1),
  dizzy: () => seq(8, 70, i => tone(i % 2 === 0 ? 580 : 360, i % 2 === 0 ? 360 : 580, 0.09, 'sine', 0.1)),
  dance: () => seq(6, 110, i => tone(320 + (i % 2) * 180, 460 + (i % 2) * 260, 0.1, 'square', 0.07)),
  bling: () => seq(4, 70, i => tone(700 + i * 250, 1100 + i * 250, 0.09, 'triangle', 0.1)),
};

// ---- Lullaby Synthesizer & Music Box (Tier 2 Standout) ----
export const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};

export function playLullabyNote(freq, duration = 0.8) {
  if (isMuted) return;
  try {
    const c = getCtx(), t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    // Warm music box bell timbre: blend of triangle with gentle bell decay
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch {}
}

let songTimer = null;
export function stopLullaby() {
  if (songTimer) {
    clearInterval(songTimer);
    clearTimeout(songTimer);
    songTimer = null;
  }
}

export function playLullabySong(songKey, onNote) {
  stopLullaby();
  const songs = {
    twinkle: [
      ['C4', 400], ['C4', 400], ['G4', 400], ['G4', 400],
      ['A4', 400], ['A4', 400], ['G4', 800],
      ['F4', 400], ['F4', 400], ['E4', 400], ['E4', 400],
      ['D4', 400], ['D4', 400], ['C4', 800],
    ],
    brahms: [
      ['E4', 400], ['E4', 400], ['G4', 600], ['E4', 400],
      ['E4', 400], ['G4', 600], ['E4', 300], ['G4', 300],
      ['C5', 600], ['B4', 300], ['A4', 300], ['A4', 300],
      ['G4', 600], ['D4', 300], ['E4', 300], ['F4', 600],
    ],
    cosmic: [
      ['C4', 450], ['E4', 450], ['G4', 450], ['C5', 700],
      ['B4', 450], ['G4', 450], ['A4', 450], ['F4', 700],
      ['E4', 450], ['G4', 450], ['D4', 450], ['C4', 900],
    ],
  };

  const notes = songs[songKey] || songs.twinkle;
  let idx = 0;
  const playNext = () => {
    if (idx >= notes.length) {
      idx = 0; // loop soothingly
    }
    const [note, dur] = notes[idx];
    playLullabyNote(NOTES[note], dur / 1000 * 1.5);
    onNote?.(note);
    idx++;
    songTimer = setTimeout(playNext, dur);
  };
  playNext();
}
