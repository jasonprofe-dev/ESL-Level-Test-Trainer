import { LEVELS, levelIndex } from './levels.js';

const app = document.querySelector('#app');
const API_BASE = String(window.CEFR_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');

const VOICE_STYLES = [
  { id: 'british-warm', label: 'British · warm', note: 'Emma / George', girl: 'bf_emma', boy: 'bm_george' },
  { id: 'british-clear', label: 'British · clear', note: 'Isabella / Lewis', girl: 'bf_isabella', boy: 'bm_lewis' },
  { id: 'british-light', label: 'British · lighter', note: 'Lily / Fable', girl: 'bf_lily', boy: 'bm_fable' },
  { id: 'american-warm', label: 'American · warm', note: 'Bella / Michael', girl: 'af_bella', boy: 'am_michael' },
];

const state = {
  stage: 'setup',
  serverConnected: false,
  serverStatus: 'Not checked',
  serverHealth: null,
  accessCode: '',
  token: sessionStorage.getItem('cefr-central-token') || '',
  authenticated: false,
  authBusy: false,
  selectedVoiceStyle: localStorage.getItem('cefr-voice-style') || 'british-warm',
  voiceMode: localStorage.getItem('cefr-voice-mode') || 'central',
  inputMode: localStorage.getItem('cefr-input-mode') || 'live',
  sessionId: null,
  learner: null,
  learnerReady: false,
  textReady: false,
  speechReady: false,
  voiceReady: false,
  warmServices: {},
  warmStatus: 'Not started',
  warmStartedAt: 0,
  transcript: [],
  input: '',
  busy: false,
  recording: false,
  recordingMode: null,
  liveListening: false,
  speechDetected: false,
  speaking: false,
  micStream: null,
  utteranceRecorder: null,
  utteranceChunks: [],
  sessionRecorder: null,
  sessionChunks: [],
  sessionAudioUrl: null,
  startedAt: 0,
  elapsedTimer: null,
  elapsed: 0,
  guess: 'B1.2',
  results: null,
  reveal: null,
  revealLoading: false,
  sttStatus: 'Central Whisper ready after server connection',
  ttsStatus: 'Central Kokoro ready after server connection',
  lastSttMs: null,
  lastSttSecondPass: false,
  lastTtsMs: null,
  lastTurnTiming: null,
  error: '',
  info: '',
};

let currentAudio = null;
let vadAudioContext = null;
let vadSource = null;
let vadAnalyser = null;
let vadRaf = null;
let cancelCurrentUtterance = false;
let warmPollTimer = null;

function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;' }[c])); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function formatClock(ms) { const s=Math.floor(ms/1000); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function apiConfigured() { return ((/^https:\/\//i.test(API_BASE)) || (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE))) && !API_BASE.includes('YOUR-SERVER'); }
function hardware() { return { secure: window.isSecureContext, mic: !!navigator.mediaDevices?.getUserMedia, recorder: 'MediaRecorder' in window }; }
function authHeaders(extra = {}) { return state.token ? { ...extra, Authorization: `Bearer ${state.token}` } : extra; }

async function parseApiError(res) {
  let detail = '';
  try {
    const data = await res.json();
    detail = data?.detail || data?.message || '';
  } catch {
    try { detail = await res.text(); } catch {}
  }
  return detail || `Server returned HTTP ${res.status}`;
}

async function apiFetch(path, options = {}) {
  if (!apiConfigured()) throw new Error('The Modal server URL has not been configured yet.');
  const res = await fetch(`${API_BASE}${path}`, options);
  if (res.status === 401) {
    state.authenticated = false;
    state.token = '';
    sessionStorage.removeItem('cefr-central-token');
  }
  return res;
}

async function checkServer({ quiet = false } = {}) {
  state.serverStatus = 'Checking Modal server…';
  if (!quiet) render();
  if (!apiConfigured()) {
    state.serverConnected = false;
    state.serverStatus = 'Server URL not configured yet';
    if (!quiet) render();
    return false;
  }
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    state.serverHealth = data;
    state.serverConnected = !!data.ok;
    state.textReady = !!data.text_ready;
    state.speechReady = !!data.speech_ready;
    state.voiceReady = !!data.voice_ready;
    state.learnerReady = !!data.ready;
    state.warmServices = data.services || {};
    state.serverStatus = state.textReady ? `Connected · ${data.model || 'AI service ready'}` : 'Server reachable · learner model warming';
    state.sttStatus = state.speechReady ? `Server speech recognition · ${data.whisper || 'Whisper'} ready` : `Server speech recognition · ${data.whisper || 'Whisper'} warming`;
    state.ttsStatus = state.voiceReady ? `Server learner voice · ${data.tts || 'Kokoro'} ready` : `Server learner voice · ${data.tts || 'Kokoro'} warming`;
    if (state.token) await verifyToken({ quiet: true });
    if (!quiet) render();
    return true;
  } catch (e) {
    state.serverConnected = false;
    state.serverStatus = 'Modal server not reachable';
    if (!quiet) {
      state.error = `Could not reach the Modal CEFR server. ${e.message}`;
      render();
    }
    return false;
  }
}

async function verifyToken({ quiet = false } = {}) {
  if (!state.token || !state.serverConnected) return false;
  try {
    const res = await apiFetch('/api/me', { headers: authHeaders() });
    if (!res.ok) throw new Error(await parseApiError(res));
    state.authenticated = true;
    apiFetch('/api/warm', { method: 'POST', headers: authHeaders() }).catch(() => {});
    if (!quiet) render();
    return true;
  } catch {
    state.authenticated = false;
    state.token = '';
    sessionStorage.removeItem('cefr-central-token');
    if (!quiet) render();
    return false;
  }
}

