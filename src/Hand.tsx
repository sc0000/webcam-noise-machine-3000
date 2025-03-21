// Copyright 2025 Sebastian Cyliax

import { useRef, useState, useEffect, useCallback, FC } from 'react'

import * as handpose from '@tensorflow-models/handpose'
import { Coords3D } from '@tensorflow-models/handpose/dist/pipeline'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

import Webcam from 'react-webcam'
import { wrap } from 'comlink';
import * as Tone from 'tone';

import { scale, mapLinearToLog2, lerp, fixDPI, randomInt, randomFloat } from './utils'
import audio, { Pitch } from './Audio'
import LoadingScreen from './LoadingScreen'
import PitchArea from './PitchArea'
import { ControlProps } from './ControlLayer'

import './hand.css'

//--------------------------------------------------

const INTERP_SPEED = 0.08;
const INTERP_SPEED_NO_HAND = 0.04;

const coordinates: { x: number, y: number, size: number, angle: number }[] = [];

const pitchAreas: DOMRect[] = [];
const pitches: Pitch[] = [];

const noHandAngleIncrement: number[] = [];

for (let i = 0; i < 21; ++i) {
  noHandAngleIncrement.push(randomFloat(0.002, 0.008))
}

let prediction: handpose.AnnotatedPrediction[] = [];

const worker = new Worker(new URL("./predictionWorker", import.meta.url), { name: 'PredictionWorker', type: 'module' });
const { load, getPrediction, sendImageData } = wrap<import('./predictionWorker').PredictionWorker>(worker);

//--------------------------------------------------

