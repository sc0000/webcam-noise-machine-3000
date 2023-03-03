import {useState, useEffect} from 'react'

export const scale = (value: number, [inMin, inMax]: [number, number], [outMin, outMax]: [number, number]): number => {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

export const logScale = (value: number, [inMin, inMax]: [number, number], [outMin, outMax]: [number, number]): number => {
    const logX1 = Math.log(outMin);
    const logX2 = Math.log(outMax);
    const logRatio = logX2 - logX1;

    const logX = Math.log(value);
    const logXRatio = (logX - logX1);
    const ratio = logXRatio / logRatio;

    return (outMin) * Math.pow((outMax / outMin), ratio);

    // const b = (outMax - outMin) / Math.log(inMax / inMin);
    // const a = outMin - b * Math.log(inMin);
    // const result = a + b * Math.log(value);

    // console.log(result);

    // return result;
}

export const mapLinearToLogarithmicScale = (x: number, x1: number, x2: number, y1: number, y2: number): number => {
    if (x <= 0) {
        return y1;
        }
        const log_x = Math.log(x + (Math.abs(x1) + Math.abs(x2)) / 1000);
        const log_x1 = Math.log(x1 + (Math.abs(x1) + Math.abs(x2)) / 1000);
        const log_x2 = Math.log(x2 + (Math.abs(x1) + Math.abs(x2)) / 1000);
        const log_y1 = Math.log(y1);
        const log_y2 = Math.log(y2);
        const log_y = ((log_x - log_x1) / (log_x2 - log_x1)) * (log_y2 - log_y1) + log_y1;
        return Math.exp(log_y);
}


// TODO: Replace with log interpolation!
export const lerp = (A: number, B: number, factor: number): number => {
    return A + (B - A) * factor;
}

// export const logerp = (A: number, B: number, factor: number): number => {
//     return Math.log(A) + (Math.log(B) - Math.log(A)) * factor;
// }

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