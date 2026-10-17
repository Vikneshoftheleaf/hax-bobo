# Bobo: a Talking Tom style pet powered by Gemini Live

An original 2D baby creature (pure SVG, no copyrighted assets) you can poke, pet and tickle.
Instead of echoing your voice, Bobo has a real two-way voice conversation through the Gemini Live API,
and is told what you physically do to him so he reacts in character.

## Run
    npm install
    cp .env.example .env     # add GEMINI_API_KEY
    npm run dev              # open http://localhost:5173

## Interactions & Controls
- **Call & Mic Icons**: Click the circular phone icon to start/stop live voice chat with Bobo; click the microphone icon to mute/unmute your mic during a call.
- **Action Dock**:
  - 🍎 Feed: Feed Bobo a snack (chewing animation + crunch sound)
  - 🥛 Drink: Give Bobo cold milk (gulping animation + slurp sound)
  - 💨 Toot: Whoopee cushion fart (blushing animation + funny buzz)
  - 💃 Dance: Funky dance party (groovy bounce + baby beat)
  - 💤 Nap: Bedtime (yawn + rising Zzz bubbles)
  - 😵‍💫 Dizzy: Spin Bobo dizzy (spiral eyes + wobble sound)
  - 🕶️ Cool: Rockstar mode (stylish sunglasses slide down + bling sound)
- **Direct Touches**:
  - Tap head = ouch | Drag head = pet & purr | Tap nose = boop
  - Tug ears = ear twitch | Pinch cheeks = stretch | Tickle feet = giggle & hop
  - Tap belly = squish | 4 quick belly taps = tickle frenzy
  - Ignore him ~30s = he taunts you playfully

## Structure
- server.js: holds your API key, mints single-use ephemeral tokens, defines Bobo's persona
- src/live.js: Gemini Live session, Tone.js pitch-shifting (Puck pitched up to cartoon kid voice), mic capture (16 kHz PCM), gapless playback (24 kHz), barge-in, mouth-level meter
- src/main.js: pointer gestures, reactions, idle taunts, eye tracking
- src/sfx.js: offline synth sounds
- index.html: character SVG and CSS animations

## Notes
- Model names change; update LIVE_MODEL in .env from the Live API docs.
- Use headphones, otherwise Bobo may hear himself.
- Ideas: swap the SVG for sprite sheets/Lottie/Rive, add food/toys, add video input so he can see you.
