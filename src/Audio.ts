// Copyright 2025 Sebastian Cyliax

import * as Tone from 'tone'
import { logerp2 } from './utils'

//--------------------------------------------------

export type Pitch = {
    pitch: string,
    deviation: number,
    min: number,
    max: number, 
}

interface volumeModifierProps {
  [waveform: string]: number;
}

export const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'];

export const EFFECTS_PARAMETERS = ["tremolo-frequency", "tremolo-depth", "reverb-decay", "reverb-mix", "volume"];

//--------------------------------------------------

class Audio {
  recorder = new Tone.Recorder();
  players: Tone.Player[] = [];
  oscillators: Tone.Oscillator[] = [];
  tremolos: Tone.Tremolo[] = [];
  reverbs: Tone.Reverb[] = [];
  
  volumeModifiers: volumeModifierProps = {
    sine: 1,
    triangle: 1,
    sawtooth: 1,
    square: 1
  }

  
  minMaxVolume = -60;
  maxMaxVolume = -18;
  maxVolumeMaster = (this.minMaxVolume + this.maxMaxVolume) / 2;

  minInvVolumeModifier = 0.5;
  maxInvVolumeModifer = 1.25;

  noHandMaxPitch = 880;

  octaveSpread = {
    min: 3, 
    max: 6
  };

  microtonalSpread = 0;

  constructor() {
    for (let i = 0; i < 21; ++i) {
        const osc = new Tone.Oscillator(Math.random() * 880, 'square').connect(this.recorder).toDestination();
        osc.volume.value = -30;
        this.oscillators.push(osc);
    }

    for (let i = 0; i < 4; ++i) {
      const tremolo = new Tone.Tremolo(1, 0.1).toDestination();
      this.tremolos.push(tremolo);

      const reverb = new Tone.Reverb(3.0).toDestination();
      reverb.set({
        // decay: 2.0,
        wet: 0.6,
      });

      this.reverbs.push(reverb);
    }
  }

  start(): void {
    this.tremolos.forEach(t => t.start());
    this.oscillators.forEach(o => o.start());
  }

  stop(): void {
    this.tremolos.forEach(t => t.stop());
    this.oscillators.forEach(o => o.stop());
  }

  startRecording(): void {
    this.recorder.start();
  }

  async stopRecording(i: number): Promise<Tone.Player[]> {
    const recording = await this.recorder.stop();

    if (this.players[i] !== undefined)
      this.players[i].dispose();

    this.players[i] = new Tone.Player({
        url: URL.createObjectURL(recording),
        loop: true,
        autostart: true,
        fadeIn: 0.5,
        fadeOut: 0.5,
    }).toDestination();

    // console.log(`from this.stopRecording(): ${this.players}`);

    return this.players;
  }

  setOctaveSpread(spread: {min: number, max: number}) {
    this.octaveSpread = {
        min: spread.min,
        max: spread.max,
    }
  }

  updatePitch(osc: Tone.Oscillator, targetPitch: number) {
    osc.frequency.value = logerp2(osc.frequency.value as number, targetPitch, 0.1);
  }

  toFrequency(note: string) {
    return Tone.Frequency(note).toFrequency();
  }

  maxDeviation(frequency: number) {
    const criticalBandwidth = 25 + 75 * (1 + 1.4 * Math.pow(Math.abs(frequency) / 1000, 2)) ** 0.69;
    const maxDev = Math.max(criticalBandwidth / 2, 0);
    return maxDev;
  }
}

const audio = new Audio();

export default audio;
