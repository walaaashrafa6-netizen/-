import React from 'react';

interface AstraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

/**
 * Recreating the exact ASTRA geometric 'A' with the orbital ring passing through it
 * as shown in the reference image.
 */
export const AstraLogo: React.FC<AstraLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  subtitle = 'Astronaut Health Companion',
}) => {
  const sizeMap = {
    sm: { w: 28, h: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { w: 38, h: 38, text: 'text-lg', sub: 'text-[10px]' },
    lg: { w: 54, h: 54, text: 'text-2xl', sub: 'text-xs' },
    xl: { w: 84, h: 84, text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric 'A' with 3D Orbital Ring */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: dim.w, height: dim.h }}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(66,200,245,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear gradient for the A symbol */}
            <linearGradient id="astraGrad" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#42C8F5" />
              <stop offset="45%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#42C8F5" />
            </linearGradient>

            {/* Orbit ring gradient */}
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#42C8F5" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#36D9FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B7CFF" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Back half of the orbital ring (behind the A) */}
          <ellipse
            cx="50"
            cy="46"
            rx="46"
            ry="20"
            transform="rotate(-26 50 46)"
            stroke="url(#orbitGrad)"
            strokeWidth="3.5"
            strokeDasharray="90 140"
            strokeDashoffset="70"
            opacity="0.85"
          />

          {/* Stylized Sharp Geometric 'A' */}
          {/* Left leg */}
          <path
            d="M50 12 L22 84 L33 84 L50 38 L67 84 L78 84 Z"
            fill="url(#astraGrad)"
            filter="url(#glow)"
          />

          {/* Horizontal crossbar with subtle aerospace slant */}
          <path
            d="M32 60 L68 60 L65 54 L35 54 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Front half of the orbital ring (passes cleanly in front of the A) */}
          <ellipse
            cx="50"
            cy="46"
            rx="46"
            ry="20"
            transform="rotate(-26 50 46)"
            stroke="#42C8F5"
            strokeWidth="4"
            strokeDasharray="115 140"
            strokeDashoffset="195"
            strokeLinecap="round"
          />

          {/* Bright orbital beacon starlet on the ring */}
          <circle cx="82" cy="28" r="2.8" fill="#FFFFFF" />
          <circle cx="82" cy="28" r="5" stroke="#42C8F5" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-extrabold tracking-[0.2em] text-[#F2F6FA] uppercase leading-none ${dim.text}`}>
            ASTRA
          </span>
          {subtitle && (
            <span className={`font-sans tracking-wider text-[#A9B8C8] mt-1 font-medium ${dim.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
