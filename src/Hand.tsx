import { useRef, useState, useEffect } from 'react'
// import * as tf from '@tensorflow/tfjs'

import * as Handpose from '@tensorflow-models/handpose'
import Webcam from 'react-webcam'
import { wrap } from 'comlink';
// import { rand } from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import './hand.css'
import { scale, lerp, fixDPI, randomInt, pitches, pitchAreas } from './utils'
import audio from './Audio'
// import Dropdown from './Dropdown'
import PitchArea from './PitchArea'


const Hand = () => {
  ////
  const [data, setData] = useState("");
  ////
 
  const webcamRef: any = useRef(null);
  const canvasRef: any = useRef(null);

  const [num, setNum] = useState(0);

  const coordinates: {x: number, y: number, size: number, angle: number}[] = [];

  let net: any = null;

  const runHandpose = async () => {
    // TODO: Find better way to prevent reloading of the model
    if (num === 0) {
      net = await Handpose.load();
      console.log("Hand recognition model loaded");
      setNum(1);
    }

    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 40);
  }
  
  const detect = async (net: any) => {
    if (typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4) {
        // Get video properties
        const video = webcamRef.current.video;

        // Get intrinsic size of the resource
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Scale canvas to prevent blur
        fixDPI(canvasRef.current);
      
        // Make detections
        const hand = await net?.estimateHands(video);
        // console.log(hand);

        if (coordinates.length === 0) {
          for (let i = 0; i < 21; ++i) {
            const c = {
              x: canvasRef.current.clientWidth / 2,
              y: canvasRef.current.clientHeight / 2,
              size: 8,
              angle: 2 * Math.PI * Math.random(), 
            }
        
            coordinates.push(c);
          }
        }

        // Draw to canvas
        drawHand(hand, videoWidth, videoHeight);
        // console.log('drawHand running');
      }
  }

  const drawHand = async (predictions: any, videoWidth: number, videoHeight: number) => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-2');

    ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-3');

    ctx.lineWidth = 3;
    ctx.lineCap = 'square';

    if (predictions != null && predictions.length > 0) {
      predictions.forEach((p: any) => {
        const landmarks = p.landmarks;
        
        for (let i = 0; i < landmarks.length; ++i) {
          const targetX = canvasRef.current.width - scale(landmarks[i][0], [0, videoWidth], [0, canvasRef.current.width]);
          const targetY = scale(landmarks[i][1], [0, videoHeight], [0, canvasRef.current.height]);
          
          coordinates[i].x = lerp(coordinates[i].x, targetX, 0.08);
          coordinates[i].y = lerp(coordinates[i].y, targetY, 0.08);

          const targetSize = scale(Math.abs(landmarks[i][2]), [0, 80], [2, 32]);
          // const zMicro = scale(Math.abs(landmarks[i][2]), [0, 80], [2, 1000]);
          coordinates[i].size = lerp(coordinates[i].size, targetSize, 0.01);
          
          ctx.fillRect(coordinates[i].x,  coordinates[i].y, coordinates[i].size, coordinates[i].size);          

          //
          // Update corresponding oscillator
          //

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

          audio.oscillators[i].volume.value = scale(coordinates[i].x, [0, canvasRef.current.width], [-48, -12]);
        }
      });
    }

    else {
      for (let i = 0; i < 21; ++i) {
        coordinates[i].angle += Math.PI * 0.005;

        const targetX = (canvasRef.current.width / 2) - Math.sin(coordinates[i].angle) * 300;
        const targetY = (canvasRef.current.height / 2) - Math.cos(coordinates[i].angle) * 300;

        coordinates[i].x = lerp(coordinates[i].x, targetX, 0.08);
        coordinates[i].y = lerp(coordinates[i].y, targetY, 0.08);

        ctx.fillRect(coordinates[i].x, coordinates[i].y, coordinates[i].size, coordinates[i].size);

        // Update corresponding oscillator pitch
        updatePitch(i);

        // TODO: Add to function
        audio.oscillators[i].volume.value = scale(coordinates[i].x, [0, canvasRef.current.width], [-48, -12]);
      }
    }
  }

  // TODO: Move into Audio.js
  const updatePitch = (iterator: number) => {
    const targetPitch = 880 - scale(coordinates[iterator].y, [0, canvasRef.current.height], [220, 880]);
        audio.updatePitch(audio.oscillators[iterator], targetPitch);
  }

  runHandpose();

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
            setNum(num + 1)}}>+</div>
          <div style={{
              marginTop: "0.6rem", marginLeft: "0.3rem", fontSize: "1rem", padding: "0.rem", width: "3rem"
            }}
            
            className="btn btn-hand" onClick={() => {setNum(num - 1)}}>-</div>
          <div style={{
              marginTop: "0.6rem", marginLeft: "0.3rem", fontSize: "1rem", padding: "0.rem"
            }}
            
            className="btn btn-hand" onClick={async () => {

              setData('loading');

              const worker = new Worker(new URL("./worker", import.meta.url), { name: 'runBigTaskWorker', type: 'module'});
              const { runBigTask } = wrap<import('./worker').RunBigTaskWorker>(worker);
              setData(await runBigTask(100000000));
            }}>Web Worker</div>

          
        </div>

        <span>{data}</span>
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