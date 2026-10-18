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
let turnFresh = true; // true = next text chunk starts a brand-new caption

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
      // Show listening prompt — will be replaced as soon as Gemini speaks
      if (captionText && !accumulatedText) {
        captionText.textContent = 'Listening... say something!';
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
      // interrupted or new turn: wipe caption and start fresh
      accumulatedText = '';
      turnFresh = true;
      if (captionText) captionText.textContent = '';
      captionContainer?.classList.remove('speaking');
    } else {
      if (turnFresh) {
        // First chunk of a new turn — don't append to old text, start clean
        accumulatedText = chunk;
        turnFresh = false;
      } else {
        accumulatedText += chunk;
      }
      const clean = accumulatedText.trim();
      if (clean && captionText) {
        captionText.textContent = clean;
        captionContainer?.classList.add('speaking');
        if (captionStatusLabel) captionStatusLabel.textContent = 'Bobo Speaking...';
        // Reset the hide timer
        clearTimeout(speechHideTimer);
        clearTimeout(captionSpeakingTimer);
        speechHideTimer = setTimeout(() => {
          accumulatedText = '';
          turnFresh = true;
        }, 4500);
        captionSpeakingTimer = setTimeout(() => {
          captionContainer?.classList.remove('speaking');
          if (captionStatusLabel) {
            captionStatusLabel.textContent = live.connected ? 'Live & Listening' : "Bobo's Voice Captions";
          }
        }, 4500);
      }
    }
  },
  onTurnComplete: () => {
    // Mark next incoming text as a fresh turn
    turnFresh = true;
    // Keep the last caption visible for a while, then fade
    clearTimeout(speechHideTimer);
    speechHideTimer = setTimeout(() => {
      accumulatedText = '';
    }, 3500);
  },
  onStop: () => {
    setCallState('idle');
    accumulatedText = '';
    turnFresh = true;
    if (captionText) captionText.textContent = 'Tap the phone button to start talking live with Bobo.';
    if (captionStatusLabel) captionStatusLabel.textContent = "Bobo's Voice Captions";
    captionContainer?.classList.remove('speaking');
  },
});

// Start / Stop Call icon click
callBtn.onclick = async () => {
  if (live.connected || callBtn.classList.contains('connecting') || callBtn.classList.contains('active')) {
    live.stop(); // onStop handler updates captionText
    setCallState('idle');
    return;
  }
  setCallState('connecting');
  // Show connecting state directly in the widget caption
  if (captionText) captionText.textContent = 'Waking up...';
  accumulatedText = '';
  turnFresh = true;
  try {
    await live.connect();
    setCallState('active');
    live.sendText('[event] user just woke you up, greet them warmly and cutely.');
  } catch (e) {
    live.stop();
    setCallState('idle');
    statusText.textContent = 'could not connect: ' + e.message;
    if (captionText) captionText.textContent = 'Could not connect: ' + e.message;
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
  hit: () => react({ say: 'user gently bumped your head. React with sweet affection and ask for a warm hug in under 6 words.', text: 'Gentle please! Big hug?', cls: 'happy', sound: sfx.purr, ms: 800 }),
  pet: () => react({ say: 'user is gently petting your head. React with cozy gratitude and love in under 6 words.', text: 'Mmm, so cozy... love you!', cls: 'happy', sound: sfx.purr, ms: 1800 }),
  belly: () => react({ say: 'user poked your belly softly. Giggle cutely in under 5 words.', text: 'Squeak! Hehe!', cls: 'squish', sound: sfx.squeak, ms: 400 }),
  tickle: () => react({ say: 'user is tickling your belly. Laugh with pure cute joy in under 6 words.', text: "Heehee, you're the best!", cls: 'laugh', sound: sfx.giggle, ms: 1800 }),
  nose: () => react({ say: 'user booped your nose. Giggle sweetly in under 5 words.', text: "Boop! You're so sweet!", cls: 'squish', sound: sfx.boop, ms: 400 }),
  ear: () => react({ say: 'user gently touched your soft ear. React softly and cutely under 5 words.', text: 'Soft ears! Gentle friend.', cls: 'squish', sound: sfx.squeak, ms: 600 }),
  cheek: () => react({ say: 'user gently squished your chubby cheeks. Smile with sweet joy under 6 words.', text: 'Squishy cheeks! Smile with me!', cls: 'squish', sound: sfx.squeak, ms: 600 }),
  foot: () => react({ say: 'user tickled your tiny feet. Giggle happily under 6 words.', text: 'Tee-hee, happy little feet!', cls: 'laugh', sound: sfx.giggle, ms: 1200 }),
  body: () => react({ say: 'user gave you a soft pat. Welcome them warmly under 5 words.', text: 'Hello sweet friend!', cls: 'squish', sound: sfx.squeak, ms: 400 }),

  // Dock actions
  feed: () => {
    chewMouth(5, 170);
    react({
      say: 'user fed you a delicious donut! Munch happily and thank them warmly in under 6 words.',
      text: 'Mmm, yummy! Thank you!',
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
      say: 'user gave you cold boba milk! Slurp happily and express cozy delight in under 6 words.',
      text: 'Slurp! So refreshing, thanks!',
      cls: 'drinking',
      sound: sfx.slurp,
      ms: 2200,
      force: true,
      customMouth: true,
    });
  },

  fart: () => react({
    say: 'you let out a tiny bashful sneeze and blushed. Be very polite and cute in under 6 words.',
    text: 'Oopsie! Excuse me! *blushes*',
    cls: 'farting',
    sound: sfx.squeak,
    ms: 2000,
    force: true,
  }),
  dance: () => react({
    say: 'cheerful happy music started! Sing a joyful, sweet baby melody in under 6 words.',
    text: "Yay! Let's dance happily!",
    cls: 'dancing',
    sound: sfx.dance,
    ms: 3000,
    force: true,
  }),
  sleep: () => react({
    say: 'user is tucking you in for bed. Wish them sweet dreams lovingly in under 5 words.',
    text: 'Sweet dreams, sleep tight...',
    cls: 'sleepy',
    sound: sfx.yawn,
    ms: 2800,
    force: true,
  }),
  dizzy: () => react({
    say: 'user spun you in a happy circle! React with cute starry wonder under 6 words.',
    text: 'Wheee! So many stars!',
    cls: 'dizzy',
    sound: sfx.dizzy,
    ms: 2500,
    force: true,
  }),
  cool: () => react({
    say: 'you put on cute starry sunglasses! Compliment your friend and yourself warmly under 6 words.',
    text: "Look, we're shining bright!",
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

// ---- Idle check-ins ----
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(idle, 25000 + Math.random() * 20000);
}

function idle() {
  if (live.connected) {
    live.sendText('[event] user has been quiet for a while. Greet them gently with a cute, loving check-in in under 6 words.');
  } else {
    fx('bored', 2500);
    sfx.squeak();
  }
  resetIdle();
}
resetIdle();

