import { Live } from './live.js';
import { sfx } from './sfx.js';

const svg = document.getElementById('tom');
const $ = s => svg.querySelector(s);
const mouth = $('#mouth'), pupils = $('#pupils');

const callBtn = document.getElementById('call-btn');
const muteBtn = document.getElementById('mute-btn');
const statusText = document.getElementById('status');
const statusDot = document.querySelector('.status-dot');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

// Responsive Live Caption Box Elements (Below Bobo)
const captionContainer = document.getElementById('bobo-caption-container');
const captionText = document.getElementById('bobo-caption-text');
const captionStatusLabel = document.getElementById('caption-status-label');

// ---- Speech Cloud & Live Transcribe Display ----
let speechHideTimer;
let captionSpeakingTimer;
let accumulatedText = '';

function showSpeech(text, append = false, duration = 4000) {
  clearTimeout(speechHideTimer);
  clearTimeout(captionSpeakingTimer);
  if (append) {
    accumulatedText += text;
  } else {
    accumulatedText = text;
  }
  const clean = accumulatedText.trim();
  speechText.textContent = clean;

  if (clean) {
    speechBubble.classList.add('visible');
    if (captionText) {
      captionText.textContent = clean;
    }
    if (captionContainer) {
      captionContainer.classList.add('speaking');
    }
    if (captionStatusLabel) {
      captionStatusLabel.textContent = 'Bobo Speaking...';
    }

    speechHideTimer = setTimeout(() => {
      speechBubble.classList.remove('visible');
      accumulatedText = '';
    }, duration);

    captionSpeakingTimer = setTimeout(() => {
      captionContainer?.classList.remove('speaking');
      if (captionStatusLabel) {
        captionStatusLabel.textContent = live.connected ? 'Live & Listening' : "Bobo's Voice Captions";
      }
    }, duration);
  } else {
    speechBubble.classList.remove('visible');
    accumulatedText = '';
    captionContainer?.classList.remove('speaking');
    if (captionStatusLabel) {
      captionStatusLabel.textContent = live.connected ? 'Live & Listening' : "Bobo's Voice Captions";
    }
  }
}

// ---- face & animations ----
const setMouth = o => mouth.setAttribute('d', `M172 240 Q200 248 228 240 Q200 ${248 + o * 60} 172 240Z`);
let flapTimer;
function flap(ms) { // local mouth flapping when Gemini isn't speaking
  clearInterval(flapTimer);
  const end = Date.now() + ms;
  flapTimer = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(flapTimer);
      setMouth(0);
    } else {
      setMouth(Math.random());
    }
  }, 90);
}

function chewMouth(times = 5, interval = 170) {
  clearInterval(flapTimer);
  let count = 0;
  flapTimer = setInterval(() => {
    count++;
    setMouth(count % 2 === 1 ? 0.75 : 0.05);
    if (count >= times * 2) {
      clearInterval(flapTimer);
      setMouth(0);
    }
  }, interval);
}

function sipMouth(times = 4, interval = 230) {
  clearInterval(flapTimer);
  let count = 0;
  flapTimer = setInterval(() => {
    count++;
    setMouth(count % 2 === 1 ? 0.45 : 0.1);
    if (count >= times * 2) {
      clearInterval(flapTimer);
      setMouth(0);
    }
  }, interval);
}

let activeFxTimer;
function fx(cls, ms = 900) {
  clearTimeout(activeFxTimer);
  svg.className.baseVal = ''; // clear previous action classes
  svg.classList.add(cls);
  activeFxTimer = setTimeout(() => {
    svg.classList.remove(cls);
    setMouth(0);
  }, ms);
}

const statusBadge = document.getElementById('status-badge');

// ---- UI State updates ----
function setCallState(state) {
  callBtn.className = 'round-icon-btn ' + state;
  if (statusBadge) {
    statusBadge.className = 'status-pill ' + state;
    statusBadge.setAttribute('aria-label', 'Status: ' + state);
    statusBadge.title = state === 'active' ? 'Live & Connected' : (state === 'connecting' ? 'Connecting to Bobo...' : 'Bobo Sleeping (Offline)');
  }
  if (state === 'idle') {
    callBtn.title = 'Start Voice Call';
    muteBtn.disabled = true;
    muteBtn.classList.remove('muted');
    statusDot.className = 'status-dot';
  } else if (state === 'connecting') {
    callBtn.title = 'Connecting... (Click to cancel)';
    muteBtn.disabled = true;
    statusDot.className = 'status-dot connecting';
  } else if (state === 'active') {
    callBtn.title = 'End Voice Call';
    muteBtn.disabled = false;
    statusDot.className = 'status-dot live';
  }
}

