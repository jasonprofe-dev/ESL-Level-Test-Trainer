# Put CEFR Tester Trainer on GitHub Pages — no API key

These instructions use only the GitHub website. You do not need Node.js, PowerShell or an OpenAI API account.

## 1. Create the repository

1. Sign in to GitHub.
2. Click **New repository**.
3. Name it something like `cefr-tester-trainer`.
4. Choose **Public** for the simplest free GitHub Pages setup.
5. Do not add a README or .gitignore during creation because this project already includes its own files.
6. Click **Create repository**.

## 2. Upload this project

On the new empty repository page:

1. Choose **uploading an existing file**.
2. Upload **the contents of this folder**, not the ZIP itself.
3. Keep the folder structure exactly as supplied, especially:
   - `js/`
   - `workers/`
4. Commit the files to the `main` branch.

If GitHub's browser uploader makes uploading folders awkward, drag the whole unzipped project folder into the upload area in a Chromium browser. Check that `index.html` appears at the repository root before committing.

## 3. Enable GitHub Pages

1. Open the repository's **Settings**.
2. In the left menu, choose **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Click **Save**.

GitHub will publish a URL similar to:

```text
https://YOUR-USERNAME.github.io/cefr-tester-trainer/
```

## 4. First test

Open the GitHub Pages URL in recent Chrome or Edge.

You should see:

- `No API key`
- a device check
- a model selector
- `Load local AI`

Start with **Qwen 2.5 3B**. If it fails due to GPU/memory limitations, try **Qwen 2.5 1.5B** or **Llama 3.2 1B**.

The first model load is the slowest because browser model weights must be downloaded and cached.

## 5. Microphone

When you first press the microphone button, the browser will ask permission. Choose **Allow**.

The local Whisper model will then load. Hold the microphone button while asking your question and release it when finished.

You can type questions at any time if you do not want to wait for Whisper.

## 6. Learner voice

`Local AI · Kokoro` is the fully local AI voice option. The model loads the first time the learner needs to speak.

If that is too heavy for the laptop, choose `System voice`. The interview AI still remains local; only the audio rendering method changes.

## Updating the site later

When a new version is ready, replace the files in the repository and commit the changes. GitHub Pages will update from `main` automatically.

## No secret key

There should be **no `.env` file and no OpenAI key anywhere in this repository**. If you see instructions asking you to add one, you are looking at the older cloud prototype rather than the Local Edition.
