import React from 'react';

interface RudaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RudaLogo: React.FC<RudaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, font: 'text-sm', sub: 'text-[8px]', badge: 'hidden' },
    md: { icon: 38, font: 'text-base', sub: 'text-[9px]', badge: 'block' },
    lg: { icon: 48, font: 'text-lg', sub: 'text-[11px]', badge: 'block' },
    xl: { icon: 64, font: 'text-2xl', sub: 'text-xs', badge: 'block' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* High-Tech Futuristic Cyber-Quantum Core */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: dim.icon, height: dim.icon }}
      >
        {/* Holographic Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-violet-600 opacity-60 blur-md group-hover:opacity-90 group-hover:blur-lg transition-all duration-300" />

        {/* High-Tech Outer Geometric Shield */}
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-slate-950 border border-emerald-400/40 p-1 flex items-center justify-center shadow-xl shadow-emerald-950/50 overflow-hidden">
          {/* Subtle Circuit Matrix Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:6px_6px] opacity-25" />

          {/* Precision Laser SVG Monogram */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10"
          >
            <defs>
              <linearGradient id="cyberEmeraldGrad" x1="2" y1="4" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="0.5" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="coreBeam" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#6EE7B7" />
              </linearGradient>
              <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Orbiting Quantum Data Ring */}
            <circle
              cx="20"
              cy="20"
              r="17"
              stroke="url(#cyberEmeraldGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 2 1 2"
              className="opacity-70 animate-spin-slow origin-center"
            />

            {/* Cyber Hex Nodes */}
            <circle cx="20" cy="3" r="1.5" fill="#34D399" />
            <circle cx="34.7" cy="11.5" r="1.5" fill="#06B6D4" />
            <circle cx="34.7" cy="28.5" r="1.5" fill="#8B5CF6" />
            <circle cx="5.3" cy="28.5" r="1.5" fill="#10B981" />

            {/* Futuristic 'R' Laser Circuit Path */}
            <path
              d="M11 9C11 7.89543 11.8954 7 13 7H22C26.9706 7 31 11.0294 31 16C31 19.8242 28.6186 23.0931 25.2 24.368L29.6 31.4C30.2 32.36 29.5 33.6 28.3 33.6H23.5C22.6 33.6 21.8 33.1 21.3 32.3L17.5 25.5H15.5V32.5C15.5 33.1075 15.0075 33.6 14.4 33.6H12.1C11.4925 33.6 11 33.1075 11 32.5V9Z"
              fill="url(#cyberEmeraldGrad)"
              filter="url(#laserGlow)"
            />

            {/* Inner Quantum Core Portal */}
            <path
              d="M15.5 12H21.5C23.7091 12 25.5 13.7909 25.5 16C25.5 18.2091 23.7091 20 21.5 20H15.5V12Z"
              fill="#090D14"
            />
            <path
              d="M16.5 13H21.5C23.1569 13 24.5 14.3431 24.5 16C24.5 17.6569 23.1569 19 21.5 19H16.5V13Z"
              fill="url(#coreBeam)"
            />

            {/* Central Pulse Singularity Dot */}
            <circle cx="20.5" cy="16" r="1.8" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white leading-none ${dim.font}`}>
              RUDA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase leading-none ${dim.sub}`}>
              MESSENGER
            </span>
            <span className={`px-1 py-0.2 rounded text-[7px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 uppercase tracking-tighter ${dim.badge}`}>
              QUANTUM
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
