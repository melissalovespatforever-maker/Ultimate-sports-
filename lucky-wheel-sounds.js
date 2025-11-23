/**
 * Lucky Wheel Sound Effects
 * Uses Web Audio API to generate sounds
 */

class LuckyWheelSounds {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
        this.init();
    }

    init() {
        // Create audio context (lazy initialization to avoid autoplay restrictions)
        if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Resume audio context (needed for user interaction requirement)
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Set volume (0 to 1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Enable/disable sounds
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // ============================
    // SOUND GENERATORS
    // ============================

    // Wheel spin start sound (whoosh)
    async playSpinStart() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        
        // Create noise buffer for whoosh effect
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(this.volume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.5);
    }

    // Wheel tick sound (as it spins past segments)
    async playTick(intensity = 1) {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800 * intensity, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gainNode.gain.setValueAtTime(this.volume * 0.15 * intensity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    // Wheel slowing down sound
    async playSlowDown() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.8);

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.8);
    }

    // Common prize win (coins)
    async playCommonWin() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        
        // Three-note ascending arpeggio
        const notes = [261.63, 329.63, 392.00]; // C, E, G
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);

            const startTime = now + (i * 0.08);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Uncommon prize win
    async playUncommonWin() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        const notes = [329.63, 392.00, 523.25, 659.25]; // E, G, C, E
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, now);

            const startTime = now + (i * 0.07);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.35);
        });
    }

    // Rare prize win
    async playRareWin() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        
        // Major chord with shimmer
        const notes = [523.25, 659.25, 783.99]; // C, E, G (higher octave)
        
        // Play chord
        notes.forEach((freq) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(now);
            oscillator.stop(now + 0.8);
        });

        // Add shimmer effect
        for (let i = 0; i < 8; i++) {
            const shimmer = this.audioContext.createOscillator();
            const shimmerGain = this.audioContext.createGain();

            shimmer.type = 'sine';
            shimmer.frequency.setValueAtTime(1046.50 + (i * 100), now);

            const startTime = now + (i * 0.05);
            shimmerGain.gain.setValueAtTime(0, startTime);
            shimmerGain.gain.linearRampToValueAtTime(this.volume * 0.1, startTime + 0.01);
            shimmerGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            shimmer.connect(shimmerGain);
            shimmerGain.connect(this.audioContext.destination);

            shimmer.start(startTime);
            shimmer.stop(startTime + 0.2);
        }
    }

    // Epic prize win
    async playEpicWin() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        
        // Dramatic ascending scale with harmonics
        const notes = [392.00, 493.88, 587.33, 783.99, 987.77]; // G, B, D, G, B
        
        notes.forEach((freq, i) => {
            // Main note
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, now);

            const startTime = now + (i * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);

            // Harmonic
            const harmonic = this.audioContext.createOscillator();
            const harmonicGain = this.audioContext.createGain();

            harmonic.type = 'sine';
            harmonic.frequency.setValueAtTime(freq * 2, now);

            harmonicGain.gain.setValueAtTime(0, startTime);
            harmonicGain.gain.linearRampToValueAtTime(this.volume * 0.15, startTime + 0.02);
            harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            harmonic.connect(harmonicGain);
            harmonicGain.connect(this.audioContext.destination);

            harmonic.start(startTime);
            harmonic.stop(startTime + 0.5);
        });
    }

    // Legendary prize win (JACKPOT!)
    async playLegendaryWin() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        
        // Epic fanfare with multiple layers
        const fanfareNotes = [
            [523.25, 659.25, 783.99], // C major chord
            [587.33, 739.99, 880.00], // D major chord
            [659.25, 830.61, 987.77], // E major chord
            [783.99, 987.77, 1174.66] // G major chord
        ];

        fanfareNotes.forEach((chord, chordIndex) => {
            chord.forEach((freq) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(freq, now);

                const startTime = now + (chordIndex * 0.15);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.03);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.6);
            });
        });

        // Add sparkle effects
        for (let i = 0; i < 20; i++) {
            const sparkle = this.audioContext.createOscillator();
            const sparkleGain = this.audioContext.createGain();

            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(1500 + Math.random() * 1000, now);

            const startTime = now + (i * 0.05);
            sparkleGain.gain.setValueAtTime(0, startTime);
            sparkleGain.gain.linearRampToValueAtTime(this.volume * 0.08, startTime + 0.01);
            sparkleGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            sparkle.connect(sparkleGain);
            sparkleGain.connect(this.audioContext.destination);

            sparkle.start(startTime);
            sparkle.stop(startTime + 0.15);
        }

        // Bass boom
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();

        bass.type = 'sine';
        bass.frequency.setValueAtTime(65.41, now); // C2

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        bass.connect(bassGain);
        bassGain.connect(this.audioContext.destination);

        bass.start(now);
        bass.stop(now + 1.0);
    }

    // Play appropriate win sound based on rarity
    async playWinSound(rarity) {
        switch (rarity) {
            case 'common':
                await this.playCommonWin();
                break;
            case 'uncommon':
                await this.playUncommonWin();
                break;
            case 'rare':
                await this.playRareWin();
                break;
            case 'epic':
                await this.playEpicWin();
                break;
            case 'legendary':
                await this.playLegendaryWin();
                break;
            default:
                await this.playCommonWin();
        }
    }

    // Button click sound
    async playClick() {
        if (!this.enabled || !this.audioContext) return;
        await this.resumeContext();

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        gainNode.gain.setValueAtTime(this.volume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    // Cleanup
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Create global instance
const luckyWheelSounds = new LuckyWheelSounds();

// Export
export default luckyWheelSounds;
export { luckyWheelSounds };
