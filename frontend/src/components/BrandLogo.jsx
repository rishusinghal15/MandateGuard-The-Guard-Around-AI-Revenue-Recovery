import React from 'react';

export function BrandLogo({ size = 'default', showSubtitle = true, collapsed = false }) {
  const isSmall = size === 'sm';

  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Original SVG Geometric Shield Mark */}
      <div className={`relative flex-shrink-0 flex items-center justify-center ${
        isSmall ? 'w-8 h-8' : 'w-9 h-9'
      } rounded-xl bg-indigo-950/60 border border-indigo-500/30 shadow-sm shadow-indigo-950/50`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isSmall ? 'w-5 h-5' : 'w-5.5 h-5.5'}
        >
          {/* Outer Shield Boundary */}
          <path
            d="M16 3L6 7.5V14.5C6 21 10.5 26.8 16 29C21.5 26.8 26 21 26 14.5V7.5L16 3Z"
            stroke="#7C73FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Deterministic Gate & Neural Node */}
          <path
            d="M16 9V16M16 16L21 19M16 16L11 19"
            stroke="#635BFF"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Authorization Node */}
          <circle cx="16" cy="16" r="2.25" fill="#38BDF8" />
          {/* Lower Integrity Accent */}
          <path
            d="M12 23.5C13.2 24.5 14.5 25.2 16 25.6C17.5 25.2 18.8 24.5 20 23.5"
            stroke="#10B981"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white font-sans">
              MANDATE<span className="text-[#7C73FF]">GUARD</span>
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-[#A7AFBF] font-medium tracking-tight truncate">
              AI Revenue Recovery &bull; Policy Authorization
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
