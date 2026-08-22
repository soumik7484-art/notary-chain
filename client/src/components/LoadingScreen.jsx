import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * NotaryChain Institutional-Grade Cinematic Loading Screen
 * 
 * SINGLE CONTINUOUS COIN TOSS (0% -> 100% Synchronized Trajectory):
 * - 0%: Launch from base with a single metallic chime.
 * - 0% -> 50%: Upward flight to apex (-260px) while percentage advances 0% -> 50%.
 * - 50%: Apex hang-time at peak altitude.
 * - 50% -> 100%: Gravitational descent back to base while percentage advances 50% -> 100%.
 * - 100%: Clean landing touchdown on front face with subtle contact click.
 * - Settle & Reveal: Stationary freeze, then seamless dissolution into the landing page.
 */

// ── 1. PROCEDURAL 44.1kHz METALLIC AUDIO SYNTHESIS ──
function buildCoinTossWavUri() {
  const sampleRate = 44100;
  const duration = 0.55;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(numSamples);

  const f1 = 2840; // High resonant mint chime
  const f2 = 4260; // Secondary metallic harmonic
  const f3 = 5680; // High silver overtone

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.002);
    const decay = Math.exp(-t * 11.5);
    const shimmer = Math.sin(2 * Math.PI * 22 * t);

    const s1 = Math.sin(2 * Math.PI * f1 * t) * 0.45;
    const s2 = Math.sin(2 * Math.PI * f2 * t * (1 + 0.002 * shimmer)) * 0.30;
    const s3 = Math.sin(2 * Math.PI * f3 * t) * 0.15;
    const whoosh = (Math.random() * 2 - 1) * Math.exp(-t * 38) * 0.12;

    buffer[i] = attack * decay * (s1 + s2 + s3) + whoosh;
  }
  return encodePcmWav(buffer, sampleRate);
}

function buildCoinCatchWavUri() {
  const sampleRate = 44100;
  const duration = 0.12;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.001);
    const decay = Math.exp(-t * 40);

    const s1 = Math.sin(2 * Math.PI * 1350 * t) * 0.5;
    const s2 = Math.sin(2 * Math.PI * 2400 * t) * 0.3;
    const snap = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.2;

    buffer[i] = attack * decay * (s1 + s2) + snap;
  }
  return encodePcmWav(buffer, sampleRate);
}

function encodePcmWav(samples, sampleRate) {
  const byteRate = sampleRate * 2;
  const blockAlign = 2;
  const dataSize = samples.length * 2;
  const totalSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

// Global Audio Controller
class NotaryAudioController {
  constructor() {
    this.tossWav = null;
    this.catchWav = null;
    this.isUnlocked = false;
  }

  prepare() {
    if (typeof window === 'undefined') return;
    if (!this.tossWav) this.tossWav = buildCoinTossWavUri();
    if (!this.catchWav) this.catchWav = buildCoinCatchWavUri();

    const unlock = () => {
      this.isUnlocked = true;
      ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, unlock);
      });
    };
    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });
  }

  playToss() {
    if (!this.tossWav) this.prepare();
    try {
      const audio = new Audio(this.tossWav);
      audio.volume = 0.45;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    } catch {}
  }

  playCatch() {
    if (!this.catchWav) this.prepare();
    try {
      const audio = new Audio(this.catchWav);
      audio.volume = 0.35;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    } catch {}
  }
}

const audioController = new NotaryAudioController();

// ── 2. EXACT NOTARYCHAIN COIN (FRONT & BACK 3D SURFACES) ──
const CoinFrontFace = () => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="cf_border_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9F0C8" />
        <stop offset="35%" stopColor="#B5883D" />
        <stop offset="70%" stopColor="#E1B84C" />
        <stop offset="100%" stopColor="#7A5218" />
      </linearGradient>
      <linearGradient id="cf_face_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D6A4F" />
        <stop offset="60%" stopColor="#1B4532" />
        <stop offset="100%" stopColor="#143426" />
      </linearGradient>
      <linearGradient id="cf_gold_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDF9" />
        <stop offset="50%" stopColor="#F0D888" />
        <stop offset="100%" stopColor="#B5883D" />
      </linearGradient>
    </defs>
    <circle cx="80" cy="80" r="76" fill="url(#cf_border_s)" />
    <circle cx="80" cy="80" r="71" fill="#1B4532" />
    <circle cx="80" cy="80" r="67" fill="url(#cf_border_s)" />
    <circle cx="80" cy="80" r="63" stroke="url(#cf_border_s)" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="80" cy="80" r="60" fill="url(#cf_face_s)" />
    <path
      d="M80 42 L105 54 V80 C105 97 80 110 80 110 C80 110 55 97 55 80 V54 L80 42 Z"
      fill="none"
      stroke="url(#cf_gold_s)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <text
      x="80"
      y="85"
      fill="url(#cf_gold_s)"
      fontSize="32"
      fontWeight="800"
      fontFamily="Manrope, sans-serif"
      textAnchor="middle"
    >
      N
    </text>
  </svg>
);

