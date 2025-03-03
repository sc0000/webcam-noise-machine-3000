import {useState, useEffect} from 'react'

export const scale = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

export const mapLinearToLogarithmicScale = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
    if (value <= 0) return outMin;
        
    const log_value = Math.log(value + (Math.abs(inMin) + Math.abs(inMax)) / 1000);
    const log_inMin = Math.log(inMin + (Math.abs(inMin) + Math.abs(inMax)) / 1000);
    const log_inMax = Math.log(inMax + (Math.abs(inMin) + Math.abs(inMax)) / 1000);
    const log_outMin = Math.log(outMin);
    const log_outMax = Math.log(outMax);
    const log_result = ((log_value - log_inMin) / (log_inMax - log_inMin)) * (log_outMax - log_outMin) + log_outMin;
    
    return Math.exp(log_result);
}

export const lerp = (A: number, B: number, factor: number): number => {
    return A + (B - A) * factor;
}

export const logerp = (A: number, B: number, factor: number): number => {
  const safeA = Math.max(A, 0.0001);
  const safeB = Math.max(B, 0.0001);

  const logA = Math.log10(safeA);
  const logB = Math.log10(safeB);
  const logFactor = logA + (logB - logA) * factor;
  return Math.pow(10, logFactor);
}

export const fixDPI = (canvas: HTMLCanvasElement) => {
    const dpi = window.devicePixelRatio;
    
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
