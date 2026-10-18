import { GoogleGenAI, Modality } from '@google/genai';
import * as Tone from 'tone';

// Mic worklet: collects 100 ms of 16 kHz float audio per message.
const WORKLET = `class P extends AudioWorkletProcessor{b=new Float32Array(1600);n=0;
process(i){const c=i[0][0];if(!c)return true;for(const s of c){this.b[this.n++]=s;
if(this.n===1600){this.port.postMessage(this.b.slice());this.n=0}}return true}}registerProcessor('p',P)`;

const toB64 = buf => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); };

export class Live {
  constructor(h) {
    this.h = h;
    this.connected = false;
    this.muted = false;
    this.next = 0;
    this.srcs = new Set();
    this.pitch = 3; // Fixed child/cartoon voice default (+7 semitones)
  }

  setPitch(semitones) {
    this.pitch = Number(semitones);
    if (this.pitchShift) {
      this.pitchShift.pitch = this.pitch;
    }
  }

  toggleMute() {
    return this.setMute(!this.muted);
  }

  setMute(val) {
    this.muted = !!val;
    if (this.stream) {
      this.stream.getAudioTracks().forEach(t => { t.enabled = !this.muted; });
    }
    this.h.onMute?.(this.muted);
    return this.muted;
  }

  async connect() {
    this.h.onStatus('connecting...');
    const cfg = await (await fetch('/api/config')).json();
    const { token } = await (await fetch('/api/token', { method: 'POST' })).json();
    const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });

    await Tone.start();
    this.out = Tone.getContext().rawContext;

    // Pitch shifter to transform Puck into a cartoon child/kid voice in real time
    this.pitchShift = new Tone.PitchShift({
      pitch: this.pitch,
      windowSize: 0.06,
      feedback: 0,
      wet: 1,
    });

    this.an = this.out.createAnalyser();
    this.an.fftSize = 256;

    // Route: bufferSource -> pitchShift -> analyser -> destination
    Tone.connect(this.pitchShift, this.an);
    this.an.connect(this.out.destination);

    this.session = await ai.live.connect({
      model: cfg.model,
      config: {
        // AUDIO only — keeps the connection stable. Captions come via outputAudioTranscription.
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: cfg.persona,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } },
      },
      callbacks: {
        onopen: () => { },
        onmessage: m => this.onMsg(m),
        onerror: e => this.h.onStatus('error: ' + (e.message || 'connection')),
        onclose: () => this.stop(),
      },
    });
    await this.startMic();
    this.connected = true;
    this.h.onStatus('live: just talk (headphones help)');
    this.meter();
  }

  async startMic() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    if (this.muted) {
      this.stream.getAudioTracks().forEach(t => { t.enabled = false; });
    }
    this.inp = new AudioContext({ sampleRate: 16000 });
    await this.inp.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' })));
    const node = new AudioWorkletNode(this.inp, 'p');
    node.port.onmessage = e => {
      if (this.muted) return; // Don't stream audio packets while muted
      const f = e.data, p = new Int16Array(f.length);
      for (let i = 0; i < f.length; i++) p[i] = Math.max(-1, Math.min(1, f[i])) * 32767;
      this.session?.sendRealtimeInput({ audio: { data: toB64(p.buffer), mimeType: 'audio/pcm;rate=16000' } });
    };
    this.inp.createMediaStreamSource(this.stream).connect(node);
  }

  onMsg(m) {
    // DEV: log raw message so we can see exactly which fields carry text/transcription
    console.log('[Bobo onMsg]', JSON.stringify(m).slice(0, 400));

    const s = m.serverContent; if (!s) return;

    if (s.interrupted) {
      this.flush(); // user talked over Bobo
      this.h.onText?.('', true); // reset caption
    }

    // turnStart = brand-new model response starting — reset caption
    if (s.turnStart) {
      this.h.onText?.('', true);
    }

    // Path 1: outputAudioTranscription — transcription of Bobo's audio output
    const transcriptText = s.outputAudioTranscription?.text
      ?? s.outputTranscription?.text
      ?? s.audioTranscription?.text;
    if (transcriptText) {
      this.h.onText?.(transcriptText, false);
    }

    // Path 2: modelTurn parts — text chunks (TEXT modality or inline text)
    for (const p of s.modelTurn?.parts ?? []) {
      if (p.inlineData?.data) this.play(p.inlineData.data);
      if (p.text && !transcriptText) {
        // Only use part text if we didn't already get transcription (avoid duplicates)
        this.h.onText?.(p.text, false);
      }
    }

    if (s.turnComplete) {
      this.h.onTurnComplete?.();
    }
  }

  play(b64) {
    const bin = atob(b64), n = bin.length >> 1;
    const buf = this.out.createBuffer(1, n, 24000), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
      if (v >= 32768) v -= 65536;
      ch[i] = v / 32768;
    }
    const src = this.out.createBufferSource();
    src.buffer = buf;
    Tone.connect(src, this.pitchShift);

    this.next = Math.max(this.next, this.out.currentTime);
    src.start(this.next);
    this.next += buf.duration;
    this.srcs.add(src);
    src.onended = () => {
      this.srcs.delete(src);
      try { src.disconnect(); } catch { }
    };
  }

  flush() {
    this.srcs.forEach(s => {
      try { s.stop(); s.disconnect(); } catch { }
    });
    this.srcs.clear();
    this.next = 0;
  }

  meter() { // loudness of Bobo's voice drives his mouth
    const d = new Uint8Array(this.an.fftSize);
    const tick = () => {
      if (!this.connected) return;
      this.an.getByteTimeDomainData(d);
      let m = 0;
      for (const v of d) m = Math.max(m, Math.abs(v - 128));
      this.h.onLevel(m / 128);
      requestAnimationFrame(tick);
    };
    tick();
  }

  sendText(t) { this.session?.sendRealtimeInput({ text: t }); }

  stop() {
    if (!this.connected && !this.session) return;
    this.connected = false;
    this.muted = false;
    this.h.onMute?.(false);
    this.flush();
    try { this.pitchShift?.dispose(); } catch { }
    this.pitchShift = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.inp?.close();
    try { this.session?.close(); } catch { }
    this.session = null;
    this.h.onStatus('offline: poke him anyway');
    this.h.onLevel(0);
    this.h.onStop?.();
  }
}
