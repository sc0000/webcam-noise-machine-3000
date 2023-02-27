import {useState, useEffect} from 'react'

export const scale = (value: number, [inMin, inMax]: [number, number], [outMin, outMax]: [number, number]): number => {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}


// TODO: Replace with log interpolation!
export const lerp = (A: number, B: number, factor: number): number => {
    return A + (B - A) * factor;
}

export const fixDPI = (canvas: HTMLCanvasElement) => {
    const dpi = window.devicePixelRatio;
    // const canvas = canvasRef.current;
    
    const styleHeight = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
    const styleWidth = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);

    canvas.setAttribute('height', (styleHeight * dpi).toString());
    canvas.setAttribute('width', (styleWidth * dpi).toString());
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