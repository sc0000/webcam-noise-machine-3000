// Copyright 2025 Sebastian Cyliax

import {useState, useEffect} from 'react'

export const scale = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const factor = (value - inMin) / (inMax - inMin);

  return  lerp(outMin, outMax, factor);
}

export const mapLinearToLog2 = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
    if (value <= 0) return outMin;

    const factor = (value - inMin) / (inMax - inMin);
    
    const outMinLog = Math.log2(outMin);
    const outMaxLog = Math.log2(outMax);

    const outExp = outMinLog + (outMaxLog - outMinLog) * factor;

    return Math.pow(2, outExp);
}

export const mapLog2ToLinear = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
    
    const valueLog = Math.log2(value);
    const inMinLog = Math.log2(inMin);
    const inMaxLog = Math.log2(inMax);

    const factor = (valueLog - inMinLog) / (inMaxLog - inMinLog);
    
    return lerp(outMin, outMax, factor);
}

export const mapLinearToLog10 = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
    if (value <= 0) return outMin;

    const factor = (value - inMin) / (inMax - inMin);
    
    const outMinLog = Math.log10(outMin);
    const outMaxLog = Math.log10(outMax);

    const outExp = lerp(outMinLog, outMaxLog, factor);

    return Math.pow(10, outExp);
}

export const lerp = (A: number, B: number, factor: number): number => {
    return A + (B - A) * factor;
}

export const logerp2 = (A: number, B: number, factor: number): number => {
  const safeA = Math.max(A, 0.0001);
  const safeB = Math.max(B, 0.0001);

  const logA = Math.log2(safeA);
  const logB = Math.log2(safeB);
  const logFactor = logA + (logB - logA) * factor;
  
  return Math.pow(2, logFactor);
}

export const logerp10 = (A: number, B: number, factor: number): number => {
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

export const randomFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
}
