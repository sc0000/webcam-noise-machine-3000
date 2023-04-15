import { useRef, useState, useEffect, useCallback, FC } from 'react'

import * as handpose from '@tensorflow-models/handpose'
import { Coords3D } from '@tensorflow-models/handpose/dist/pipeline'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

import Webcam from 'react-webcam'
import { wrap } from 'comlink';

import { scale, mapLinearToLogarithmicScale, lerp, fixDPI, randomInt } from './utils'
import audio, { Pitch } from './Audio'
import PitchArea from './PitchArea'
import { ControlProps } from './ControlLayer'

import './hand.css'

//--------------------------------------------------

const INTERP_SPEED = 0.04;
const INTERP_SPEED_NO_HAND = 0.02;

const coordinates: {x: number, y: number, size: number, angle: number}[] = [];

const pitchAreas: DOMRect[] = [];
const pitches: Pitch[] = [];

let prediction: handpose.AnnotatedPrediction[] = [];
let lastPrediction: handpose.AnnotatedPrediction[] = [];

const worker = new Worker(new URL("./predictionWorker", import.meta.url), { name: 'PredictionkWorker', type: 'module'});
const { load, getPrediction, sendImageData } = wrap<import('./predictionWorker').PredictionWorker>(worker);

//--------------------------------------------------

const Hand: FC<ControlProps> = ({
  activeUIElement, sendActiveUIElementToParent
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Current number of pitch areas
  const [num, setNum] = useState(1);

  const [startButton, setStartButton] = useState('start audio');

  const sendActiveUIElementToHand = (i: number): void => {
    sendActiveUIElementToParent(i);
  }

  // TODO: Move into Audio class
  const updatePitch = (landmarks: Coords3D, i: number) => {
    for (let j = 0; j < pitchAreas.length; ++j) {
      if (coordinates[i].y > pitchAreas[j].y && coordinates[i].y < (pitchAreas[j].y + pitchAreas[j].height)) {
        const note = `${pitches[j]?.pitch}${randomInt(pitches[j].min, pitches[j].max)}`;
        let freq = audio.toFrequency(note);
        freq *= Math.pow(2, pitches[j].deviation / 1200); // add in cent-wise deviation

        // ADDING PITCH DEVIATIONS DEPENDING ON DISTANCE FROM THE CENTER LINE OF THE PITCH AREA (amount set by global 'microtonal deviation' slider)
        const pitchArea = pitchAreas[j];
        const center = pitchArea.y + (pitchArea.height / 2);
        const deviation = Math.abs(coordinates[i].y - center);

        // For scaling the deviation from the middle line of the pitch area, we first flip over values above the line, 
        const landmarkY = coordinates[i].y > center ? coordinates[i].y : coordinates[i].y + (2 * deviation);
        // then get direction back into the picture after scaling
        const direction = (coordinates[i].y > center ? -1 : 1);

        const scaledDeviation = mapLinearToLogarithmicScale(landmarkY, center, center + (pitchArea.height / 2), 0.1, audio.maxDeviation(freq)) * 
          direction * audio.microtonalSpread;

        freq += scaledDeviation;

        if (freq < 0) freq = 0;

        audio.oscillators[i].set({
          frequency: freq,
        });
      }
    }
  }

  // TODO: Move into Audio class
  const updatePitchNoHand = (i: number) => {
    const targetPitch: number | null = canvasRef.current?.height ? 
      audio.noHandMaxPitch - mapLinearToLogarithmicScale(coordinates[i].y, 0.0001, canvasRef.current.height, audio.noHandMaxPitch / 4, audio.noHandMaxPitch)
      : null;
    
    if (audio.oscillators[i] && targetPitch)
      audio.updatePitch(audio.oscillators[i], targetPitch);
  }

  // TODO: Move into Audio class
  const updateVolume = (i: number) => {
    

    if (canvasRef.current?.width) {
      const minVolumeMaster = audio.maxVolumeMaster * 2;

      audio.oscillators[i].volume.value = mapLinearToLogarithmicScale(
        coordinates[i].x, 0, canvasRef.current.width, Math.abs(audio.maxVolumeMaster), Math.abs(minVolumeMaster)
      ) + minVolumeMaster + audio.maxVolumeMaster + audio.volumeModifiers[audio.oscillators[i].type as string];
    }
  }

  const drawHand = useCallback(async (prediction: handpose.AnnotatedPrediction[] | undefined, videoWidth: number, videoHeight: number) => {
    if (!prediction) prediction = lastPrediction;
    
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
            ctx.fillRect(coordinates[i].x,  coordinates[i].y, coordinates[i].size, coordinates[i].size);          

          // Update corresponding oscillator
          updatePitch(landmarks, i);
          updateVolume(i);
        }
      });
    }

    else {
      for (let i = 0; i < 21; ++i) {
        coordinates[i].angle += Math.PI * 0.005;

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
  }, []);

  const detect = useCallback(async () => {
    if (webcamRef.current &&
      webcamRef.current?.video?.readyState === 4) {
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

        const videoCtx = videoCanvas.getContext('2d',{ willReadFrequently: true });

        let imageData: ImageData | null = null;

        if (videoCtx !== null) {
          videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
          imageData = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
          // console.log(imageData.data);
          videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
        }

        if (imageData) sendImageData(imageData);

        if (prediction)
          lastPrediction = prediction;

        prediction = await getPrediction();

        // Scale canvas to prevent blur
        if (canvasRef.current) fixDPI(canvasRef.current);

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

        // Draw to canvas
        drawHand(prediction, videoWidth, videoHeight);
      }
  }, [drawHand]);

  const runHandpose = useCallback(async () => {
    const loop = setInterval(() => {
      detect();
    }, 20);

    return () => clearInterval(loop);
  }, [detect]);

  useEffect(() => { 
    load();
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
      // TODO: Make pitch w/ octave transposition into own type
      const sendPitch = (p: Pitch) => {
          pitches[i] = p;
      } 

      pitchAreas.push(
        <PitchArea  key={i}
                    i={i}
                    sendPitch={sendPitch}
                    activeUIElement={activeUIElement}
                    sendActiveUIElementToParent={sendActiveUIElementToHand}/>
      );
    }

    return pitchAreas;
  }

