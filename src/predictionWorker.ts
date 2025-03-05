// Copyright 2025 Sebastian Cyliax

import * as handpose from '@tensorflow-models/handpose'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

import { expose } from 'comlink'

let model: handpose.HandPose | null = null;
let prediction: handpose.AnnotatedPrediction[] = [];
let imageData: ImageData;

const load = async () => {
  if (model !== null) return;

  model = await handpose.load();
  
  if (model) console.log("Hand recognition model loaded");

  setInterval(() => {
      makePrediction();
  }, 20);
}

const makePrediction = async () => {
  if (imageData && model?.estimateHands(imageData))
    prediction = await model?.estimateHands(imageData);
}

const getPrediction = (): handpose.AnnotatedPrediction[] => {
  return prediction;
}

const sendImageData = (iD: ImageData) => {
  imageData = iD;
}

const worker = {
  load, getPrediction, sendImageData
}

export type PredictionWorker = typeof worker;
expose(worker);
