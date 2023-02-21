import * as Tone from 'tone'
// import { TickSignal } from 'tone/build/esm/core/clock/TickSignal';
import { lerp } from './utils'

class Audio {
// member vars
  recorder = new Tone.Recorder();
  players: Tone.Player[] = [];
  oscillators: Tone.Oscillator[] = [];

  octaveSpread = {
    min: 3, 
    max: 6
  };

  microtonalSpread = 1000;

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
          // reverse: true,
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
      osc.frequency.value = lerp(osc.frequency.value as number, targetPitch, 0.1);
  }

  toFrequency(note: string) {
      // console.clear();
      // console.log(freq);
      return Tone.Frequency(note).toFrequency();
  }
}

const audio = new Audio();

export default audio;
