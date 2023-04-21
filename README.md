# Webcam Noise Machine 3000

Webcam-controlled synth powered by TensorFlow.js hand recognition, packaged up as an Electron app.

## Build and run

Setup modules: `npm install`. Requires Node 16.15.0 or above.

Run in the browser: `npm run start:web`

Build as an Electron app `npm run build:web` and `npm run build:desktop`
Run: `npm run start:desktop`. This command includes build:desktop.

Generate executable:

`npm run make:win`
`npm run make:macos`
`npm run make:linux`

## Known issue

* FX parameter sliders are sometimes not updated correctly when assigned to another waveform.