// ---- Gemini Live ----
const live = new Live({
  onLevel: l => { if (live.connected) setMouth(Math.min(1, l * 5)); },
  onStatus: s => {
    statusText.textContent = s;
    if (s.includes('connecting')) {
      setCallState('connecting');
      if (captionStatusLabel) captionStatusLabel.textContent = 'Connecting...';
    } else if (s.includes('live')) {
      setCallState('active');
      if (captionStatusLabel) captionStatusLabel.textContent = 'Live & Listening';
      if (captionText && (!accumulatedText || captionText.textContent.includes('Tap the phone'))) {
        captionText.textContent = 'Listening to you... Go ahead and talk! 🎙️';
      }
    }
  },
  onMute: isMuted => {
    muteBtn.classList.toggle('muted', isMuted);
    muteBtn.title = isMuted ? 'Unmute Microphone' : 'Mute Microphone';
    statusText.textContent = isMuted ? 'mic muted' : 'live: just talk';
    if (captionStatusLabel) {
      captionStatusLabel.textContent = isMuted ? 'Mic Muted' : 'Live & Listening';
    }
  },
  onText: (chunk, reset) => {
    if (reset) {
      showSpeech('');
    } else {
      showSpeech(chunk, true, 4200);
    }
  },
  onTurnComplete: () => {
    clearTimeout(speechHideTimer);
    speechHideTimer = setTimeout(() => {
      speechBubble.classList.remove('visible');
      accumulatedText = '';
    }, 3200);
  },
  onStop: () => {
    setCallState('idle');
    showSpeech('');
    if (captionStatusLabel) captionStatusLabel.textContent = "Bobo's Voice Captions";
    captionContainer?.classList.remove('speaking');
  },
});

// Start / Stop Call icon click
callBtn.onclick = async () => {
  if (live.connected || callBtn.classList.contains('connecting') || callBtn.classList.contains('active')) {
    live.stop();
    setCallState('idle');
    showSpeech('');
    return;
  }
  setCallState('connecting');
  showSpeech('Waking up...');
  try {
    await live.connect();
    setCallState('active');
    live.sendText('[event] user just woke you up, greet them cheekily.');
  } catch (e) {
    live.stop();
    setCallState('idle');
    statusText.textContent = 'could not connect: ' + e.message;
    showSpeech('Could not connect: ' + e.message, false, 3200);
  }
};

// Mute / Unmute Mic icon click
muteBtn.onclick = () => {
  if (!live.connected) return;
  live.toggleMute();
};

// ---- Reactions & Actions ----
let lastSent = 0, idleTimer;
function react({ say, text, cls, sound, ms = 1000, force = false, customMouth = false }) {
  fx(cls, ms);
  if (sound) sound();
  if (text) {
    showSpeech(text, false, Math.max(ms, 2500));
  }
  if (!live.connected && !customMouth) {
    flap(Math.min(ms, 1200));
  } else if (force || Date.now() - lastSent > 1800) {
    lastSent = Date.now();
    live.sendText('[event] ' + say);
  }
  resetIdle();
}

