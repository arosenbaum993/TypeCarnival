// Web Audio API procedural sound synthesizer for TypeCarnival
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('typecarnival_sound_muted');
        this.isMuted = saved === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('typecarnival_sound_muted', String(this.isMuted));
      }
    } catch {
      // ignore security restrictions
    }
    if (!this.isMuted) {
      this.playTicketChime();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playKeyClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playKeyError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playTicketChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.18);
      });
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playLessonComplete(isMastered: boolean = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Arpeggiated celebratory fanfare: C5, E5, G5, B5, C6 with carnival shimmer
      const notes = isMastered
        ? [
            { freq: 523.25, time: 0.0, type: 'triangle' as OscillatorType, dur: 0.18 }, // C5
            { freq: 659.25, time: 0.08, type: 'triangle' as OscillatorType, dur: 0.18 }, // E5
            { freq: 783.99, time: 0.16, type: 'triangle' as OscillatorType, dur: 0.18 }, // G5
            { freq: 987.77, time: 0.24, type: 'triangle' as OscillatorType, dur: 0.22 }, // B5
            { freq: 1046.5, time: 0.32, type: 'sine' as OscillatorType, dur: 0.45 },     // C6
            { freq: 1318.51, time: 0.44, type: 'sine' as OscillatorType, dur: 0.55 },    // E6 carnival bell
          ]
        : [
            { freq: 440.0, time: 0.0, type: 'triangle' as OscillatorType, dur: 0.15 },
            { freq: 554.37, time: 0.1, type: 'triangle' as OscillatorType, dur: 0.15 },
            { freq: 659.25, time: 0.2, type: 'sine' as OscillatorType, dur: 0.35 },
          ];

      notes.forEach(({ freq, time, type, dur }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + time);

        gain.gain.setValueAtTime(0.14, this.ctx!.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + time);
        osc.stop(this.ctx!.currentTime + time + dur);
      });
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playPrizeRedeem() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Carnival Jackpot chime: rapid ascending glissando + ticket chime cascade
      const prizeChords = [
        { freq: 587.33, time: 0.0, dur: 0.15 },  // D5
        { freq: 739.99, time: 0.07, dur: 0.15 }, // F#5
        { freq: 880.0, time: 0.14, dur: 0.18 },  // A5
        { freq: 1174.66, time: 0.22, dur: 0.25 },// D6
        { freq: 1479.98, time: 0.30, dur: 0.40 },// F#6
      ];

      prizeChords.forEach(({ freq, time, dur }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + time);

        gain.gain.setValueAtTime(0.16, this.ctx!.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + time);
        osc.stop(this.ctx!.currentTime + time + dur);
      });

      // Secondary carnival prize bell ring
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(1760, this.ctx.currentTime); // A6
        bellGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        bell.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bell.start();
        bell.stop(this.ctx.currentTime + 0.3);
      }, 350);
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playVictoryFanfare() {
    this.playLessonComplete(true);
  }

  public playBalloonPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Audio context policy safe ignore
    }
  }

  public playClawGrab() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.07);
      osc.frequency.setValueAtTime(650, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio context policy safe ignore
    }
  }
}

export const sound = new SoundEngine();
