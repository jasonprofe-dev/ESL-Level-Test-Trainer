import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;
let backend = null;

function post(type, payload = {}) { self.postMessage({ type, ...payload }); }

async function ensureLoaded() {
  if (transcriber) return;
  const hasGPU = !!self.navigator?.gpu;
  const attempts = hasGPU ? ['webgpu', 'wasm'] : ['wasm'];
  let lastError;
  for (const device of attempts) {
    try {
      post('progress', { text: `Loading local Whisper (${device.toUpperCase()})…`, progress: null });
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        {
          device,
          progress_callback: (x) => {
            const progress = Number.isFinite(x?.progress) ? x.progress / 100 : null;
            post('progress', { text: x?.file ? `Whisper: ${x.file}` : 'Loading local Whisper…', progress });
          },
        },
      );
      backend = device;
      post('ready', { backend });
      return;
    } catch (error) {
      lastError = error;
      transcriber = null;
    }
  }
  throw lastError || new Error('Could not load Whisper.');
}

self.addEventListener('message', async (event) => {
  const data = event.data || {};
  try {
    if (data.type === 'load') {
      await ensureLoaded();
      return;
    }
    if (data.type === 'transcribe') {
      await ensureLoaded();
      const audio = new Float32Array(data.audio);
      const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
      });
      post('transcript', { requestId: data.requestId, text: String(output?.text || '').trim(), backend });
    }
  } catch (error) {
    post('error', { requestId: data.requestId, message: error?.message || String(error) });
  }
});
