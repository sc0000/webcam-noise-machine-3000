import * as Tone from 'tone'
import { logerp } from './utils'

class Audio {
  recorder = new Tone.Recorder();
  players: Tone.Player[] = [];
  oscillators: Tone.Oscillator[] = [];

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
  }

  start(): void {
      this.oscillators.forEach(o => o.start());
  }

  stop(): void {
      this.oscillators.forEach(o => o.stop());
  }

  startRecording(): void {
      this.recorder.start();
  }

  async stopRecording(i: number): Promise<Tone.Player[]> {
      const recording = await this.recorder.stop();

      this.players[i] = new Tone.Player({
          url: URL.createObjectURL(recording),
          loop: true,
          autostart: false,
          fadeIn: 0.5,
          fadeOut: 0.5,
      }).toDestination();

      console.log(`from audio.stopRecording(): ${this.players}`);

      return this.players;
  }

  setOctaveSpread(spread: {min: number, max: number}) {
      this.octaveSpread = {
          min: spread.min,
          max: spread.max,
      }
  }

  updatePitch(osc: Tone.Oscillator, targetPitch: number) {
      // TODO: Find audio appropriate interpolation function
      osc.frequency.value = logerp(osc.frequency.value as number, targetPitch, 0.1);
  }

  toFrequency(note: string) {
      return Tone.Frequency(note).toFrequency();
  }

  maxDeviation(frequency: number) {
    const B = 25 + 75 * (1 + 1.4 * Math.pow(Math.abs(frequency) / 1000, 2)) ** 0.69; // calculate critical bandwidth
    const maxDev = Math.max(B / 2, 0); // calculate maximum deviation (set to zero if negative)
    return maxDev;
  }
}

const audio = new Audio();

export default audio;