const Hand: FC<ControlProps> = ({
  activeUIElement, sendActiveUIElementToParent
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);

  // Current number of pitch areas
  const [num, setNum] = useState(0);

  const [startButton, setStartButton] = useState('start audio');

  const sendActiveUIElementToHand = (i: number): void => {
    sendActiveUIElementToParent(i);
  }

  const updatePitch = (landmarks: Coords3D, i: number) => {
    for (let j = 0; j < pitchAreas.length; ++j) {
      if (coordinates[i].y > pitchAreas[j].y && coordinates[i].y < (pitchAreas[j].y + pitchAreas[j].height)) {
        const note = `${pitches[j]?.pitch}${randomInt(pitches[j].min, pitches[j].max)}`;
        let freq = audio.toFrequency(note);
        freq *= Math.pow(2, pitches[j].deviation / 1200); // add in cent-wise deviation

        // ADDING PITCH DEVIATIONS DEPENDING ON DISTANCE FROM THE CENTER LINE OF THE PITCH AREA 
        // (amount set by global 'microtonal deviation' slider)
        const pitchArea = pitchAreas[j];
        const center = pitchArea.y + (pitchArea.height / 2);
        const deviation = Math.abs(coordinates[i].y - center);

        // For scaling the deviation from the middle line of the pitch area, we first flip over values above the line, 
        const landmarkY = coordinates[i].y > center ? coordinates[i].y : coordinates[i].y + (2 * deviation);
        // then get direction back into the picture after scaling
        const direction = (coordinates[i].y > center ? -1 : 1);

        const scaledDeviation = mapLinearToLog2(landmarkY, center,
          center + (pitchArea.height / 2), 0.1, audio.maxDeviation(freq))
          * direction * audio.microtonalSpread;

        freq += scaledDeviation;

        if (!freq || freq < 0) freq = 0;

        audio.oscillators[i].set({
          frequency: freq,
        });
      }
    }
  }

  const updatePitchNoHand = (i: number) => {
    const targetPitch: number | null = canvasRef.current?.height ?
      audio.noHandMaxPitch - mapLinearToLog2(coordinates[i].y, 0.0001,
        canvasRef.current.height, audio.noHandMaxPitch / 4, audio.noHandMaxPitch)
      : null;

    if (audio.oscillators[i] && targetPitch)
      audio.updatePitch(audio.oscillators[i], targetPitch);
  }

  const updateVolume = (i: number) => {
    if (canvasRef.current?.width) {
      const minVolumeMaster = audio.maxVolumeMaster * 2;

      audio.oscillators[i].volume.value =
        scale(coordinates[i].x, 0, canvasRef.current.width, minVolumeMaster, audio.maxVolumeMaster) *
        audio.volumeModifiers[audio.oscillators[i].type as string];
    }
  }

  const updatePrediction = async () => {
    while (true) {
      prediction = await getPrediction();
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  const drawHand = useCallback(
    async (prediction: handpose.AnnotatedPrediction[] | undefined, videoWidth: number, videoHeight: number
    ) => {
      const ctx = canvasRef.current?.getContext("2d");

      if (ctx) {
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-2');

        ctx.strokeStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-3');

        ctx.lineWidth = 3;
        ctx.lineCap = 'square';
      }

      if (prediction != null && prediction.length > 0) {
        prediction.forEach((p: handpose.AnnotatedPrediction) => {
          const landmarks = p.landmarks;

          for (let i = 0; i < landmarks.length; ++i) {
            const targetX: number | null = canvasRef.current?.width ?
              canvasRef.current.width - scale(landmarks[i][0], 0, videoWidth, 0, canvasRef.current?.width)
              : null;

            const targetY: number | null = canvasRef.current?.height ?
              scale(landmarks[i][1], 0, videoHeight, 0, canvasRef.current.height)
              : null;

            if (targetX)
              coordinates[i].x = lerp(coordinates[i].x, targetX, INTERP_SPEED);

            if (targetY)
              coordinates[i].y = lerp(coordinates[i].y, targetY, INTERP_SPEED);

            const targetSize = scale(Math.abs(landmarks[i][2]), 0, 80, 2, 32);
            coordinates[i].size = lerp(coordinates[i].size, targetSize, 0.01);

            if (ctx)
              ctx.fillRect(coordinates[i].x, coordinates[i].y, coordinates[i].size, coordinates[i].size);

            // Update corresponding oscillator
            if (pitchAreas.length > 0)
              updatePitch(landmarks, i);

            else updatePitchNoHand(i);

            updateVolume(i);
          }
        });
      }

      else {
        for (let i = 0; i < 21; ++i) {
          coordinates[i].angle += Math.PI * noHandAngleIncrement[i];

          const targetX: number | null = canvasRef.current?.width ?
            (canvasRef.current.width / 2) - Math.sin(coordinates[i].angle) * 300
            : null;

          const targetY: number | null = canvasRef.current?.height ?
            (canvasRef.current?.height / 2) - Math.cos(coordinates[i].angle) * 300
            : null;

          if (targetX)
            coordinates[i].x = lerp(coordinates[i].x, targetX, INTERP_SPEED_NO_HAND);

          if (targetY)
            coordinates[i].y = lerp(coordinates[i].y, targetY, INTERP_SPEED_NO_HAND);

          ctx?.fillRect(coordinates[i].x, coordinates[i].y, coordinates[i].size, coordinates[i].size);

          // Update corresponding oscillator
          updatePitchNoHand(i);
          updateVolume(i);
        }
      }
    }, [loading]);

  const render = useCallback(() => {
    if (webcamRef.current && webcamRef.current?.video?.readyState === 4) {
      // Get video properties
      const video = webcamRef.current.video;

      // Get intrinsic size of the resource
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Extract image data
      const videoCanvas = document.createElement('canvas');

      // unnecessary!?
      videoCanvas.width = videoWidth;
      videoCanvas.height = videoHeight;

      const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true });

      let imageData = null;

      if (videoCtx !== null) {
        videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        imageData = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
        videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
      }

      if (imageData) sendImageData(imageData);

      if (canvasRef.current && coordinates.length === 0) {
        for (let i = 0; i < 21; ++i) {
          const c = {
            x: canvasRef.current?.clientWidth / 2,
            y: canvasRef.current?.clientHeight / 2,
            size: 8,
            angle: 2 * Math.PI * Math.random(),
          }

          coordinates.push(c);
        }
      }

      // Scale canvas to prevent blur
      if (canvasRef.current) fixDPI(canvasRef.current);

      if (prediction.some(e => e) && loading) setLoading(false);

      // Draw to canvas
      drawHand(prediction, videoWidth, videoHeight);
    }
  }, [drawHand, loading]);

  const runHandpose = useCallback(() => {
    const loop = setInterval(() => {
      render();
    }, 30);

    return () => clearInterval(loop);
  }, [render]);

  useEffect(() => {
    load();
    updatePrediction();
    runHandpose();
  }, [runHandpose]);

  useEffect(() => {
    pitchAreas.splice(0, pitchAreas.length);
    document.querySelectorAll('.subdiv').forEach((s) => {
      pitchAreas.push(s.getBoundingClientRect());
    });

  }, [num]);

  const createPitchAreas = (n: number) => {
    const pitchAreas = [];

    for (let i = 0; i < n; ++i) {
      const sendPitch = (p: Pitch) => {
        pitches[i] = p;
      }

      pitchAreas.push(
        <PitchArea key={i}
          i={i}
          sendPitch={sendPitch}
          activeUIElement={activeUIElement}
          sendActiveUIElementToParent={sendActiveUIElementToHand} />
      );
    }

    return pitchAreas;
  }

  //--------------------------------------------------  

  return (
    <section id="hand">
      <div className="header"
        style={{
          display: "flex",
          width: "calc(100% - 307px)",
          justifyContent: "center",
          overflow: "hidden"
        }}>

        <div className="set-subs">
          <div style={{
            marginTop: "9px",
            marginLeft: "6px",
            fontSize: "1rem",
            padding: "0.rem",
            width: "3rem"
          }}

            className={num < 13 && !loading ? "btn btn-hand" : "btn btn-hand btn-hand-disabled"}
            onKeyDown={() => { }}
            onClick={() => {
              if (num < 13) setNum(num + 1);
            }}>
            +
          </div>

          <div style={{
            marginTop: "9px",
            marginLeft: "6px",
            fontSize: "1rem",
            padding: "0.rem",
            width: "3rem"
          }}

            className={num > 0 && !loading ? "btn btn-hand" : "btn btn-hand btn-hand-disabled"}
            onKeyDown={() => { }}
            onClick={() => {
              if (num > 0) setNum(num - 1);
            }}>
            -
          </div>
        </div>

        <h3>WEBCAM NOISE MACHINE 3000</h3>

        <div style={{
          display: "flex",
          alignItems: "center",
          marginRight: "9px",
          marginLeft: "auto"
        }}>

          <div className={!loading ? "btn btn-hand" : "btn btn-hand btn-hand-disabled"}
            style={{
              padding: "12px",
              width: "120px"
            }}
            onKeyDown={() => { }}
            onClick={async () => {
              await Tone.start();
              setStartButton(startButton === 'stop audio' ? 'start audio' : 'stop audio');
              startButton === 'start audio' ? audio.start() : audio.stop();
            }
            }
          >{startButton}
          </div>
        </div>

      </div>

      <Webcam
        ref={webcamRef}
        width={0}
        height={0}
        videoConstraints={{ facingMode: "user" }}
      />

      <div className="container">

        <div className="subdivs">
          <canvas ref={canvasRef} />
          {!loading ? createPitchAreas(num) : <LoadingScreen />}
        </div>
      </div>
    </section>
  )
}

export default Hand