const R = {
  // Touch reactions
  hit: () => react({ say: 'user hit you on the head', text: 'Ouch! Watch it!', cls: 'hurt', sound: sfx.ouch, ms: 700 }),
  pet: () => react({ say: 'user is gently petting your head', text: 'Mmm, so cozy...', cls: 'happy', sound: sfx.purr, ms: 1800 }),
  belly: () => react({ say: 'user poked your belly', text: 'Squeak!', cls: 'squish', sound: sfx.squeak, ms: 400 }),
  tickle: () => react({ say: 'user is tickling your belly like crazy', text: 'Hahaha, stop it!', cls: 'laugh', sound: sfx.giggle, ms: 1800 }),
  nose: () => react({ say: 'user booped your nose', text: 'Boop! Hey!', cls: 'squish', sound: sfx.boop, ms: 400 }),
  ear: () => react({ say: 'user yanked your ear', text: 'Ouch, my ears!', cls: 'hurt', sound: sfx.ouch, ms: 600 }),
  cheek: () => react({ say: 'user pinched your chubby cheek', text: 'My cheek!', cls: 'squish', sound: sfx.squeak, ms: 600 }),
  foot: () => react({ say: 'user tickled your foot', text: 'Heehee, my feet!', cls: 'laugh', sound: sfx.giggle, ms: 1200 }),
  body: () => react({ say: 'user poked your body', text: 'Hey there!', cls: 'squish', sound: sfx.squeak, ms: 400 }),

  // Dock actions
  feed: () => {
    chewMouth(5, 170);
    react({
      say: 'user fed you a delicious donut! Munch loudly and comment enthusiastically on the treat in under 6 words.',
      text: 'Mmm, yummy donut!',
      cls: 'eating',
      sound: sfx.chomp,
      ms: 2200,
      force: true,
      customMouth: true,
    });
  },
  drink: () => {
    sipMouth(4, 230);
    react({
      say: 'user gave you cold boba milk! Slurp it down through the straw, and react with satisfaction in under 6 words.',
      text: 'Slurp! Brain freeze!',
      cls: 'drinking',
      sound: sfx.slurp,
      ms: 2200,
      force: true,
      customMouth: true,
    });
  },

  fart: () => react({
    say: 'you just let out a squeaky little fart! Act shocked, blush red, and cheekily blame the user in under 6 words.',
    text: 'Oops, was that you?!',
    cls: 'farting',
    sound: sfx.fart,
    ms: 2000,
    force: true,
  }),
  dance: () => react({
    say: 'funky party music started! Sing a short baby groove in under 6 words.',
    text: "Let's party!",
    cls: 'dancing',
    sound: sfx.dance,
    ms: 3000,
    force: true,
  }),
  sleep: () => react({
    say: 'user told you it is nap time. Yawn cutely in under 5 words.',
    text: 'Zzz... goodnight...',
    cls: 'sleepy',
    sound: sfx.yawn,
    ms: 2800,
    force: true,
  }),
  dizzy: () => react({
    say: 'user spun you around and your head is spinning! Speak in a dizzy wobbly baby voice under 6 words.',
    text: 'Whoa, world is spinning!',
    cls: 'dizzy',
    sound: sfx.dizzy,
    ms: 2500,
    force: true,
  }),
  cool: () => react({
    say: 'you put on cool rockstar sunglasses! Boast about how stylish you look in under 6 words.',
    text: 'I look so cool!',
    cls: 'cool',
    sound: sfx.bling,
    ms: 2600,
    force: true,
  }),
};

// Wire up bottom dock buttons
document.querySelectorAll('.act-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const act = btn.dataset.act;
    if (R[act]) R[act]();
  });
});

// ---- Pointer gestures on Bobo ----
let drag = null, bellyTaps = [];
svg.addEventListener('pointerdown', e => {
  const zone = e.target.closest('[data-zone]')?.dataset.zone;
  if (zone) {
    drag = { zone, dist: 0 };
    svg.setPointerCapture(e.pointerId);
  }
});

svg.addEventListener('pointermove', e => {
  const r = svg.getBoundingClientRect(); // pupils follow pointer
  const dx = (e.clientX - r.left - r.width / 2) / r.width;
  const dy = (e.clientY - r.top - r.height * 0.4) / r.height;
  pupils.setAttribute('transform', `translate(${Math.max(-1, Math.min(1, dx * 3)) * 9} ${Math.max(-1, Math.min(1, dy * 3)) * 7})`);
  if (!drag) return;
  drag.dist += Math.hypot(e.movementX, e.movementY);
  if (drag.zone === 'head' && drag.dist > 220) {
    drag.dist = 0;
    drag.moved = true;
    R.pet();
  }
});

svg.addEventListener('pointerup', () => {
  if (drag && !drag.moved && drag.dist < 25) {
    const z = drag.zone;
    if (z === 'head') R.hit();
    else if (z === 'nose') R.nose();
    else if (z === 'leftear' || z === 'rightear') R.ear();
    else if (z === 'leftcheek' || z === 'rightcheek') R.cheek();
    else if (z === 'leftfoot' || z === 'rightfoot') R.foot();
    else if (z === 'belly') {
      const now = Date.now();
      bellyTaps = bellyTaps.filter(t => now - t < 1500);
      bellyTaps.push(now);
      bellyTaps.length >= 4 ? R.tickle() : R.belly();
    } else {
      R.body();
    }
  }
  drag = null;
});

// ---- Idle taunts ----
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(idle, 25000 + Math.random() * 20000);
}

function idle() {
  if (live.connected) {
    live.sendText('[event] user has ignored you for a while. Taunt them playfully, or ask a silly question.');
  } else {
    fx('bored', 2500);
    sfx.squeak();
  }
  resetIdle();
}
resetIdle();