async function authenticate() {
  if (state.authBusy) return;
  if (!state.accessCode.trim()) { state.error = 'Enter the trainer access code.'; render(); return; }
  state.authBusy = true;
  state.error = '';
  render();
  try {
    const connected = state.serverConnected || await checkServer({ quiet: true });
    if (!connected) throw new Error('The Modal server is not reachable.');
    const res = await apiFetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_code: state.accessCode.trim() }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    state.token = data.token;
    sessionStorage.setItem('cefr-central-token', state.token);
    state.authenticated = true;
    state.accessCode = '';
    state.info = 'Connected securely to the Modal training server.';
    // Start the expensive learner model warming immediately after sign-in. This is
    // fire-and-forget; the browser never waits on the cold-start HTTP request.
    apiFetch('/api/warm', { method: 'POST', headers: authHeaders() }).catch(() => {});
  } catch (e) {
    state.error = `Could not sign in: ${e.message}`;
  } finally {
    state.authBusy = false;
    render();
  }
}

async function startInterview() {
  if (!state.authenticated) { state.error = 'Connect to the Modal server first.'; render(); return; }
  releaseMic();
  clearInterval(warmPollTimer);
  warmPollTimer = null;
  state.error = '';
  state.info = '';
  state.busy = true;
  state.learnerReady = false;
  state.textReady = false;
  state.speechReady = false;
  state.voiceReady = false;
  state.warmStatus = 'Creating learner and preparing services…';
  render();
  try {
    const res = await apiFetch('/api/session/start', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: '{}' });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    state.sessionId = data.session_id;
    state.learner = data.learner;
    state.textReady = !!data.text_ready;
    state.speechReady = !!data.speech_ready;
    state.voiceReady = !!data.voice_ready;
    state.learnerReady = state.textReady && state.speechReady && state.voiceReady;
    state.warmServices = data.warm_services || {};
    state.warmStatus = state.learnerReady ? 'All interview services ready' : 'Preparing interview services on Modal…';
    state.warmStartedAt = Date.now();
    state.transcript = [];
    state.input = '';
    state.results = null;
    state.reveal = null;
    state.guess = 'B1.2';
    state.stage = 'interview';
    state.startedAt = 0;
    state.elapsed = 0;
    clearInterval(state.elapsedTimer);
    if (state.textReady) startInterviewClock();
    if (!state.learnerReady) pollLearnerReady();
  } catch (e) {
    state.error = `Could not start interview: ${e.message}`;
  } finally {
    state.busy = false;
    render();
  }
}

function startInterviewClock() {
  if (state.startedAt) return;
  state.startedAt = Date.now();
  state.elapsed = 0;
  clearInterval(state.elapsedTimer);
  state.elapsedTimer = setInterval(() => {
    state.elapsed = Date.now() - state.startedAt;
    const el = document.querySelector('#timer');
    if (el) el.textContent = formatClock(state.elapsed);
  }, 1000);
}

async function pollLearnerReady() {
  clearInterval(warmPollTimer);
  const poll = async () => {
    if (!state.sessionId || state.stage !== 'interview' || state.learnerReady) return;
    try {
      const res = await apiFetch(`/api/session/${encodeURIComponent(state.sessionId)}/ready`, { headers: authHeaders(), cache: 'no-store' });
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await res.json();
      state.textReady = !!data.text_ready;
      state.speechReady = !!data.speech_ready;
      state.voiceReady = !!data.voice_ready;
      state.learnerReady = !!data.ready;
      state.warmServices = data.services || {};
      if (state.textReady) startInterviewClock();
      const seconds = Math.max(0, Math.round((Date.now() - state.warmStartedAt) / 1000));
      const bits = [
        `AI ${state.textReady ? '✓' : '…'}`,
        `Whisper ${state.speechReady ? '✓' : '…'}`,
        `Voice ${state.voiceReady ? '✓' : '…'}`,
      ];
      state.warmStatus = `${bits.join(' · ')} · ${seconds}s`;
      if (state.speechReady) state.sttStatus = `Server speech recognition · ${state.serverHealth?.whisper || 'Whisper'} ready`;
      if (state.voiceReady) state.ttsStatus = `Server learner voice · ${state.serverHealth?.tts || 'Kokoro'} ready`;
      if (state.learnerReady) {
        clearInterval(warmPollTimer);
        warmPollTimer = null;
        state.info = 'All interview services are ready.';
      } else if (state.textReady && !state.info) {
        state.info = 'Learner AI is ready for typed questions while speech services finish warming.';
      }
      render();
    } catch (e) {
      state.warmStatus = `Still preparing · ${e.message}`;
      render();
    }
  };
  await poll();
  if (!state.learnerReady) warmPollTimer = setInterval(poll, 2000);
}

async function askLearner(question) {
  const q = String(question || '').trim();
  if (!q || state.busy || !state.sessionId) return;
  if (!state.textReady) { state.error = 'The learner AI is still preparing. Wait for AI ✓.'; render(); return; }
  state.error = '';
  state.input = '';
  state.transcript.push({ role: 'tester', text: q, at: Date.now() });
  state.busy = true;
  state.sttStatus = state.liveListening ? 'Central AI is preparing the learner response…' : state.sttStatus;
  render(); scrollChat();
  try {
    const aiStarted = performance.now();
    const res = await apiFetch(`/api/session/${encodeURIComponent(state.sessionId)}/chat`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text: q }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    const reply = String(data.reply || '').trim() || "Sorry, I'm not sure what to say.";
    const aiMs = Number(data.timings?.total_ai_ms || (performance.now() - aiStarted));
    state.lastTurnTiming = { sttMs: state.lastSttMs, aiMs, rewritten: !!data.rewritten };
    state.transcript.push({ role: 'learner', text: reply, at: Date.now() });
    state.busy = false;
    render(); scrollChat();
    await speak(reply);
    if (state.liveListening && state.stage === 'interview') setTimeout(beginVadCycle, 180);
  } catch (e) {
    state.busy = false;
    state.error = `Learner server error: ${e.message}`;
    render();
    if (state.liveListening) setTimeout(beginVadCycle, 500);
  }
}

async function transcribeServer(blob, mimeType = 'audio/webm') {
  const form = new FormData();
  const ext = /ogg/i.test(mimeType) ? 'ogg' : 'webm';
  form.append('audio', blob, `utterance.${ext}`);
  state.sttStatus = 'Transcribing on the Modal server…';
  render();
  const res = await apiFetch('/api/transcribe', { method: 'POST', headers: authHeaders(), body: form });
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = await res.json();
  return {
    text: String(data.text || '').trim(),
    needsRetry: !!data.needs_retry,
    retryReason: String(data.retry_reason || ''),
    durationSeconds: Number(data.duration_seconds || 0),
    processingMs: Number(data.processing_ms || 0),
    automaticSecondPass: !!data.automatic_second_pass,
  };
}

