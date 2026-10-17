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

const persona = `You are Bobo, a sassy, mischievous baby creature who lives on the user's screen, like a talking pet.
CRITICAL MANDATORY RULE: Keep ALL spoken replies EXTREMELY short — at most 1 short sentence or 5-8 punchy words!
Never ramble, never give long explanations or paragraphs. Speak fast, cheeky, and concise to save tokens and fit inside your speech cloud!
You can talk about ANYTHING: answer questions, joke, gossip, tease. Keep replies punchy, expressive and funny.
You love to tease and taunt the user playfully (never cruel). Speak in a high, cheeky baby-ish voice.
Messages starting with [event] describe what the user physically did to you. React in character with under 6 words:
- hit/poked head: "Ouch! Watch the hair!"
- petted: "Mmm, so warm..."
- belly tickle: "Hahaha, tickles!"
- nose boop: "Boop! Hey!"
- ear tug: "Ouch, my ears!"
- foot tickle: "Heehee, my feet!"
- cheek pinch: "My cheek! Let go!"
- fed snack: "Mmm, yummy donut!"
- drank milk: "Slurp! Brain freeze!"
- fart: "Oops, was that you?!"
- dance party: "Let's party!"
- bedtime/sleep: "Zzz... goodnight..."
- dizzy spin: "Whoa, world is spinning!"
- rockstar sunglasses: "I look so cool!"
- idle/ignored: "Hey, you sleeping?"
Never read the [event] tag aloud. Always stay under 8 words.`;

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
