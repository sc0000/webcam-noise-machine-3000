# Webcam Noise Machine 3000

Webcam-controlled synth powered by TensorFlow.js hand recognition, packaged up as an Electron app.

## Build and run

* Setup dependencies: `npm install`. Requires Node 16.15.0 or above.

* Run in the browser: `npm run start:web`. Unfortunately, this app has serious performance issues in Firefox.

* Build as an Electron app: `npm run build:web && npm run build:desktop`.

* After building, run: `npm run start:desktop`. This command includes `build:desktop`.

## Generate executable

* After building, run `npm run make:win` or `npm run make:macos`.

## Known issues

* FX parameter sliders are sometimes not updated correctly when assigned to another waveform.
* Usually, the camera needs to see a hand for the loading screen to disappear.