async function synthesizeServer(text) {
  const style = VOICE_STYLES.find(v => v.id === state.selectedVoiceStyle) || VOICE_STYLES[0];
  const voice = state.learner?.gender === 'boy' ? style.boy : style.girl;
  state.ttsStatus = 'Generating the same learner voice on Modal…';
  render();
  const path = state.sessionId ? `/api/session/${encodeURIComponent(state.sessionId)}/tts` : '/api/tts';
  const res = await apiFetch(path, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, voice, speed: 0.96 }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  const processingMs = Number(res.headers.get('X-Processing-Ms') || 0);
  return { blob: await res.blob(), processingMs };
}

async function speak(text) {
  if (!text || state.voiceMode === 'off') return;
  state.speaking = true;
  render();
  if (currentAudio) { try { currentAudio.pause(); } catch {} currentAudio = null; }
  try {
    if (state.voiceMode === 'system') {
      if ('speechSynthesis' in window) {
        await new Promise(resolve => {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-GB'; u.rate = 0.95; u.onend = resolve; u.onerror = resolve;
          speechSynthesis.speak(u);
        });
      }
      return;
    }
    if (!state.voiceReady) {
      state.ttsStatus = 'Learner voice is still warming; text shown without substituting a different voice.';
      return;
    }
    const result = await synthesizeServer(text);
    state.lastTtsMs = result.processingMs || null;
    const url = URL.createObjectURL(result.blob);
    await new Promise((resolve, reject) => {
      currentAudio = new Audio(url);
      currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      currentAudio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; reject(new Error('Audio playback failed.')); };
      currentAudio.play().catch(reject);
    });
    state.ttsStatus = state.lastTtsMs ? `Kokoro ready · last voice ${(state.lastTtsMs / 1000).toFixed(1)}s` : `Ready · ${state.serverHealth?.tts || 'central Kokoro'}`;
  } catch (e) {
    // Never silently change Adam/Mia to a completely different browser voice.
    state.ttsStatus = 'Central learner voice failed for this turn';
    state.error = `Learner voice error: ${e.message}. The written answer is still valid; no substitute voice was used.`;
  } finally {
    state.speaking = false;
    render();
  }
}

function createMediaRecorder(stream) {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  const mimeType = candidates.find(t => window.MediaRecorder?.isTypeSupported?.(t));
  const options = { audioBitsPerSecond: 128000 };
  if (mimeType) options.mimeType = mimeType;
  return new MediaRecorder(stream, options);
}

async function ensureMic() {
  if (state.micStream?.active) return state.micStream;
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access is not supported in this browser.');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  state.micStream = stream;
  if ('MediaRecorder' in window && !state.sessionRecorder) {
    state.sessionChunks = [];
    const rec = createMediaRecorder(stream);
    rec.ondataavailable = e => { if (e.data?.size) state.sessionChunks.push(e.data); };
    rec.onstop = () => {
      if (state.sessionChunks.length) {
        const blob = new Blob(state.sessionChunks, { type: rec.mimeType || 'audio/webm' });
        if (state.sessionAudioUrl) URL.revokeObjectURL(state.sessionAudioUrl);
        state.sessionAudioUrl = URL.createObjectURL(blob);
        render();
      }
    };
    rec.start(1000);
    state.sessionRecorder = rec;
  }
  return stream;
}

async function startPushToTalk() {
  if (!state.speechReady) { state.error = 'Whisper is still preparing. Wait for Whisper ✓ or type the question.'; render(); return; }
  if (state.recording || state.busy || state.speaking) return;
  try {
    const stream = await ensureMic();
    cancelCurrentUtterance = false;
    state.utteranceChunks = [];
    const rec = createMediaRecorder(stream);
    state.recordingMode = 'push';
    rec.ondataavailable = e => { if (e.data?.size) state.utteranceChunks.push(e.data); };
    rec.onstop = async () => {
      state.recording = false; state.recordingMode = null; render();
      if (cancelCurrentUtterance) return;
      await processUtterance(state.utteranceChunks, rec.mimeType || 'audio/webm');
    };
    state.utteranceRecorder = rec;
    rec.start();
    state.recording = true;
    state.sttStatus = 'Recording…';
    render();
  } catch (e) { state.error = e.message; render(); }
}

function stopPushToTalk() {
  if (!state.recording || state.recordingMode !== 'push' || !state.utteranceRecorder) return;
  try { state.utteranceRecorder.stop(); } catch {}
}

async function processUtterance(chunks, mimeType) {
  try {
    const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
    const result = await transcribeServer(blob, mimeType);
    state.lastSttMs = result.processingMs || null;
    state.lastSttSecondPass = !!result.automaticSecondPass;
    state.sttStatus = result.processingMs
      ? `Whisper finished in ${(result.processingMs / 1000).toFixed(1)}s${result.automaticSecondPass ? ' · automatic accuracy retry used' : ''}`
      : (state.liveListening ? 'Live listening ready' : `Ready · ${state.serverHealth?.whisper || 'central Whisper'}`);
    render();
    if (result.needsRetry) {
      state.input = result.text;
      state.info = result.text
        ? `Speech recognition was uncertain and was NOT sent to the learner. I heard: “${result.text}”. Edit it and press Ask, or try the microphone again.`
        : 'Speech recognition was uncertain and nothing was sent to the learner. Please try the microphone again or type the question.';
      if (state.liveListening) stopLiveListening({ keepMic: true });
      render();
      return;
    }
    if (result.text) {
      state.input = result.text;
      render();
      await askLearner(result.text);
    } else {
      state.error = 'No speech was detected. Try again or type the question.';
      render();
      if (state.liveListening) setTimeout(beginVadCycle, 300);
    }
  } catch (e) {
    state.error = `Central transcription error: ${e.message}`;
    render();
    if (state.liveListening) setTimeout(beginVadCycle, 500);
  }
}

