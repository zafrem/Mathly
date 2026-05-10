'use client';

interface MathlyWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class MathlyAudio {
  private ctx: AudioContext | null = null;
  // C Major Scale Frequencies
  private scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

  private init() {
    if (!this.ctx) {
      const Win = window as unknown as MathlyWindow;
      const SelectedContext = window.AudioContext || Win.webkitAudioContext;
      if (SelectedContext) {
        this.ctx = new SelectedContext();
      }
    }
  }

  playScale(index: number) {
    this.init();
    const context = this.ctx;
    if (!context) return;

    const freq = this.scale[index % this.scale.length] * Math.pow(2, Math.floor(index / this.scale.length));
    
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, context.currentTime);
    
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.3);
  }

  playSuccess() {
    this.init();
    const context = this.ctx;
    if (!context) return;
    
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.2);
  }

  playError() {
    this.init();
    const context = this.ctx;
    if (!context) return;
    
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, context.currentTime);
    osc.frequency.linearRampToValueAtTime(100, context.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.2);
  }

  playMilestone() {
    this.init();
    const context = this.ctx;
    if (!context) return;
    
    const now = context.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
}

export const mathlyAudio = typeof window !== 'undefined' ? new MathlyAudio() : null;
