import React, { useState, useEffect } from 'react';

interface MoonPhaseProps {
  size?: number;
  speed?: number; // duration of a full cycle in seconds
  interactive?: boolean;
  isPaused?: boolean;
}

export const MoonPhase: React.FC<MoonPhaseProps> = ({
  size = 120,
  speed = 15,
  interactive = true,
  isPaused = false
}) => {
  const [percent, setPercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const shouldPause = isPaused || isHovered;

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (!shouldPause) {
        // Increment percentage smoothly based on time delta
        const increment = (deltaTime / (speed * 1000)) * 100;
        setPercent((prev) => (prev + increment) % 100);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, shouldPause]);

  // Compute SVG path for the shadowed portion of the moon
  const getShadowPath = (pct: number): string => {
    const r = 48;
    const cx = 50;
    const cy = 50;

    if (pct <= 0.5 || pct >= 99.5) {
      // New Moon: shadow covers the whole moon
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    }
    if (Math.abs(pct - 50) < 0.5) {
      // Full Moon: no shadow
      return "";
    }

    const isWaxing = pct < 50;
    const phaseRatio = isWaxing ? (pct / 50) : ((100 - pct) / 50);
    const rx = Math.abs(r * (1 - 2 * phaseRatio));

    // The shadow is on the opposite side of the lit portion
    const sweepOuter = isWaxing ? 0 : 1;
    const sweepInner = (pct < 25 || (pct > 50 && pct < 75)) ? 0 : 1;

    const startX = cx;
    const startY = cy - r;
    const endX = cx;
    const endY = cy + r;

    return `M ${startX} ${startY} 
            A ${r} ${r} 0 0 ${sweepOuter} ${endX} ${endY} 
            A ${rx} ${r} 0 0 ${sweepInner} ${startX} ${startY} Z`;
  };

  const shadowPath = getShadowPath(percent);

  // Calculate outer glow opacity (brightest at full moon)
  const glowOpacity = Math.max(0.15, Math.sin((percent / 100) * Math.PI) * 0.7);

  return (
    <div 
      className="flex flex-col items-center justify-center relative select-none"
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Dynamic Lunar Aura Glow */}
      <div 
        className="absolute rounded-full transition-all duration-700 blur-2xl pointer-events-none"
        style={{
          width: `${size * 0.9}px`,
          height: `${size * 0.9}px`,
          boxShadow: `0 0 ${25 + glowOpacity * 35}px rgba(255, 253, 245, ${glowOpacity * 0.45})`,
          opacity: glowOpacity
        }}
      />

      {/* SVG Canvas for Moon Rendering */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="relative z-10 overflow-visible drop-shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-105"
      >
        <defs>
          {/* Soft blur for the shadow edge (terminator) to make it look realistic */}
          <filter id="terminator-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>

          {/* Warm cream/silver 3D lunar surface texture */}
          <radialGradient id="moon-surface" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#fdfaf2" />
            <stop offset="80%" stopColor="#f3ebd9" />
            <stop offset="95%" stopColor="#e5dbbe" />
            <stop offset="100%" stopColor="#cfc3a1" />
          </radialGradient>

          {/* Deep celestial shadow gradient */}
          <linearGradient id="moon-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#090a0d" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#121419" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Base Layer: Fully lit moon sphere */}
        <circle cx="50" cy="50" r="48" fill="url(#moon-surface)" />

        {/* Maria: Soft organic lunar plains */}
        <g opacity="0.12" fill="#cca783">
          <path d="M 32 28 A 12 10 0 1 0 44 40 A 10 12 0 1 0 32 28 Z" />
          <path d="M 58 35 A 16 12 0 1 0 74 51 A 12 16 0 1 0 58 35 Z" />
          <path d="M 33 60 A 9 9 0 1 0 42 69 A 9 9 0 1 0 33 60 Z" />
          <path d="M 64 64 A 8 7 0 1 0 72 72 A 7 8 0 1 0 64 64 Z" />
          <path d="M 46 22 A 6 5 0 1 0 52 27 A 5 6 0 1 0 46 22 Z" />
        </g>

        {/* 3D Craters with light and shadow offsets */}
        <g opacity="0.18">
          {/* Crater 1 */}
          <circle cx="35" cy="32" r="4.5" fill="#a89975" />
          <circle cx="34.2" cy="31.2" r="4.5" fill="#4d4432" opacity="0.4" />
          <circle cx="35.8" cy="32.8" r="4.5" fill="#ffffff" opacity="0.6" />
          
          {/* Crater 2 */}
          <circle cx="66" cy="42" r="6" fill="#a89975" />
          <circle cx="65.2" cy="41.2" r="6" fill="#4d4432" opacity="0.4" />
          <circle cx="66.8" cy="42.8" r="6" fill="#ffffff" opacity="0.6" />
          
          {/* Crater 3 */}
          <circle cx="46" cy="67" r="5" fill="#a89975" />
          <circle cx="45.2" cy="66.2" r="5" fill="#4d4432" opacity="0.4" />
          <circle cx="46.8" cy="67.8" r="5" fill="#ffffff" opacity="0.6" />

          {/* Crater 4 */}
          <circle cx="54" cy="23" r="3.5" fill="#a89975" />
          <circle cx="53.4" cy="22.4" r="3.5" fill="#4d4432" opacity="0.4" />
          <circle cx="54.6" cy="23.6" r="3.5" fill="#ffffff" opacity="0.6" />

          {/* Crater 5 */}
          <circle cx="26" cy="50" r="3" fill="#a89975" />
          <circle cx="25.5" cy="49.5" r="3" fill="#4d4432" opacity="0.4" />
          <circle cx="26.5" cy="50.5" r="3" fill="#ffffff" opacity="0.6" />

          {/* Crater 6 */}
          <circle cx="72" cy="66" r="4" fill="#a89975" />
          <circle cx="71.3" cy="65.3" r="4" fill="#4d4432" opacity="0.4" />
          <circle cx="72.7" cy="66.7" r="4" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Overlay Shadow Layer with feathered edge (creates terminator blur) */}
        {shadowPath && (
          <path 
            d={shadowPath} 
            fill="url(#moon-shadow)" 
            filter="url(#terminator-blur)"
          />
        )}

        {/* Fine Moon Rim highlight ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.2)" 
          strokeWidth="0.5" 
        />
      </svg>
    </div>
  );
};
