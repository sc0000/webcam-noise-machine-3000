import { useRef, useState, useEffect } from 'react'


import * as handpose from '@tensorflow-models/handpose'
import { Coords3D } from '@tensorflow-models/handpose/dist/pipeline'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

import Webcam from 'react-webcam'
import { wrap } from 'comlink';

import { scale, lerp, fixDPI, randomInt, pitches, pitchAreas } from './utils'
import audio from './Audio'
import PitchArea from './PitchArea'

import './hand.css'

//--------------------------------------------------

const INTERP_SPEED = 0.04;

let prediction: handpose.AnnotatedPrediction[] = [];
let lastPrediction: handpose.AnnotatedPrediction[] = [];

let worker = new Worker(new URL("./predictionWorker", import.meta.url), { name: 'PredictionkWorker', type: 'module'});
let { load, makePrediction, getPrediction, sendImageData } = wrap<import('./predictionWorker').PredictionWorker>(worker);

//--------------------------------------------------

const Hand = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [num, setNum] = useState(1);

  const coordinates: {x: number, y: number, size: number, angle: number}[] = [];

  useEffect(() => { 
    load();
    runHandpose();
  }, []);

  const runHandpose = async () => {
    setInterval(() => {
      detect();
    }, 20);
  }
  
  const detect = async () => {
    if (webcamRef.current &&
      webcamRef.current?.video?.readyState === 4) {
        // Get video properties
        const video = webcamRef.current.video;

        // Get intrinsic size of the resource
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Extract image data
        let videoCanvas = document.createElement('canvas');

        // unnecessary!?
        videoCanvas.width = videoWidth;
        videoCanvas.height = videoHeight;

        const videoCtx = videoCanvas.getContext('2d',{ willReadFrequently: true });

        let imageData: ImageData;

        if (videoCtx !== null) {
          videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
          imageData = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
          // console.log(imageData.data);
          videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
        }

        sendImageData(imageData!);

        if (prediction)
          lastPrediction = prediction;

        prediction = await getPrediction();
       
        // Scale canvas to prevent blur
        fixDPI(canvasRef.current!);

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
  }

  const drawHand = async (prediction: handpose.AnnotatedPrediction[] | undefined, videoWidth: number, videoHeight: number) => {
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
          const targetX = canvasRef.current?.width! - scale(landmarks[i][0], [0, videoWidth], [0, canvasRef.current?.width!]);
          const targetY = scale(landmarks[i][1], [0, videoHeight], [0, canvasRef.current?.height!]);
          
          coordinates[i].x = lerp(coordinates[i].x, targetX, INTERP_SPEED);
          coordinates[i].y = lerp(coordinates[i].y, targetY, INTERP_SPEED);

          const targetSize = scale(Math.abs(landmarks[i][2]), [0, 80], [2, 32]);
          // const zMicro = scale(Math.abs(landmarks[i][2]), [0, 80], [2, 1000]);
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

        const targetX = (canvasRef.current?.width! / 2) - Math.sin(coordinates[i].angle) * 300;
        const targetY = (canvasRef.current?.height! / 2) - Math.cos(coordinates[i].angle) * 300;

        coordinates[i].x = lerp(coordinates[i].x, targetX, INTERP_SPEED * 0.5);
        coordinates[i].y = lerp(coordinates[i].y, targetY, INTERP_SPEED * 0.5);

        ctx?.fillRect(coordinates[i].x, coordinates[i].y, coordinates[i].size, coordinates[i].size);

        // Update corresponding oscillator
        updatePitchNoHand(i);
        updateVolume(i);
      }
    }
  }

  const updatePitch = (landmarks: Coords3D, i: number) => {
    for (let j = 0; j < pitchAreas.length; ++j) {
      if (coordinates[i].y > pitchAreas[j].y) {
        const note = `${pitches[j].pitch}${randomInt(pitches[j].min, pitches[j].max)}`;
        
        let freq = audio.toFrequency(note);
        freq += scale(coordinates[i].y, 
          [pitchAreas[j].y, pitchAreas[j].y + pitchAreas[j].height], 
          [freq / audio.microtonalSpread, -freq / audio.microtonalSpread]);
        
        audio.oscillators[i].set({
          frequency: freq,
          });
      }
    }
  }

  // TODO: Move into Audio.js?
  const updatePitchNoHand = (i: number) => {
    const targetPitch = 880 - scale(coordinates[i].y, [0, canvasRef.current?.height!], [220, 880]);
    audio.updatePitch(audio.oscillators[i], targetPitch);
  }

  const updateVolume = (i: number) => {
    // update volume from x-axis; scaled to a value between -50 and -24
     audio.oscillators[i].volume.value = scale(coordinates[i].x, [0, canvasRef.current?.width!], [-50, -24]);
  }

  useEffect(() => {
    pitchAreas.splice(0, pitchAreas.length);
    document.querySelectorAll('.subdiv').forEach((s) => {
      pitchAreas.push(s.getBoundingClientRect());
    });
    
  }, [num]);

  const createPitchAreas = (n: number) => {
    let pitchAreas = [];

    for (let i = 0; i < n; ++i) {
      // TODO: Make pitch w/ octave transposition into own type
      const sendPitch = (p: {pitch: string, min: number, max: number}) => {
          pitches[i] = p;
      } 

      pitchAreas.push(
        <PitchArea key={i*6} sendPitch={sendPitch}/>
      );
    }

    return pitchAreas;
  }

  return (
    <section id="hand">
      <div className="header">
        <div className="set-subs">
          <div style={{
              marginTop: "0.6rem", marginLeft: "0.3rem", fontSize: "1rem", padding: "0.rem", width: "3rem"
            }}

            className="btn btn-hand" onClick={() => {
            setNum(num + 1)}} onKeyDown={()=>{}}>+</div>
          <div style={{
              marginTop: "0.6rem", marginLeft: "0.3rem", fontSize: "1rem", padding: "0.rem", width: "3rem"
            }}
            
            className="btn btn-hand" onClick={() => {setNum(num - 1)}} onKeyDown={()=>{}}>-</div>
        </div>

        <h3>BROWSER THEREMIN 3000</h3>
        
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