const CoinBackFace = () => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="cb_border_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9F0C8" />
        <stop offset="35%" stopColor="#B5883D" />
        <stop offset="70%" stopColor="#E1B84C" />
        <stop offset="100%" stopColor="#7A5218" />
      </linearGradient>
      <linearGradient id="cb_face_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1B4532" />
        <stop offset="60%" stopColor="#143426" />
        <stop offset="100%" stopColor="#0B1E15" />
      </linearGradient>
      <linearGradient id="cb_gold_s" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFDF9" />
        <stop offset="50%" stopColor="#F0D888" />
        <stop offset="100%" stopColor="#B5883D" />
      </linearGradient>
    </defs>
    <circle cx="80" cy="80" r="76" fill="url(#cb_border_s)" />
    <circle cx="80" cy="80" r="71" fill="#143426" />
    <circle cx="80" cy="80" r="67" fill="url(#cb_border_s)" />
    <circle cx="80" cy="80" r="63" stroke="url(#cb_border_s)" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="80" cy="80" r="60" fill="url(#cb_face_s)" />
    <polygon points="80,48 102,62 102,90 80,104 58,90 58,62" fill="none" stroke="url(#cb_gold_s)" strokeWidth="2.5" />
    <circle cx="80" cy="76" r="14" stroke="url(#cb_gold_s)" strokeWidth="2" fill="#2D6A4F" />
    <text
      x="80"
      y="81"
      fill="url(#cb_gold_s)"
      fontSize="13"
      fontWeight="800"
      fontFamily="Manrope, sans-serif"
      textAnchor="middle"
    >
      NC
    </text>
  </svg>
);

