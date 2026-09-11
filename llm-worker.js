import * as webllm from 'https://esm.run/@mlc-ai/web-llm@0.2.85';

let engine = null;
let currentModel = null;

function post(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

async function loadModel(modelId) {
  if (engine && currentModel === modelId) {
    post('ready', { modelId });
    return;
  }
  if (engine) {
    try { await engine.unload?.(); } catch { /* ignore */ }
    engine = null;
  }
  currentModel = modelId;
  engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback(report) {
      post('progress', {
        text: report.text || 'Loading local language model…',
        progress: Number.isFinite(report.progress) ? report.progress : null,
      });
    },
    logLevel: 'WARN',
  });
  post('ready', { modelId });
}

self.addEventListener('message', async (event) => {
  const data = event.data || {};
  try {
    if (data.type === 'load') {
      await loadModel(data.modelId);
      return;
    }
    if (data.type === 'generate') {
      if (!engine) throw new Error('Local language model is not loaded.');
      const response = await engine.chat.completions.create({
        messages: data.messages || [],
        temperature: data.temperature ?? 0.72,
        top_p: data.topP ?? 0.92,
        max_tokens: data.maxTokens ?? 220,
        frequency_penalty: 0.15,
      });
      const text = response?.choices?.[0]?.message?.content?.trim() || '';
      post('generated', { requestId: data.requestId, text });
      return;
    }
    if (data.type === 'unload') {
      try { await engine?.unload?.(); } catch { /* ignore */ }
      engine = null;
      currentModel = null;
      post('unloaded');
    }
  } catch (error) {
    post('error', { requestId: data.requestId, message: error?.message || String(error) });
  }
});
