# CEFR Tester Trainer — Local Edition v0.4

A browser-based English level-tester training simulator. The simulated learner runs locally in the tester's browser using WebLLM/WebGPU. Microphone transcription can run locally with Whisper, and learner speech can run locally with Kokoro.

**No OpenAI API key is required. No paid model API is required.**

## What v0.4 does

- Randomly chooses one of 12 internal training bands: A1.1, A1.2, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2, C1.1, C1.2, C2.1, C2.2.
- Randomises learner name, age, gender, personality, interests, a relative strength/weakness, and recurring error patterns.
- Keeps the target band hidden during the interview UI.
- Runs the learner LLM locally in the browser through WebLLM.
- Offers four local LLM sizes so lower-memory laptops have a fallback.
- Supports typed questions.
- Supports local push-to-talk transcription using Whisper Tiny English through Transformers.js.
- Supports optional local learner speech using Kokoro-82M, with British/American voice styles that automatically match the generated learner’s boy/girl profile.
- Falls back to the device's system speech if Kokoro cannot load.
- Records the tester microphone locally while the microphone is in use and offers the recording after the interview.
- Reveals the true internal band only after the tester submits a guess.
- Gives transparent heuristic feedback on question coverage, follow-up, clarity, scaffolding and level discrimination.
- Generates an additional short coaching note with the same local LLM.
- Does **not** invent pronunciation scores from a transcript.

## Important CEFR note

The Council of Europe defines A1, A2, B1, B2, C1 and C2. The `.1` / `.2` bands in this project are internal tester-training splits designed to distinguish the lower and upper part of each official CEFR level. They are not official Council of Europe labels.

The detailed internal band specification is in `CEFR_BAND_SPEC.md`.

## Recommended browser

Use a recent **Google Chrome or Microsoft Edge** desktop browser with WebGPU enabled.

GitHub Pages is served over HTTPS, which is suitable for microphone permissions and Web Workers.

## First-run downloads

This version deliberately loads models only when needed:

1. **Learner LLM** — loaded when you click `Load local AI`.
2. **Whisper** — loaded only when you first use the microphone.
3. **Kokoro** — loaded only when the learner first needs to speak and Local AI Voice is selected.

The first learner-model download can be large (roughly around 1–3 GB depending on the model choice/quantisation and browser cache). Model files are cached by the browser where possible.

## Privacy model

There is no paid inference API and no API key. The app itself has no backend.

On first use, your browser makes network requests to public JavaScript/model hosts in order to download WebLLM, Transformers.js, Kokoro and model weights. The learner prompts and generated answers are then processed in your browser rather than being sent to a hosted LLM API.

The local microphone recording is held as a browser Blob and is not uploaded by this application.

Because this is a client-side app, the hidden band is **hidden from the normal interface, not cryptographically secret**. A technically determined user with Developer Tools could inspect browser memory/code. That is acceptable for staff practice but is not suitable for a high-stakes secure examination.

## Publish free with GitHub Pages

See `GITHUB_SETUP.md` for the easiest no-command-line instructions.

The project is intentionally static: there is no npm install, build command, server or environment file required for deployment.

## Run locally for development

Because browser Workers and microphone/model APIs expect an HTTP(S) origin, do not open `index.html` by double-clicking it. Serve the folder with any simple local web server.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

For the simplest real use, publish it to GitHub Pages and use the HTTPS URL.

## Main files

- `index.html` — static application entry point
- `app.css` — interface styling
- `js/app.js` — interview/UI/audio orchestration
- `js/levels.js` — 12-band CEFR training profiles
- `js/prompts.js` — learner role-play prompt construction
- `workers/llm-worker.js` — WebLLM inference
- `workers/whisper-worker.js` — local speech-to-text
- `workers/tts-worker.js` — local Kokoro speech synthesis
- `sw.js` — caches the small application shell

## Third-party runtime components

The app currently references these browser libraries/models at runtime:

- `@mlc-ai/web-llm` 0.2.85
- `@huggingface/transformers` 3.8.1
- `kokoro-js` 1.2.1
- WebLLM-compatible open instruct models selected in the UI
- `onnx-community/whisper-tiny.en`
- `onnx-community/Kokoro-82M-v1.0-ONNX`

Their own licenses and terms apply.

## Current limitations

- Local 1B–3B models are less capable and less consistent than large cloud models. The 3B options are strongly preferred for CEFR fidelity.
- Kokoro provides adult/neutral open voices rather than true child voice models; the “lighter” style is only an approximation for younger learners.
- First-run model downloads are substantial.
- Performance depends on the laptop GPU, drivers and browser.
- The hidden answer is client-side and therefore not tamper-proof.
- Push-to-talk is used in v0.4 rather than always-on automatic turn detection. It is more reliable for a completely local first version.
- Pronunciation assessment is not included yet. A future version can analyse the saved tester audio locally or through an optional specialist engine.