//--------------------------------------------------  

  return (
    <section id="hand">
      <div className="header" style={{display: "flex", width: "calc(100% - 307px)", justifyContent: "center", overflow: "hidden"}}>
        
        <div className="set-subs">
          <div style={{
              marginTop: "9px", marginLeft: "6px", fontSize: "1rem", padding: "0.rem", width: "3rem"
            }}

            className={num < 13 ? "btn btn-hand" : "btn-hand-disabled"} onKeyDown={()=>{}} onClick={() => {
              if (num < 13) setNum(num + 1);
            }}>
              +
          </div>

          <div style={{
              marginTop: "9px", marginLeft: "6px", fontSize: "1rem", padding: "0.rem", width: "3rem"
            }}
            
            className={num > 0 ? "btn btn-hand" : "btn-hand-disabled"} onKeyDown={()=>{}} onClick={() => {
              if (num > 0) setNum(num - 1);
            }}>
              -
          </div>
        </div>

        <h3>WEBCAM NOISE MACHINE 3000</h3>

        <div style={{display: "flex", alignItems: "center", marginRight: "9px", marginLeft: "auto"}}>
            <div className="btn btn-hand" style={{padding: "12px", width: "120px"}} onKeyDown={()=>{}}
              onClick={() => {
                  setStartButton(startButton === 'stop audio' ? 'start audio' : 'stop audio');
                  startButton === 'start audio' ? audio.start() : audio.stop();
                }
              }
              >{startButton}
            </div>
        </div>
          
      </div>
      
      <Webcam ref={webcamRef} width={0} height={0} />

      <div className="container">
        <canvas ref={canvasRef} />
        <div className="subdivs">
          
          { createPitchAreas(num) }
          
        </div>       
      </div>
    </section>
  )
}

export default Hand