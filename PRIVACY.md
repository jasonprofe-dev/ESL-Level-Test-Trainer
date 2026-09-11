# Privacy notes — Local Edition

This application is designed to perform interview inference locally in the browser.

## Network activity

Network access is still required for first-time downloads of JavaScript libraries and machine-learning model weights from public package/model hosts. Browser caching may eliminate most repeated downloads.

The application does not contain code that sends interview prompts, learner responses or tester microphone recordings to an OpenAI or other paid inference API.

## Microphone

Microphone access is requested directly by the browser. Push-to-talk audio is decoded in the browser and passed to the local Whisper worker. If a session microphone recording is created, it remains a local browser object unless the user explicitly downloads it.

## Hidden level

The true training band is held in client-side application state. It is hidden from normal UI during the interview but cannot be considered a secure secret because all code runs on the user's device.

## Future analytics

No remote analytics are included in v0.4. If analytics, shared trainer dashboards or central results are added later, those features should be opt-in and documented separately because they would change the privacy model.
