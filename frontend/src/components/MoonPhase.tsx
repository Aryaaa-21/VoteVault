import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoonPhaseProps {
  size?: number;
  speed?: number; // duration of a full cycle in seconds
  interactive?: boolean;
}

export const MoonPhase: React.FC<MoonPhaseProps> = ({
  size = 112, // w-28 h-28 equivalent
  speed = 15, // 15 seconds per cycle
  interactive = true
}) => {
  const [percent, setPercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();
    const cycleDuration = speed * 1000; // ms

    const animate = (time: number) => {
      const elapsed = time - startTime;
      // If hovered, speed up the transition for playful interactivity
      const currentSpeedFactor = isHovered ? 2.5 : 1;
      const progress = (elapsed * currentSpeedFactor) % cycleDuration;
      const currentPercent = (progress / cycleDuration) * 100;
      setPercent(currentPercent);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, isHovered]);

  // Compute SVG path for the lit portion
  const getMoonPath = (pct: number): string => {
    const r = 48;
    const cx = 50;
    const cy = 50;

    if (pct <= 0.5 || pct >= 99.5) return "";
    if (Math.abs(pct - 50) < 0.5) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    }

    const isWaxing = pct < 50;
    const phaseRatio = isWaxing ? (pct / 50) : ((100 - pct) / 50);
    const rx = Math.abs(r * (1 - 2 * phaseRatio));

    const sweepOuter = isWaxing ? 1 : 0;
    const sweepInner = (pct < 25 || (pct > 50 && pct < 75)) ? 0 : 1;

    const startX = cx;
    const startY = cy - r;
    const endX = cx;
    const endY = cy + r;

    return `M ${startX} ${startY} 
            A ${r} ${r} 0 0 ${sweepOuter} ${endX} ${endY} 
            A ${rx} ${r} 0 0 ${sweepInner} ${startX} ${startY} Z`;
  };

  const getPhaseName = (pct: number): string => {
    if (pct < 3 || pct >= 97) return "NEW MOON";
    if (pct >= 3 && pct < 22) return "WAXING CRESCENT";
    if (pct >= 22 && pct < 28) return "FIRST QUARTER";
    if (pct >= 28 && pct < 47) return "WAXING GIBBOUS";
    if (pct >= 47 && pct < 53) return "FULL MOON";
    if (pct >= 53 && pct < 72) return "WANING GIBBOUS";
    if (pct >= 72 && pct < 78) return "THIRD QUARTER";
    return "WANING CRESCENT";
  };

  const phaseName = getPhaseName(percent);
  const litPath = getMoonPath(percent);

  // Calculate glow opacity based on the moon phase (brightest at full moon)
  const glowOpacity = Math.max(0.1, Math.sin((percent / 100) * Math.PI) * 0.6);

  return (
    <div 
      className="flex flex-col items-center justify-center relative cursor-pointer"
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Outer Glow container */}
      <div 
        className="absolute rounded-full transition-shadow duration-500 blur-xl pointer-events-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: `0 0 ${30 + glowOpacity * 30}px rgba(254, 254, 250, ${glowOpacity * 0.4})`,
          opacity: glowOpacity
        }}
      />

      {/* SVG Canvas for Moon Rendering */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="relative z-10 select-none overflow-visible drop-shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      >
        <defs>
          {/* Subtle glow filter */}
          <filter id="moon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Lit Moon Texture/Gradient */}
          <radialGradient id="lit-moon" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fbf9f3" />
            <stop offset="90%" stopColor="#efebe0" />
            <stop offset="100%" stopColor="#dcd5c1" />
          </radialGradient>

          {/* Dark Shadow Texture/Gradient */}
          <radialGradient id="shadow-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e2025" />
            <stop offset="85%" stopColor="#121316" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
        </defs>

        {/* Base Layer: Dark side of the moon */}
        <circle cx="50" cy="50" r="48" fill="url(#shadow-moon)" />

        {/* Shadow Craters (always visible on the dark side, very subtle) */}
        <g opacity="0.12" fill="#000000">
          <circle cx="35" cy="30" r="4" />
          <circle cx="65" cy="40" r="6" />
          <circle cx="45" cy="65" r="5" />
          <circle cx="55" cy="25" r="3" />
          <circle cx="28" cy="52" r="3.5" />
          <circle cx="70" cy="68" r="4" />
        </g>

        {/* Lit Layer: Visible portion of the moon */}
        {litPath && (
          <path 
            d={litPath} 
            fill="url(#lit-moon)" 
            filter="url(#moon-glow)"
          />
        )}

        {/* Lit Craters (only visible on the lit side by using a clipPath) */}
        {litPath && (
          <g>
            <clipPath id="lit-clip">
              <path d={litPath} />
            </clipPath>
            <g clipPath="url(#lit-clip)" opacity="0.08" fill="#5c543f">
              <circle cx="35" cy="30" r="4" />
              <circle cx="65" cy="40" r="6" />
              <circle cx="45" cy="65" r="5" />
              <circle cx="55" cy="25" r="3" />
              <circle cx="28" cy="52" r="3.5" />
              <circle cx="70" cy="68" r="4" />
              {/* Extra micro-craters */}
              <circle cx="40" cy="48" r="1.5" />
              <circle cx="60" cy="58" r="2.5" />
              <circle cx="50" cy="38" r="2" />
            </g>
          </g>
        )}

        {/* Moon Rim Glow Ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.15)" 
          strokeWidth="0.5" 
        />
      </svg>

      {/* Phase Label Display */}
      <div className="mt-md h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span 
            key={phaseName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="font-mono-technical text-[9px] uppercase tracking-[0.2em] text-on-surface-variant text-center"
          >
            {phaseName}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