async function startLiveListening() {
  if (!state.speechReady) { state.error = 'Whisper is still preparing. Wait for Whisper ✓ or use typed questions.'; render(); return; }
  if (state.liveListening) return;
  try {
    await ensureMic();
    state.liveListening = true;
    state.inputMode = 'live';
    localStorage.setItem('cefr-input-mode', 'live');
    state.error = '';
    state.sttStatus = 'Live listening ready — speak naturally';
    render();
    beginVadCycle();
  } catch (e) { state.error = e.message; render(); }
}

function stopLiveListening({ keepMic = true } = {}) {
  state.liveListening = false;
  state.speechDetected = false;
  cancelCurrentUtterance = true;
  if (vadRaf) cancelAnimationFrame(vadRaf);
  vadRaf = null;
  if (state.utteranceRecorder && state.recordingMode === 'live' && state.utteranceRecorder.state !== 'inactive') {
    try { state.utteranceRecorder.stop(); } catch {}
  }
  state.recording = false;
  state.recordingMode = null;
  state.sttStatus = 'Live conversation paused';
  if (!keepMic) releaseMic();
  render();
}

async function prepareVad(stream) {
  if (vadAnalyser && vadSource && vadAudioContext) return;
  vadAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  vadSource = vadAudioContext.createMediaStreamSource(stream);
  vadAnalyser = vadAudioContext.createAnalyser();
  vadAnalyser.fftSize = 1024;
  vadAnalyser.smoothingTimeConstant = 0.25;
  vadSource.connect(vadAnalyser);
}

async function beginVadCycle() {
  if (!state.liveListening || state.stage !== 'interview' || state.busy || state.speaking || state.recording) return;
  try {
    const stream = await ensureMic();
    await prepareVad(stream);
    cancelCurrentUtterance = false;
    state.utteranceChunks = [];
    state.speechDetected = false;
    const rec = createMediaRecorder(stream);
    state.utteranceRecorder = rec;
    state.recordingMode = 'live';
    state.recording = true;
    const cycleStart = performance.now();
    let speechStart = 0;
    let lastVoice = 0;
    let renderedSpeech = false;
    const SILENCE_MS = 1850;
    const MIN_SPEECH_MS = 320;
    let noiseFloor = 0.004;
    let threshold = 0.009;
    let noiseSamples = 0;
    const MAX_WAIT_MS = 45000;

    rec.ondataavailable = e => { if (e.data?.size) state.utteranceChunks.push(e.data); };
    rec.onstop = async () => {
      if (vadRaf) cancelAnimationFrame(vadRaf);
      vadRaf = null;
      state.recording = false; state.recordingMode = null;
      const hadSpeech = state.speechDetected;
      state.speechDetected = false;
      render();
      if (cancelCurrentUtterance || !state.liveListening || state.stage !== 'interview') return;
      if (!hadSpeech) { setTimeout(beginVadCycle, 200); return; }
      await processUtterance(state.utteranceChunks, rec.mimeType || 'audio/webm');
    };
    rec.start(100);
    state.sttStatus = 'Listening — begin speaking';
    render();

    const samples = new Float32Array(vadAnalyser.fftSize);
    const tick = () => {
      if (!state.liveListening || state.busy || state.speaking || rec.state === 'inactive') return;
      vadAnalyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const x of samples) sum += x * x;
      const rms = Math.sqrt(sum / samples.length);
      const now = performance.now();
      // Brief ambient calibration makes the work-laptop microphone less dependent
      // on one hard-coded volume threshold. The recorder is already running, so the
      // beginning of speech is retained even if the user starts quickly.
      if (!state.speechDetected && now - cycleStart < 650 && rms < 0.03) {
        noiseFloor = ((noiseFloor * noiseSamples) + rms) / (noiseSamples + 1);
        noiseSamples += 1;
        threshold = Math.max(0.006, Math.min(0.02, noiseFloor * 2.6));
      }
      if (rms > threshold) {
        if (!speechStart) speechStart = now;
        lastVoice = now;
        if (!state.speechDetected && now - speechStart >= 90) {
          state.speechDetected = true;
          if (!renderedSpeech) { renderedSpeech = true; render(); }
        }
      }
      const enoughSpeech = state.speechDetected && speechStart && now - speechStart >= MIN_SPEECH_MS;
      const enoughSilence = enoughSpeech && lastVoice && now - lastVoice >= SILENCE_MS;
      const waitedTooLong = !state.speechDetected && now - cycleStart >= MAX_WAIT_MS;
      if (enoughSilence || waitedTooLong) {
        try { rec.stop(); } catch {}
        return;
      }
      vadRaf = requestAnimationFrame(tick);
    };
    vadRaf = requestAnimationFrame(tick);
  } catch (e) {
    state.error = `Live listening error: ${e.message}`;
    state.recording = false;
    render();
  }
}

function stopSessionRecording() {
  if (state.utteranceRecorder && state.recording) {
    cancelCurrentUtterance = true;
    try { state.utteranceRecorder.stop(); } catch {}
  }
  if (state.sessionRecorder && state.sessionRecorder.state !== 'inactive') { try { state.sessionRecorder.stop(); } catch {} }
  state.sessionRecorder = null;
}

function releaseMic() {
  if (vadRaf) cancelAnimationFrame(vadRaf);
  vadRaf = null;
  state.liveListening = false;
  stopSessionRecording();
  state.micStream?.getTracks?.().forEach(t => t.stop());
  state.micStream = null;
  if (vadSource) { try { vadSource.disconnect(); } catch {} }
  vadSource = null;
  vadAnalyser = null;
  if (vadAudioContext) { try { vadAudioContext.close(); } catch {} }
  vadAudioContext = null;
}

function finishInterview() {
  if (state.transcript.filter(t => t.role === 'tester').length < 2) {
    state.error = 'Ask at least two questions before finishing the interview.';
    render(); return;
  }
  stopLiveListening({ keepMic: true });
  stopSessionRecording();
  state.stage = 'guess';
  clearInterval(state.elapsedTimer);
  render();
}

