# Webcam Noise Machine 3000

Experimental webcam-controlled synthesizer powered by TensorFlow.js hand recognition, packaged up as an Electron app.

## Demo

[Demo](https://youtu.be/7mXSGJH_6XA). Please note that this is recorded with a phone, with the audio coming straight out of some *suboptimal* laptop speakers, so the sound quality is really poor. Unfortunately, my machine wouldn't handle running this and a screen capture at the same time.

## Build and run

* Setup dependencies: `npm install`. Requires Node 16.15.0 or above.

* Build as an Electron app: `npm run build:web && npm run build:desktop`.

* After building, run: `npm run start:desktop`. This command includes `build:desktop`.

* Theoretically, this app also runs in the browser: `npm run start:web`. However, the UI does not adapt to it (yet). It also has serious performance issues in Firefox.

## Generate executable

* After building, run `npm run make:win` or `npm run make:macos`.

## Known issues

* FX parameter sliders are sometimes not updated correctly when assigned to another waveform.
* Some sliders have awkward scaling.
* As of yet, the camera needs to see a hand for the loading screen to disappear.
* This app hasn't been maintained in a while, and a lot of dependencies are brought in in older versions.