// ── 3. SINGLE TOSS FLIGHT DYNAMICS (3.4s SYNCHRONIZED KEYFRAMES) ──
const SINGLE_TOSS_STYLES = `
/* Single Majestic Parabolic Flight synced with 0% -> 100% */
@keyframes singleCoinTossTrajectory {
  0% {
    /* 0% Loading: Rest at launch base */
    transform: translateY(0px) rotateY(0deg) rotateX(8deg) scale(1);
    animation-timing-function: cubic-bezier(0.12, 0.8, 0.32, 1);
  }
  6% {
    /* Fast initial upward velocity */
    transform: translateY(-35px) rotateY(90deg) rotateX(15deg) scale(1.02);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  20% {
    /* 20% Loading: Climbing rapidly through space */
    transform: translateY(-145px) rotateY(270deg) rotateX(18deg) scale(1.06);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  38% {
    /* 38% Loading: Approaching peak altitude */
    transform: translateY(-245px) rotateY(450deg) rotateX(12deg) scale(1.09);
    animation-timing-function: ease-out;
  }
  50% {
    /* 50% Loading: APEX & HANG-TIME at 260px highest altitude */
    transform: translateY(-260px) rotateY(540deg) rotateX(6deg) scale(1.10);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  68% {
    /* 68% Loading: Gravitational acceleration downward */
    transform: translateY(-175px) rotateY(720deg) rotateX(10deg) scale(1.07);
    animation-timing-function: cubic-bezier(0.895, 0.03, 0.685, 0.22);
  }
  86% {
    /* 86% Loading: Descending swiftly back toward base */
    transform: translateY(-50px) rotateY(900deg) rotateX(12deg) scale(1.03);
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  96% {
    /* 96% Loading: Soft touchdown contact */
    transform: translateY(-3px) rotateY(1080deg) rotateX(0deg) scale(1);
    animation-timing-function: ease-out;
  }
  100% {
    /* 100% Loading: Settled stationary on front face */
    transform: translateY(0px) rotateY(1080deg) rotateX(0deg) scale(1);
  }
}

/* Floor Shadow synchronized with Single Flight */
@keyframes singleCoinShadowTrack {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.38;
  }
  6% {
    transform: translateX(-50%) scale(0.85);
    opacity: 0.28;
  }
  50% {
    /* Highly dispersed shadow at apex */
    transform: translateX(-50%) scale(0.35);
    opacity: 0.06;
  }
  96% {
    transform: translateX(-50%) scale(1.05);
    opacity: 0.38;
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.38;
  }
}

@keyframes progressShimmerLine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('tossing'); // 'tossing' | 'landed' | 'fading' | 'done'
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef(null);
  const catchPlayedRef = useRef(false);

  // Total duration of the single toss: exactly 3.4 seconds
  const TOSS_DURATION_MS = 3400;

  // Inject Styles & Prepare Audio
  useEffect(() => {
    const styleId = 'nc-single-toss-styles-v1';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = SINGLE_TOSS_STYLES;
      document.head.appendChild(style);
    }
    audioController.prepare();

    // Play single toss sound right on launch
    const tossSoundTimer = setTimeout(() => {
      audioController.playToss();
    }, 80);

    return () => clearTimeout(tossSoundTimer);
  }, []);

  // Update progress in lockstep with the single toss
  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const ratio = Math.min(elapsed / TOSS_DURATION_MS, 1);

    // Natural progress calculation from 0 to 100
    const pct = Math.min(100, Math.round(ratio * 100));
    setProgress(pct);

    // Play catch sound when reaching landing zone (~96%)
    if (pct >= 96 && !catchPlayedRef.current) {
      catchPlayedRef.current = true;
      audioController.playCatch();
    }

    if (ratio < 1) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      setProgress(100);
      setPhase('landed');
    }
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgress]);

  // Handle phase transitions: landed -> fade overlay -> complete
  useEffect(() => {
    if (phase === 'landed') {
      // Hold stationary for 450ms
      const holdTimer = setTimeout(() => {
        setPhase('fading');
      }, 450);
      return () => clearTimeout(holdTimer);
    }

    if (phase === 'fading') {
      // Fade out over 600ms
      const fadeTimer = setTimeout(() => {
        setPhase('done');
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(fadeTimer);
    }
  }, [phase, onComplete]);

  if (phase === 'done') return null;

  const isLandedOrFading = phase === 'landed' || phase === 'fading';
  const isFading = phase === 'fading';

  return (
    <div
      onClick={() => {
        audioController.prepare();
        audioController.playToss();
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF8F4] select-none transition-opacity duration-600 ease-out"
      style={{
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? 'none' : 'auto',
      }}
    >
      {/* Background Architectural Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(62, 58, 52, 0.08) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(62, 58, 52, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 45%, black 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 45%, black 35%, transparent 85%)',
        }}
      />

      {/* Main Presentation Stage */}
      <div className="relative flex flex-col items-center z-10 w-full max-w-sm px-6">
        
        {/* Single Toss Flight Stage (Height 360px for full 260px vertical travel) */}
        <div className="relative w-52 h-[340px] flex flex-col items-center justify-end">
          
          {/* Base Floor Shadow */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-[#2D6A4F]/25 filter blur-md pointer-events-none"
            style={{
              animation: isLandedOrFading ? 'none' : `singleCoinShadowTrack ${TOSS_DURATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`,
              opacity: isLandedOrFading ? 0.38 : undefined,
            }}
          />

          {/* 3D Flying NotaryChain Coin (Single Continuous Toss) */}
          <div
            className="absolute bottom-6 left-1/2 -ml-[68px] w-[136px] h-[136px]"
            style={{
              perspective: '1400px',
              transformStyle: 'preserve-3d',
              animation: isLandedOrFading ? 'none' : `singleCoinTossTrajectory ${TOSS_DURATION_MS}ms forwards`,
              transform: isLandedOrFading ? 'translateY(0px) rotateY(1080deg) rotateX(0deg) scale(1)' : undefined,
              transition: isLandedOrFading ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            }}
          >
            {/* Ambient Gold Glow Aura */}
            <div
              className="absolute inset-0 rounded-full bg-[#B5883D]/30 filter blur-xl pointer-events-none"
              style={{
                opacity: isLandedOrFading ? 0.25 : 0.45,
              }}
            />
            
            {/* 3D Dual-Sided Coin Element */}
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* FRONT FACE (NotaryChain Shield & "N") */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <CoinFrontFace />
              </div>

              {/* BACK FACE (NotaryChain Polygon Proof & "NC") */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <CoinBackFace />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Progress Section (0% -> 100% in Lockstep) */}
        <div
          className="mt-6 text-center w-full transition-all duration-400 ease-out"
          style={{
            opacity: isLandedOrFading ? 0 : 1,
            transform: isLandedOrFading ? 'translateY(8px)' : 'translateY(0)',
          }}
        >
          {/* Large Percentage Readout */}
          <div className="font-display text-4xl sm:text-5xl font-bold text-[#2D6A4F] tracking-tight tabular-nums">
            {progress}%
          </div>

          {/* Progress Shimmer Bar */}
          <div className="mt-3.5 mx-auto w-48 h-1 rounded-full bg-[#2D6A4F]/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2D6A4F] transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                backgroundImage: 'linear-gradient(90deg, #2D6A4F, #52B788, #2D6A4F)',
                backgroundSize: '200% 100%',
                animation: 'progressShimmerLine 2s linear infinite',
              }}
            />
          </div>

          {/* Institutional Trust Subtitle */}
          <p className="mt-3 font-display text-xs font-bold tracking-widest text-[#7B746E] uppercase">
            Securing Your Documents
          </p>
        </div>
      </div>

      {/* Bottom Brand Mark */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 transition-opacity duration-300"
        style={{ opacity: isLandedOrFading ? 0 : 0.45 }}
      >
        <div className="w-5 h-5 rounded-md bg-[#2D6A4F] flex items-center justify-center text-white font-bold text-[10px] font-display shadow-xs">
          N
        </div>
        <span className="font-display font-bold text-xs text-[#2E2A26] tracking-tight">
          NotaryChain
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