function analyzeInterview(actualLevel) {
  const tester = state.transcript.filter(t => t.role === 'tester').map(t => t.text);
  const learner = state.transcript.filter(t => t.role === 'learner').map(t => t.text);
  const all = tester.join(' ').toLowerCase();
  const coverage = {
    familiar: /school|family|hobb|free time|like|enjoy|home|friend|sport/.test(all),
    past: /yesterday|last\s|did you|happened|have you ever|when you were|ago\b/.test(all),
    future: /future|next\s|going to|will you|plan|hope to/.test(all),
    opinion: /why|think|opinion|should|agree|better/.test(all),
    compare: /compare|difference|better|worse|prefer|than\b/.test(all),
    hypothetical: /if you|would you|imagine|could change|suppose/.test(all),
    extended: /tell me about|describe|explain|what happened|how did/.test(all),
  };
  const coverageCount = Object.values(coverage).filter(Boolean).length;
  const followUps = tester.filter(q => /\bwhy\b|\bhow\b|tell me more|what happened next|what do you mean|can you explain|you said|what about/i.test(q)).length;
  const longQs = tester.filter(q => q.trim().split(/\s+/).length > 24).length;
  const multiQs = tester.filter(q => (q.match(/\?/g) || []).length > 2).length;
  const misunderstand = learner.filter(x => /sorry|don't understand|do you mean|what does|what mean|could you repeat/i.test(x)).length;
  const scaffolds = tester.filter(q => /i mean|in other words|let me ask|another way|for example|simpler|what i mean/i.test(q)).length;
  const qn = Math.max(1, tester.length);
  const scores = {
    coverage: clamp(Math.round((coverageCount / 7) * 10), 1, 10),
    followUp: clamp(Math.round(3 + (followUps / qn) * 14), 1, 10),
    clarity: clamp(10 - longQs * 2 - multiQs * 2, 2, 10),
    scaffolding: clamp(misunderstand ? 5 + scaffolds * 2 : 7 + Math.min(2, scaffolds), 1, 10),
    discrimination: clamp(Math.round(2 + [coverage.past, coverage.future, coverage.opinion, coverage.compare, coverage.hypothetical].filter(Boolean).length * 1.6), 1, 10),
  };
  const distance = Math.abs(levelIndex(state.guess) - levelIndex(actualLevel));
  const verdict = distance === 0 ? 'Exact match' : distance === 1 ? 'Very close · one sub-level away' : distance <= 2 ? 'Close · one CEFR step or less away' : 'Calibration gap to review';
  const missing = Object.entries(coverage).filter(([, v]) => !v).map(([k]) => k);
  const strengths = [];
  const developments = [];
  if (scores.clarity >= 8) strengths.push('Questions were generally concise and easy to process.'); else developments.push('Shorten or split some questions so processing difficulty does not obscure language level.');
  if (scores.followUp >= 7) strengths.push('You used follow-up questions to move beyond rehearsed answers.'); else developments.push('Use more “why/how/tell me more” follow-ups after the learner’s first answer.');
  if (scores.discrimination >= 8) strengths.push('You sampled several language functions that help distinguish adjacent bands.'); else developments.push('Probe more than familiar description: include past, future, opinion, comparison and an age-appropriate hypothetical.');
  if (misunderstand && scaffolds) strengths.push('You showed evidence of reformulating when communication became difficult.');
  if (missing.length) developments.push(`Coverage still missing or weak: ${missing.join(', ')}.`);
  return { scores, coverage, distance, verdict, strengths, developments, questions: tester.length, turns: state.transcript.length };
}

async function submitGuess() {
  if (state.revealLoading || !state.sessionId) return;
  state.revealLoading = true;
  state.error = '';
  render();
  try {
    const res = await apiFetch(`/api/session/${encodeURIComponent(state.sessionId)}/reveal`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ guess: state.guess }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    state.reveal = await res.json();
    state.results = analyzeInterview(state.reveal.actual_level);
    state.stage = 'results';
  } catch (e) {
    state.error = `Could not generate debrief: ${e.message}`;
  } finally {
    state.revealLoading = false;
    render();
  }
}

async function newSession() {
  releaseMic();
  clearInterval(warmPollTimer); warmPollTimer = null;
  if (state.sessionId) {
    apiFetch(`/api/session/${encodeURIComponent(state.sessionId)}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
  }
  state.stage = 'setup';
  state.sessionId = null;
  state.learner = null;
  state.learnerReady = false;
  state.textReady = false;
  state.speechReady = false;
  state.voiceReady = false;
  state.warmServices = {};
  state.warmStatus = 'Not started';
  state.transcript = [];
  state.results = null;
  state.reveal = null;
  state.error = '';
  state.info = '';
  render();
}

function statusItem(label, ok, note, badge = null) {
  return `<div class="statusItem"><span><span class="dot ${ok ? 'ok' : 'warn'}"></span><strong>${escapeHtml(label)}</strong><div class="small">${escapeHtml(note)}</div></span><span class="badge">${escapeHtml(badge || (ok ? 'Ready' : 'Limited'))}</span></div>`;
}
function voiceModeButton(id, label) { return `<button class="choice ${state.voiceMode === id ? 'active' : ''}" data-voice-mode="${id}">${escapeHtml(label)}</button>`; }
function inputModeButton(id, label) { return `<button class="choice ${state.inputMode === id ? 'active' : ''}" data-input-mode="${id}">${escapeHtml(label)}</button>`; }

function setupView() {
  const h = hardware();
  const serverReady = state.serverConnected;
  return `
  <div class="hero"><h2>Professional CEFR role-play, from any approved browser.</h2><p>The work computer is only the interview screen and microphone. The learner AI, high-accuracy Whisper transcription and Kokoro voice run on a Modal server, so no model or application is installed on the tester's computer.</p><div class="privacy">🌐 Browser-only client · central high-quality AI · no local model installation</div></div>
  <div class="grid">
    <section class="card span7">
      <h3>1. Central training server</h3><p>The server keeps the learner's true CEFR band hidden until you submit your judgement. Model secrets and infrastructure credentials never live in GitHub Pages.</p>
      <div class="statusList">
        ${statusItem('Central API', state.serverConnected, state.serverStatus, state.serverConnected ? 'Online' : 'Offline')}
        ${statusItem('Learner AI', state.textReady, state.serverHealth?.model || 'Qwen 3.5 9B target', state.textReady ? 'Ready' : 'Warms after sign-in')}
        ${statusItem('Speech recognition', state.speechReady, state.serverHealth?.whisper || 'Whisper large-v3-turbo', state.speechReady ? 'Ready' : 'Warms in parallel')}
        ${statusItem('Learner voice', state.voiceReady, state.serverHealth?.tts || 'Kokoro-82M', state.voiceReady ? 'Ready' : 'Warms in parallel')}
      </div>
      <div class="btnRow" style="margin-top:12px"><button class="btn secondary" id="checkServer">Check server</button></div>
      ${!apiConfigured() ? `<div class="notice" style="margin-top:14px"><strong>Development status:</strong> the Modal server hostname has not been inserted into <code>config.js</code> yet. The browser client is ready for it once the server is deployed.</div>` : ''}
    </section>
    <section class="card span5">
      <h3>Work-computer requirements</h3><p>No software installation or browser extension is required.</p>
      <div class="statusList">
        ${statusItem('Secure GitHub page', h.secure, 'Needed for browser microphone access', h.secure ? 'Ready' : 'Limited')}
        ${statusItem('Microphone API', h.mic, 'Tester grants normal browser microphone permission', h.mic ? 'Ready' : 'Limited')}
        ${statusItem('MediaRecorder', h.recorder, 'Records each spoken turn in the browser', h.recorder ? 'Ready' : 'Limited')}
      </div>
      <div class="notice blue" style="margin-top:14px">The only network requirement is access to GitHub Pages <strong>and</strong> the HTTPS central-server domain.</div>
    </section>
    <section class="card span6">
      <h3>2. Trainer access</h3><p>A server-side access code prevents a public GitHub page from becoming an open AI endpoint.</p>
      ${state.authenticated ? `<div class="notice ok">✓ Signed in for this browser session. The access token disappears when this browser session closes.</div>` : `<label class="label" for="accessCode">Trainer access code</label><div class="inputLine" style="grid-template-columns:1fr auto"><input id="accessCode" type="password" value="${escapeHtml(state.accessCode)}" placeholder="Enter access code"/><button class="btn primary" id="authButton" ${state.authBusy || !state.serverConnected ? 'disabled' : ''}>${state.authBusy ? '<span class="spinner"></span>Connecting…' : 'Connect'}</button></div>`}
    </section>
    <section class="card span6">
      <h3>3. Learner voice</h3><p>Kokoro is generated centrally, so every work computer hears the same selected voice style.</p>
      <div class="choiceRow" style="margin-bottom:13px">${voiceModeButton('central', 'Central · Kokoro')}${voiceModeButton('system', 'Browser voice')}${voiceModeButton('off', 'No audio')}</div>
      <label class="label" for="voiceSelect">Voice style</label>
      <select id="voiceSelect" ${state.voiceMode !== 'central' ? 'disabled' : ''}>${VOICE_STYLES.map(v => `<option value="${v.id}" ${v.id === state.selectedVoiceStyle ? 'selected' : ''}>${escapeHtml(v.label)} — ${escapeHtml(v.note)}</option>`).join('')}</select>
      <div class="small" style="margin-top:9px">${escapeHtml(state.ttsStatus)}</div>
    </section>
    <section class="card span6">
      <h3>4. Conversation mode</h3><p><strong>Live conversation</strong> detects when you finish speaking and sends that turn to the central Whisper service. Push-to-talk remains available as a fallback.</p>
      <div class="choiceRow">${inputModeButton('live', 'Live conversation')}${inputModeButton('push', 'Push-to-talk')}</div>
      <div class="small" style="margin-top:11px">${escapeHtml(state.sttStatus)}</div>
    </section>
    <section class="card span6">
      <h3>5. Privacy model</h3><p>Unlike the old all-local prototype, spoken turns are sent securely to the Modal server for transcription and response generation. The Modal server does not intentionally persist uploaded turn audio.</p>
      <div class="notice blue">For organisational deployment, server hosting, retention policy and access controls should be approved before broad staff rollout.</div>
    </section>
    <section class="card span12">
      <div class="btnRow" style="justify-content:space-between"><div><strong>Ready?</strong><div class="small">The server secretly selects one of 12 internal bands from A1.1 to C2.2, plus an age and learner persona.</div></div><button class="btn primary big" id="startInterview" ${!state.authenticated || !state.serverConnected || state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span>Starting…' : 'Start random interview →'}</button></div>
    </section>
  </div>`;
}

function interviewView() {
  const l = state.learner || {};
  const initial = (l.name || '?').slice(0, 1).toUpperCase();
  const liveControls = state.inputMode === 'live'
    ? `<button class="btn ${state.liveListening ? 'danger' : 'primary'}" id="liveToggle" ${!state.speechReady ? 'disabled' : ''}>${state.liveListening ? '■ Pause live listening' : '🎙️ Start live conversation'}</button><span class="badge">${state.speaking ? 'Learner speaking' : state.busy ? 'Learner thinking' : state.speechDetected ? 'Hearing you…' : state.liveListening ? 'Listening' : 'Paused'}</span>`
    : `<button class="mic ${state.recording ? 'recording' : ''}" id="micBtn" title="${state.recording ? 'Release to transcribe' : 'Press and hold to speak'}" ${state.busy || state.speaking || !state.speechReady ? 'disabled' : ''}>${state.recording ? '■' : '🎙️'}</button>`;
  return `<div class="grid"><section class="card span12">
    <div class="interviewHeader"><div class="student"><div class="avatar">${escapeHtml(initial)}</div><div><h2>${escapeHtml(l.name)}, ${escapeHtml(l.age)}</h2><p>${l.gender === 'boy' ? 'Boy' : 'Girl'} · ${escapeHtml(l.personalityHint || '')} · hidden level</p></div></div><div><div class="timer" id="timer">${formatClock(state.elapsed)}</div><div class="small">${state.transcript.filter(t => t.role === 'tester').length} questions</div></div></div>
    <div class="notice blue">Conduct the interview naturally. The target CEFR band lives on the server and is not sent to this browser until you submit your guess.</div>${!state.learnerReady ? `<div class="notice" style="margin-top:10px"><strong>Preparing interview services…</strong> ${escapeHtml(state.warmStatus)}<br><span class="small">Typed questions unlock as soon as AI is ✓. Microphone unlocks when Whisper is ✓. Kokoro voice warms independently, so one slower service no longer blocks everything.</span></div>` : ''}
    <div class="chat" id="chat">${state.transcript.length ? state.transcript.map(turnHtml).join('') : '<div class="small" style="text-align:center;padding:70px 10px">Begin with your first level-test question.</div>'}${state.busy ? '<div class="turn learner"><div class="bubble"><div class="who">Learner</div><span class="spinner" style="border-color:#c9d7eb;border-top-color:#2f6fed"></span>Preparing an answer…</div></div>' : ''}</div>
    <div class="composer"><div class="btnRow">${liveControls}</div><div class="inputLine" style="grid-template-columns:1fr auto"><input id="questionInput" type="text" value="${escapeHtml(state.input)}" placeholder="You can type a question at any time…" ${state.busy || !state.textReady ? 'disabled' : ''}/><button class="btn primary send" id="sendQuestion" ${state.busy || !state.textReady ? 'disabled' : ''}>Ask</button></div><div class="small">${escapeHtml(state.sttStatus)}${state.inputMode === 'live' && state.liveListening ? ' · Live mode waits ~1.85 seconds of silence so natural pauses are less likely to cut a question short.' : ''}${state.lastTurnTiming ? ` · Last AI: ${(state.lastTurnTiming.aiMs / 1000).toFixed(1)}s` : ''}${state.lastSttMs ? ` · STT: ${(state.lastSttMs / 1000).toFixed(1)}s${state.lastSttSecondPass ? ' (retry)' : ''}` : ''}${state.lastTtsMs ? ` · Voice: ${(state.lastTtsMs / 1000).toFixed(1)}s` : ''}</div><div class="btnRow" style="justify-content:space-between"><button class="btn ghost" id="stopAudio">Stop learner audio</button><button class="btn" id="finishInterview">Finish interview & guess level</button></div></div>
  </section></div>`;
}

function turnHtml(t) { return `<div class="turn ${t.role}"><div class="bubble"><div class="who">${t.role === 'tester' ? 'Interviewer' : 'Learner'}</div>${escapeHtml(t.text)}</div></div>`; }

function guessView() {
  return `<div class="grid"><section class="card span12"><div class="reveal"><span class="badge">Interview complete · ${state.transcript.filter(t => t.role === 'tester').length} questions</span><h2>What is the learner's level?</h2><p>Choose the internal training band that best fits the evidence you elicited.</p></div><div class="levelGrid">${LEVELS.map(l => `<button class="levelBtn ${state.guess === l.id ? 'active' : ''}" data-level="${l.id}">${l.id}</button>`).join('')}</div><div class="btnRow" style="justify-content:center"><button class="btn secondary" id="backInterview">← Return to interview</button><button class="btn primary big" id="submitGuess" ${state.revealLoading ? 'disabled' : ''}>${state.revealLoading ? '<span class="spinner"></span>Generating debrief…' : 'Reveal & debrief'}</button></div></section></div>`;
}

function resultsView() {
  const r = state.results;
  const reveal = state.reveal;
  const l = reveal?.level;
  if (!r || !l) return '<div class="card">Debrief unavailable.</div>';
  const exact = r.distance === 0;
  return `<div class="grid">
    <section class="card span12"><div class="reveal"><span class="badge">${escapeHtml(r.verdict)}</span><div class="actual">${escapeHtml(reveal.actual_level)}</div><h2>${exact ? 'Correct — exact band.' : `You guessed ${escapeHtml(state.guess)}.`}</h2><p>Official CEFR anchor: <strong>${escapeHtml(reveal.official)}</strong>. The .1/.2 distinction is this trainer's internal calibration split, not an official CEFR label.</p></div></section>
    <section class="card span12"><h3>Tester technique</h3><p>These are transparent heuristics based on your question pattern—not a black-box pronunciation score.</p><div class="scoreGrid">${scoreHtml('Coverage', r.scores.coverage)}${scoreHtml('Follow-up', r.scores.followUp)}${scoreHtml('Clarity', r.scores.clarity)}${scoreHtml('Scaffolding', r.scores.scaffolding)}${scoreHtml('Discrimination', r.scores.discrimination)}</div></section>
    <section class="card span12"><h3>Why this band?</h3><div class="threeCol"><div class="compare"><h4>Why not lower?</h4><p>${escapeHtml(l.distinguish.below)}</p></div><div class="compare"><h4>Best fit · ${escapeHtml(l.id)}</h4><p>${escapeHtml(l.summary)}</p></div><div class="compare"><h4>Why not higher?</h4><p>${escapeHtml(l.distinguish.above)}</p></div></div></section>
    <section class="card span7"><h3>Five spoken-performance dimensions</h3><div class="dimensions">${Object.entries(l.dimensions).map(([k,v]) => `<div class="dimension"><strong>${escapeHtml(cap(k))}</strong><span>${escapeHtml(v)}</span></div>`).join('')}</div></section>
    <section class="card span5"><h3>Your interviewing</h3><h4 style="margin-bottom:5px">What worked</h4><ul class="clean">${(r.strengths.length ? r.strengths : ['You completed enough interaction to make a level judgement.']).map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul><h4 style="margin-bottom:5px">Next development</h4><ul class="clean">${r.developments.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>${state.sessionAudioUrl ? `<a class="btn secondary" href="${state.sessionAudioUrl}" download="tester-interview.webm" style="display:inline-block;text-decoration:none;margin-top:7px">Download tester microphone audio</a>` : '<div class="small">A microphone recording link appears here if you used the microphone during the interview.</div>'}</section>
    <section class="card span12"><h3>Calibration engine</h3>${reveal.calibration_report ? `<p><strong>${reveal.calibration_report.turns_checked}</strong> learner turns checked · <strong>${reveal.calibration_report.turns_with_spoken_form_limits || 0}</strong> turns showed a controlled grammatical/lexical limitation.</p>${reveal.calibration_report.realised_signatures?.length ? `<div class="notice blue"><strong>Realised learner signatures:</strong> ${escapeHtml(reveal.calibration_report.realised_signatures.join(' · '))}</div>` : ''}${reveal.calibration_report.unresolved_warnings?.length ? `<div class="notice"><strong>Residual calibration warnings:</strong> ${escapeHtml(reveal.calibration_report.unresolved_warnings.join(' · '))}</div>` : `<div class="notice ok">No unresolved performance-contract warnings were detected in the displayed turns.</div>`}` : '<p class="small">Calibration telemetry unavailable for this session.</p>'}</section>
    <section class="card span12"><h3>Central AI coach note</h3><p style="white-space:pre-wrap;color:var(--ink)">${escapeHtml(reveal.coach_note || 'No coach note generated.')}</p><div class="notice">Pronunciation is deliberately not scored yet. Transcript text alone cannot validly determine individual sounds, stress or prosody.</div></section>
    <section class="card span12"><div class="btnRow" style="justify-content:space-between"><button class="btn secondary" id="newSession">← New random learner</button><button class="btn" id="reviewTranscript">Show transcript</button></div><div id="resultTranscript" class="hidden" style="margin-top:15px"><div class="chat" style="max-height:420px">${state.transcript.map(turnHtml).join('')}</div></div></section>
  </div>`;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function scoreHtml(label, value) { return `<div class="score"><span class="small">${label}</span><strong>${value}/10</strong><div class="metric"><span style="width:${value * 10}%"></span></div></div>`; }

function chrome() {
  return `<div class="shell"><header class="topbar"><div class="brand"><div class="logo">CT</div><div><h1>CEFR Tester Trainer</h1><small>CEFR Performance Engine v0.10.0</small></div></div><div class="pills"><span class="pill ${state.serverConnected ? 'ok' : 'warn'}">${state.serverConnected ? '● Server online' : '○ Server'}</span><span class="pill ${state.authenticated ? 'ok' : 'warn'}">${state.authenticated ? '● Trainer connected' : '○ Sign-in'}</span><span class="pill ok">No client install</span></div></header>${state.error ? `<div class="notice" style="border-color:#f1b8b4;background:#fff1f0;color:#8d251f;margin-bottom:14px"><strong>Problem:</strong> ${escapeHtml(state.error)}</div>` : ''}${state.info ? `<div class="notice ok" style="margin-bottom:14px">${escapeHtml(state.info)}</div>` : ''}${state.stage === 'setup' ? setupView() : state.stage === 'interview' ? interviewView() : state.stage === 'guess' ? guessView() : resultsView()}<div class="footerNote">Modal Serverless Edition: work devices require only an approved browser, microphone permission and HTTPS access to the GitHub site plus the central API. Learner AI and speech processing run on the server.</div></div>`;
}

function render() { app.innerHTML = chrome(); bind(); }

function bind() {
  document.querySelector('#checkServer')?.addEventListener('click', () => checkServer());
  const access = document.querySelector('#accessCode');
  access?.addEventListener('input', e => { state.accessCode = e.target.value; });
  access?.addEventListener('keydown', e => { if (e.key === 'Enter') authenticate(); });
  document.querySelector('#authButton')?.addEventListener('click', authenticate);
  document.querySelector('#voiceSelect')?.addEventListener('change', e => { state.selectedVoiceStyle = e.target.value; localStorage.setItem('cefr-voice-style', state.selectedVoiceStyle); });
  document.querySelectorAll('[data-voice-mode]').forEach(el => el.addEventListener('click', () => { state.voiceMode = el.dataset.voiceMode; localStorage.setItem('cefr-voice-mode', state.voiceMode); render(); }));
  document.querySelectorAll('[data-input-mode]').forEach(el => el.addEventListener('click', () => { state.inputMode = el.dataset.inputMode; localStorage.setItem('cefr-input-mode', state.inputMode); render(); }));
  document.querySelector('#startInterview')?.addEventListener('click', startInterview);
  const input = document.querySelector('#questionInput');
  input?.addEventListener('input', e => { state.input = e.target.value; });
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askLearner(state.input); } });
  document.querySelector('#sendQuestion')?.addEventListener('click', () => askLearner(state.input));
  const mic = document.querySelector('#micBtn');
  if (mic) {
    mic.addEventListener('pointerdown', e => { e.preventDefault(); mic.setPointerCapture?.(e.pointerId); startPushToTalk(); });
    mic.addEventListener('pointerup', e => { e.preventDefault(); stopPushToTalk(); });
    mic.addEventListener('pointercancel', stopPushToTalk);
  }
  document.querySelector('#liveToggle')?.addEventListener('click', () => state.liveListening ? stopLiveListening() : startLiveListening());
  document.querySelector('#stopAudio')?.addEventListener('click', () => {
    try { currentAudio?.pause(); } catch {}
    currentAudio = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    state.speaking = false;
    render();
    if (state.liveListening) setTimeout(beginVadCycle, 150);
  });
  document.querySelector('#finishInterview')?.addEventListener('click', finishInterview);
  document.querySelectorAll('[data-level]').forEach(el => el.addEventListener('click', () => { state.guess = el.dataset.level; render(); }));
  document.querySelector('#backInterview')?.addEventListener('click', () => {
    state.stage = 'interview';
    state.startedAt = Date.now() - state.elapsed;
    state.elapsedTimer = setInterval(() => { state.elapsed = Date.now() - state.startedAt; const el = document.querySelector('#timer'); if (el) el.textContent = formatClock(state.elapsed); }, 1000);
    render();
  });
  document.querySelector('#submitGuess')?.addEventListener('click', submitGuess);
  document.querySelector('#newSession')?.addEventListener('click', newSession);
  document.querySelector('#reviewTranscript')?.addEventListener('click', () => document.querySelector('#resultTranscript')?.classList.toggle('hidden'));
}

function scrollChat() { requestAnimationFrame(() => { const c = document.querySelector('#chat'); if (c) c.scrollTop = c.scrollHeight; }); }

window.addEventListener('beforeunload', () => { clearInterval(warmPollTimer); releaseMic(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
render();
setTimeout(() => checkServer({ quiet: false }), 400);
