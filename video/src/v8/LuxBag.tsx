import React from "react";

/** Leather tones: [body top, body bottom, flap top, flap bottom, stitch]. */
const TONES: Record<string, [string, string, string, string, string]> = {
  black: ["#3a3a41", "#0e0e11", "#45454d", "#1a1a1f", "rgba(255,255,255,0.16)"],
  tan: ["#c99363", "#6f4426", "#d6a273", "#8a5a34", "rgba(255,240,220,0.35)"],
  cream: ["#f1e7d6", "#b9a586", "#f7efe2", "#cdbb9c", "rgba(120,90,50,0.35)"],
};

/**
 * A structured top-handle handbag, drawn filled and shaded (leather gradients, gold hardware,
 * stitching, gloss). `glint` 0→1 sweeps a highlight across it. viewBox 240×240; the base of the
 * bag sits at y = 218 (≈ 91% down the box).
 */
export const LuxBag: React.FC<{ id: string; size: number; tone?: keyof typeof TONES; glint?: number }> = ({ id, size, tone = "black", glint = 0 }) => {
  const [b0, b1, f0, f1, st] = TONES[tone];
  const body = "M44 104 Q44 94 54 94 L186 94 Q196 94 196 104 L208 204 Q210 218 196 218 L44 218 Q30 218 32 204 Z";
  const flap = "M46 96 L194 96 Q192 142 120 152 Q48 142 46 96 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b0} />
          <stop offset="1" stopColor={b1} />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f0} />
          <stop offset="1" stopColor={f1} />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.5} />
          <stop offset="0.22" stopColor="#000" stopOpacity={0} />
          <stop offset="0.78" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4cf" />
          <stop offset="0.45" stopColor="#e9bd5c" />
          <stop offset="1" stopColor="#9c6d22" />
        </linearGradient>
        <linearGradient id={`${id}-h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f0} />
          <stop offset="1" stopColor={b1} />
        </linearGradient>
        <radialGradient id={`${id}-gl`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-sw`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.38} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* handle */}
      <path d="M80 98 C80 28 160 28 160 98" fill="none" stroke={`url(#${id}-h)`} strokeWidth={12} strokeLinecap="round" />
      <path d="M84 96 C84 36 156 36 156 96" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={2} strokeLinecap="round" />
      <rect x={73} y={88} width={14} height={16} rx={4} fill={`url(#${id}-g)`} />
      <rect x={153} y={88} width={14} height={16} rx={4} fill={`url(#${id}-g)`} />
      {/* body */}
      <path d={body} fill={`url(#${id}-l)`} />
      <path d={body} fill={`url(#${id}-s)`} />
      <path d="M50 112 L41 202 Q41 210 48 210 L192 210 Q199 210 199 202 L190 112" fill="none" stroke={st} strokeWidth={1.6} strokeDasharray="4 4" />
      <ellipse cx={76} cy={168} rx={20} ry={44} fill={`url(#${id}-gl)`} transform="rotate(-10 76 168)" />
      {/* flap */}
      <path d={flap} fill={`url(#${id}-f)`} stroke="rgba(0,0,0,0.55)" strokeWidth={1.2} />
      <path d="M56 102 Q120 144 184 102" fill="none" stroke={st} strokeWidth={1.6} strokeDasharray="4 4" />
      <path d="M58 98 L182 98" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
      {/* turn-lock */}
      <rect x={103} y={130} width={34} height={25} rx={6} fill={`url(#${id}-g)`} />
      <rect x={111} y={136} width={18} height={13} rx={3} fill="none" stroke="rgba(90,60,10,0.55)" strokeWidth={1.4} />
      <circle cx={120} cy={142.5} r={2.4} fill="rgba(90,60,10,0.6)" />
      {/* feet */}
      <ellipse cx={62} cy={220} rx={6} ry={3} fill={`url(#${id}-g)`} />
      <ellipse cx={178} cy={220} rx={6} ry={3} fill={`url(#${id}-g)`} />
      {/* glint */}
      {glint > 0 && glint < 1 && (
        <g clipPath={`url(#${id}-c)`}>
          <rect x={-60 + glint * 340} y={60} width={46} height={200} fill={`url(#${id}-sw)`} transform={`rotate(18 ${-37 + glint * 340} 160)`} />
        </g>
      )}
    </svg>
  );
};
