import { KokoroTTS } from 'https://esm.run/kokoro-js@1.2.1';

let tts = null;
function post(type, payload = {}) { self.postMessage({ type, ...payload }); }

async function ensureLoaded() {
  if (tts) return;
  post('progress', { text: 'Loading local Kokoro voice model…', progress: null });
  tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (x) => {
      const progress = Number.isFinite(x?.progress) ? x.progress / 100 : null;
      post('progress', { text: x?.file ? `Voice: ${x.file}` : 'Loading local Kokoro voice model…', progress });
    },
  });
  post('ready');
}

self.addEventListener('message', async (event) => {
  const data = event.data || {};
  try {
    if (data.type === 'load') {
      await ensureLoaded();
      return;
    }
    if (data.type === 'speak') {
      await ensureLoaded();
      const audio = await tts.generate(data.text || '', { voice: data.voice || 'bf_emma' });
      const blob = audio.toBlob();
      post('audio', { requestId: data.requestId, blob });
    }
  } catch (error) {
    post('error', { requestId: data.requestId, message: error?.message || String(error) });
  }
});
