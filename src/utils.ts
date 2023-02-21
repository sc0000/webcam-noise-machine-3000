import {useState, useEffect} from 'react'
import * as Handpose from '@tensorflow-models/handpose'

export const scale = (value: number, [inMin, inMax]: [number, number], [outMin, outMax]: [number, number]): number => {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}


// TODO: Replace with log interpolation!
export const lerp = (A: number, B: number, factor: number): number => {
    return A + (B - A) * factor;
}

export const fixDPI = (canvas: any) => {
    const dpi = window.devicePixelRatio;
    // const canvas = canvasRef.current;
    
    const styleHeight = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
    const styleWidth = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);

    canvas.setAttribute('height', styleHeight * dpi);
    canvas.setAttribute('width', styleWidth * dpi);
  }

  const getWindowDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return { width, height };
}

export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

export const randomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

// TODO: Move both into Audio.js as one array of objects!
export let pitchAreas: DOMRect[] = [];
export let pitches: {pitch: string, min: number, max: number}[] = [];


// export const runHandpose = async (d: (net: any) => void) => {
//     // TODO: Find better way to prevent reloading of the model
//     // if (num === 0) {
     
//     // }
//     console.log('INIT')
  
//     let net = await Handpose.load();
//     console.log("Hand recognition model loaded");
    
//     // Loop and detect hands
//     setInterval(() => {
//       d(net);
//     }, 40);
//   }

  ////////
  const bigTask = (n: number) => {
    const sum = new Array(n)
        .fill(0)
        .map((el, idx) => el + idx)
        .reduce((sum, el) => sum + el, 0);
  
    console.log(sum);
  }
  
  export function runBigTask(n: number) {
    bigTask(n);
    return 'done';
  }
  
  export async function runBigTaskAsync(n: number) {
    bigTask(n);
    return 'done';
  }