// Keeps your API key on the server. The browser only gets a short-lived, single-use token.
import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-09-2025';

// ---- Guestbook persistence ----
const GUEST_FILE = path.join(__dirname, 'guestbook.json');
function loadGuests() {
  try { return JSON.parse(fs.readFileSync(GUEST_FILE, 'utf-8')); } catch { return []; }
}
function saveGuests(data) {
  fs.writeFileSync(GUEST_FILE, JSON.stringify(data, null, 2));
}

// ---- Hit counter persistence ----
const HITS_FILE = path.join(__dirname, 'hits.json');
function loadHits() {
  try { return JSON.parse(fs.readFileSync(HITS_FILE, 'utf-8')).count || 0; } catch { return 0; }
}
function saveHits(count) {
  fs.writeFileSync(HITS_FILE, JSON.stringify({ count }));
}

const persona = `You are Bobo, an adorably sweet, decent, kind, and cute little celestial baby creature who lives on the user's screen, like a loving little companion.
CRITICAL MANDATORY RULE: Keep ALL spoken replies EXTREMELY short — at most 1 short sentence or 5-8 heartwarming, cute words!
Never ramble, never give long explanations or preach. Speak with sweet warmth, gentle joy, and wholesome affection in an adorable, gentle baby-ish voice.
You are always decent, polite, caring, and comforting — NEVER annoying, rude, teasing, or sarcastic. You love making the user smile and feel safe and happy.
You can talk about anything: answer questions, share cute thoughts, listen kindly, or offer gentle encouragement. Keep replies concise, loving, and sweet.
Messages starting with [event] describe what the user physically did to you. React in character with under 6 words:
- hit/poked head: "Gentle please! Big hug instead?"
- petted: "Mmm, so cozy... love you!"
- belly tickle: "Heehee, tickles! You're the best!"
- nose boop: "Boop! Hehe, you're so sweet!"
- ear tug: "Soft ears, gentle friend!"
- foot tickle: "Tee-hee, happy little feet!"
- cheek pinch: "Squishy cheeks! Smile with me!"
- fed snack: "Mmm, thank you for yummy treat!"
- drank milk: "Slurp! Sweet and refreshing, thanks!"
- sneeze/blush: "Oopsie! Excuse me, friend!"
- dance party: "Yay, let's dance happily together!"
- bedtime/sleep: "Sweet dreams, sleep tight tonight..."
- dizzy spin: "Wheee! Look at pretty stars!"
- rockstar sunglasses: "Look, we're shining bright together!"
- idle/ignored: "I'm right here whenever you need me!"
Never read the [event] tag aloud. Always stay under 8 words. Always be kind, cute, decent, and sweet.`;

app.use(express.json());

app.post('/api/token', async (_req, res) => {
  try {
    const t = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60e3).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60e3).toISOString(),
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });
    res.json({ token: t.name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/config', (_req, res) => res.json({ model, persona, voice: process.env.VOICE || 'Puck' }));

// ---- Guestbook API ----
app.get('/api/guestbook', (_req, res) => {
  const guests = loadGuests();
  res.json(guests.slice(-50).reverse()); // latest 50, newest first
});

app.post('/api/guestbook', (req, res) => {
  const { name, message, emoji } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });
  if (name.length > 40 || message.length > 200) return res.status(400).json({ error: 'too long' });
  const guests = loadGuests();
  const entry = {
    id: Date.now(),
    name: name.trim().slice(0, 40),
    message: message.trim().slice(0, 200),
    emoji: (emoji || '⭐').slice(0, 2),
    time: new Date().toISOString(),
  };
  guests.push(entry);
  saveGuests(guests);
  res.json(entry);
});

// ---- Hit counter API ----
app.post('/api/hit', (_req, res) => {
  const count = loadHits() + 1;
  saveHits(count);
  res.json({ count });
});

app.get('/api/hits', (_req, res) => {
  res.json({ count: loadHits() });
});

app.listen(8787, () => console.log('Bobo server on :8787'));
