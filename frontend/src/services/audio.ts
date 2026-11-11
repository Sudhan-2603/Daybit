import type { RingtoneOption } from '../types';

export type RingtoneType = RingtoneOption;

class AudioService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.2) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn('Audio playback not allowed or failed:', err);
    }
  }

  public playRingtone(ringtone: RingtoneType | string) {
    const tone = ringtone as RingtoneType;
    switch (tone) {
      case 'chime':
        this.playChime();
        break;
      case 'digital-bell':
        this.playDigitalBell();
        break;
      case 'marimba':
        this.playMarimba();
        break;
      case 'pulse':
        this.playPulse();
        break;
      case 'gentle-gong':
        this.playGentleGong();
        break;
      default:
        this.playChime();
    }
  }

  private playChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.6, 'sine', 0.25);
      }, idx * 120);
    });
  }

  private playDigitalBell() {
    const notes = [880, 880, 1174.66];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle', 0.2);
      }, idx * 150);
    });
  }

  private playMarimba() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'sine', 0.3);
      }, idx * 100);
    });
  }

  private playPulse() {
    const notes = [300, 450, 600, 750];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sawtooth', 0.1);
      }, idx * 90);
    });
  }

  private playGentleGong() {
    this.playTone(220, 2.0, 'sine', 0.4);
    setTimeout(() => {
      this.playTone(440, 1.5, 'sine', 0.2);
    }, 50);
  }
}

export const audioService = new AudioService();
