import React from "react";

/** Abstract shopper silhouette with rim light. `look` -1..1 turns the head. */
export const Shopper: React.FC<{ height?: number; look?: number; rim?: string }> = ({
  height = 420,
  look = 0,
  rim = "rgba(255,255,255,0.38)",
}) => {
  const w = (height * 200) / 420;
  return (
    <svg width={w} height={height} viewBox="0 0 200 420" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="shopperBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#454953" />
          <stop offset="0.6" stopColor="#1b1d23" />
          <stop offset="1" stopColor="#0b0c0f" />
        </linearGradient>
        <linearGradient id="shopperLimb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2c33" />
          <stop offset="1" stopColor="#14151a" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="412" rx="64" ry="8" fill="#000" opacity="0.6" />
      {/* legs */}
      <path d="M64 256 L98 256 L94 406 Q80 410 66 406 Z" fill="url(#shopperLimb)" />
      <path d="M102 256 L136 256 L134 406 Q120 410 106 406 Z" fill="url(#shopperLimb)" />
      {/* arms */}
      <path d="M54 130 Q30 190 40 258" fill="none" stroke="url(#shopperLimb)" strokeWidth="19" strokeLinecap="round" />
      <path d="M146 130 Q170 190 160 258" fill="none" stroke="url(#shopperLimb)" strokeWidth="19" strokeLinecap="round" />
      {/* torso */}
      <path
        d="M54 126 Q100 106 146 126 Q158 150 152 218 L148 266 Q100 276 52 266 L48 218 Q42 150 54 126 Z"
        fill="url(#shopperBody)"
        stroke={rim}
        strokeWidth="1.4"
      />
      {/* neck + head */}
      <rect x="90" y="86" width="20" height="30" rx="9" fill="#2a2c33" />
      <ellipse cx={100 + look * 6} cy="60" rx="30" ry="34" fill="url(#shopperBody)" stroke={rim} strokeWidth="1.4" />
    </svg>
  );
};
