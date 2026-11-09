import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../lib/theme";

export type Tier = "premium" | "generic";
export type Kind = "headphones" | "watch" | "tee" | "sunglasses" | "earbuds" | "backpack";

type PProps = { tier: Tier; light?: number; size?: number };

const ACCENT: Record<Tier, string> = { premium: C.gold, generic: C.teal };

const BODY: Record<Tier, [string, string, string]> = {
  premium: ["#565b66", "#23262d", "#0c0d10"],
  generic: ["#4d535c", "#252830", "#0e0f12"],
};

const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

/** Base + moving-specular gradients. `light` 0..1 sweeps a highlight across the product. */
const Defs: React.FC<{
  id: string;
  base: [string, string, string];
  light: number;
  hi?: number;
}> = ({ id, base, light, hi = 0.8 }) => {
  const c = -0.3 + light * 1.6;
  return (
    <defs>
      <linearGradient id={`${id}b`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor={base[0]} />
        <stop offset="0.5" stopColor={base[1]} />
        <stop offset="1" stopColor={base[2]} />
      </linearGradient>
      <linearGradient id={`${id}s`} x1={c - 0.32} y1="0" x2={c + 0.32} y2="0.28">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fff" stopOpacity={hi} />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}sh`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000" floodOpacity="0.55" />
      </filter>
    </defs>
  );
};

const Shiny: React.FC<{ id: string; children: (paint: string) => React.ReactNode }> = ({
  id,
  children,
}) => (
  <>
    {children(`url(#${id}b)`)}
    {children(`url(#${id}s)`)}
  </>
);

const Svg: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
    {children}
  </svg>
);

const Mark: React.FC<{ x: number; y: number; s?: number; tier: Tier }> = ({ x, y, s = 1, tier }) => {
  const a = ACCENT[tier];
  if (tier === "premium") {
    // fictional "A" crest — deliberately not any real brand
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} stroke={a} strokeWidth="3" fill="none" strokeLinejoin="round">
        <circle r="17" opacity="0.9" />
        <path d="M-8 9 L0 -9 L8 9 M-4 3 H4" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={a} opacity="0.9">
      <circle r="4.5" />
    </g>
  );
};

/* ---------------------------------------------------------------- headphones */
const Headphones: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const a = ACCENT[tier];
  const cup = (x: number) => (
    <g>
      <Shiny id={id}>{(p) => <rect x={x} y={205} width={92} height={152} rx={44} fill={p} />}</Shiny>
      <rect x={x + 12} y={222} width={68} height={118} rx={32} fill="none" stroke={a} strokeWidth="2.5" opacity="0.55" />
      <ellipse cx={x + 22} cy={262} rx={7} ry={38} fill="#fff" opacity="0.14" />
      <Mark x={x + 46} y={282} tier={tier} s={0.9} />
    </g>
  );
  return (
    <Svg size={size}>
      <Defs id={id} base={BODY[tier]} light={light} />
      <g filter={`url(#${id}sh)`}>
        {/* headband */}
        <Shiny id={id}>
          {(p) => (
            <path d="M 94 240 C 94 40, 306 40, 306 240" fill="none" stroke={p} strokeWidth="28" strokeLinecap="round" />
          )}
        </Shiny>
        <path d="M 116 236 C 116 84, 284 84, 284 236" fill="none" stroke="#08080a" strokeWidth="11" opacity="0.7" strokeLinecap="round" />
        <path d="M 96 200 C 100 90, 150 64, 200 60" fill="none" stroke="#fff" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
        {/* sliders */}
        <rect x={82} y={218} width={24} height={30} rx={8} fill={a} opacity="0.9" />
        <rect x={294} y={218} width={24} height={30} rx={8} fill={a} opacity="0.9" />
        {/* cushions (inner side) */}
        <rect x={130} y={222} width={26} height={118} rx={13} fill="#07070a" />
        <rect x={244} y={222} width={26} height={118} rx={13} fill="#07070a" />
        {cup(46)}
        {cup(262)}
      </g>
    </Svg>
  );
};

/* ---------------------------------------------------------------------- watch */
const Watch: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const frame = useCurrentFrame();
  const a = ACCENT[tier];
  const secs = frame / 30;
  const sec = secs * 6;
  const min = secs * 0.1 + 150;
  const hr = secs / 120 * 30 + 300;
  const ticks = new Array(60).fill(0).map((_, i) => i);
  return (
    <Svg size={size}>
      <Defs id={id} base={BODY[tier]} light={light} />
      <g filter={`url(#${id}sh)`}>
        <Shiny id={id}>{(p) => <rect x={160} y={6} width={80} height={130} rx={22} fill={p} />}</Shiny>
        <Shiny id={id}>{(p) => <rect x={160} y={264} width={80} height={130} rx={22} fill={p} />}</Shiny>
        {[30, 52, 74, 96, 118].map((y) => (
          <circle key={y} cx={200} cy={y} r={2.6} fill="#000" opacity="0.5" />
        ))}
        <rect x={284} y={184} width={16} height={34} rx={6} fill={a} opacity="0.85" />
        <Shiny id={id}>{(p) => <circle cx={200} cy={200} r={96} fill={p} />}</Shiny>
        <circle cx={200} cy={200} r={86} fill="none" stroke={a} strokeWidth="3" opacity="0.8" />
        <circle cx={200} cy={200} r={78} fill="#07080b" />
        {ticks.map((i) => {
          const ang = (i * 6 * Math.PI) / 180;
          const long = i % 5 === 0;
          const r1 = long ? 60 : 68;
          return (
            <line
              key={i}
              x1={200 + Math.sin(ang) * r1}
              y1={200 - Math.cos(ang) * r1}
              x2={200 + Math.sin(ang) * 74}
              y2={200 - Math.cos(ang) * 74}
              stroke={long ? "#f2f2f5" : "#6c6e78"}
              strokeWidth={long ? 3 : 1.2}
            />
          );
        })}
        {tier === "premium" ? (
          <text x={200} y={162} textAnchor="middle" fontSize="11" letterSpacing="4" fill={a} fontFamily="Inter, sans-serif" fontWeight="600">
            AURELIA
          </text>
        ) : (
          <circle cx={200} cy={160} r={3} fill={a} />
        )}
        {/* hands */}
        <g transform={`rotate(${hr} 200 200)`}>
          <rect x={196.5} y={140} width={7} height={64} rx={3.5} fill="#f2f2f5" />
        </g>
        <g transform={`rotate(${min} 200 200)`}>
          <rect x={197.5} y={122} width={5} height={82} rx={2.5} fill="#f2f2f5" />
        </g>
        <g transform={`rotate(${sec} 200 200)`}>
          <rect x={199} y={118} width={2} height={96} fill={a} />
          <circle cx={200} cy={200} r={5} fill={a} />
        </g>
        {/* glass glare */}
        <path d="M 130 150 A 78 78 0 0 1 250 128 L 232 168 Z" fill="#fff" opacity="0.07" />
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------------ tee */
const Tee: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const base: [string, string, string] =
    tier === "premium" ? ["#f0ebe1", "#cfc8ba", "#8f897c"] : ["#e4e2dd", "#c3c1ba", "#8a8880"];
  const d =
    "M140 52 L88 74 L26 138 L70 184 L112 156 L112 352 L288 352 L288 156 L330 184 L374 138 L312 74 L260 52 Q200 96 140 52 Z";
  return (
    <Svg size={size}>
      <Defs id={id} base={base} light={light} hi={0.4} />
      <g filter={`url(#${id}sh)`}>
        <Shiny id={id}>{(p) => <path d={d} fill={p} />}</Shiny>
        <path d="M140 52 Q200 112 260 52 Q200 96 140 52 Z" fill="#000" opacity="0.28" />
        <path d="M140 52 Q200 112 260 52" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="9" strokeLinecap="round" />
        {/* soft folds */}
        <path d="M150 200 Q170 260 150 340" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="10" strokeLinecap="round" />
        <path d="M250 190 Q232 260 252 346" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="10" strokeLinecap="round" />
        <path d="M112 156 L112 352" stroke="#000" strokeOpacity="0.12" strokeWidth="3" />
        <path d="M288 156 L288 352" stroke="#000" strokeOpacity="0.12" strokeWidth="3" />
        {tier === "premium" ? (
          <g transform="translate(232 150)" stroke={C.goldDeep} strokeWidth="3" fill="none" strokeLinejoin="round">
            <circle r="15" />
            <path d="M-7 8 L0 -8 L7 8 M-3.5 3 H3.5" />
          </g>
        ) : null}
      </g>
    </Svg>
  );
};

/* ----------------------------------------------------------------- sunglasses */
const Sunglasses: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const a = ACCENT[tier];
  const streak = -60 + light * 260;
  const lens = (x: number) => (
    <g>
      <rect x={x} y={150} width={140} height={100} rx={44} fill={`url(#${id}l)`} />
      <g clipPath={`url(#${id}c${x})`}>
        <rect x={x + streak} y={120} width={26} height={170} fill="#fff" opacity="0.22" transform={`skewX(-18)`} />
      </g>
      <Shiny id={id}>
        {(p) => <rect x={x} y={150} width={140} height={100} rx={44} fill="none" stroke={p} strokeWidth="11" />}
      </Shiny>
    </g>
  );
  return (
    <Svg size={size}>
      <Defs id={id} base={BODY[tier]} light={light} />
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tier === "premium" ? "#8a6428" : "#2a7d92"} />
          <stop offset="1" stopColor="#050507" />
        </linearGradient>
        <clipPath id={`${id}c36`}>
          <rect x={36} y={150} width={140} height={100} rx={44} />
        </clipPath>
        <clipPath id={`${id}c224`}>
          <rect x={224} y={150} width={140} height={100} rx={44} />
        </clipPath>
      </defs>
      <g filter={`url(#${id}sh)`}>
        {/* arms */}
        <Shiny id={id}>
          {(p) => (
            <>
              <path d="M38 176 L10 150" stroke={p} strokeWidth="9" strokeLinecap="round" />
              <path d="M362 176 L390 150" stroke={p} strokeWidth="9" strokeLinecap="round" />
              <path d="M176 176 Q200 150 224 176" fill="none" stroke={p} strokeWidth="9" strokeLinecap="round" />
            </>
          )}
        </Shiny>
        {lens(36)}
        {lens(224)}
        <circle cx={46} cy={164} r={3.4} fill={a} />
        <circle cx={354} cy={164} r={3.4} fill={a} />
      </g>
    </Svg>
  );
};

/* -------------------------------------------------------------------- earbuds */
const Earbuds: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const a = ACCENT[tier];
  const bud = (cx: number, rot: number) => (
    <g transform={`rotate(${rot} ${cx} 335)`}>
      <Shiny id={id}>
        {(p) => (
          <>
            <rect x={cx - 9} y={330} width={18} height={50} rx={9} fill={p} />
            <circle cx={cx} cy={332} r={26} fill={p} />
          </>
        )}
      </Shiny>
      <circle cx={cx} cy={332} r={10} fill="#050507" opacity="0.6" />
      <circle cx={cx + 12} cy={322} r={3} fill={a} />
    </g>
  );
  return (
    <Svg size={size}>
      <Defs id={id} base={BODY[tier]} light={light} />
      <g filter={`url(#${id}sh)`}>
        <Shiny id={id}>{(p) => <rect x={92} y={96} width={216} height={170} rx={78} fill={p} />}</Shiny>
        <path d="M94 168 H306" stroke="#000" strokeOpacity="0.55" strokeWidth="3" />
        <path d="M94 171 H306" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
        <circle cx={200} cy={218} r={6} fill={a} />
        <circle cx={200} cy={218} r={14} fill={a} opacity="0.2" />
        <Mark x={200} y={128} tier={tier} s={0.8} />
        {bud(110, -12)}
        {bud(290, 12)}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------- backpack */
const Backpack: React.FC<PProps> = ({ tier, light = 0.5, size = 400 }) => {
  const id = useUid();
  const a = ACCENT[tier];
  return (
    <Svg size={size}>
      <Defs id={id} base={BODY[tier]} light={light} />
      <g filter={`url(#${id}sh)`}>
        <path d="M168 78 Q200 22 232 78" fill="none" stroke="#14151a" strokeWidth="14" strokeLinecap="round" />
        <Shiny id={id}>
          {(p) => (
            <path d="M104 160 Q104 66 200 66 Q296 66 296 160 L306 336 Q308 376 270 376 L130 376 Q92 376 94 336 Z" fill={p} />
          )}
        </Shiny>
        <path d="M118 172 Q200 128 282 172" fill="none" stroke={a} strokeWidth="3" opacity="0.8" strokeDasharray="3 5" />
        <Shiny id={id}>{(p) => <rect x={126} y={236} width={148} height={102} rx={28} fill={p} />}</Shiny>
        <rect x={126} y={236} width={148} height={102} rx={28} fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="3" />
        <path d="M132 252 H268" stroke={a} strokeWidth="3" opacity="0.85" strokeDasharray="3 5" />
        <circle cx={200} cy={252} r={5} fill={a} />
        <Mark x={200} y={202} tier={tier} s={0.8} />
        <path d="M100 196 Q64 262 94 340" fill="none" stroke="#0a0a0d" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
        <path d="M300 196 Q336 262 306 340" fill="none" stroke="#0a0a0d" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
      </g>
    </Svg>
  );
};

const MAP: Record<Kind, React.FC<PProps>> = {
  headphones: Headphones,
  watch: Watch,
  tee: Tee,
  sunglasses: Sunglasses,
  earbuds: Earbuds,
  backpack: Backpack,
};

export const Product: React.FC<PProps & { kind: Kind }> = ({ kind, ...rest }) => {
  const Cmp = MAP[kind];
  return <Cmp {...rest} />;
};

/** CSS-3D wrapper: perspective rotation driven by props (frame-computed upstream). */
export const Tilt: React.FC<{
  rotY?: number;
  rotX?: number;
  rotZ?: number;
  scale?: number;
  x?: number;
  y?: number;
  children: React.ReactNode;
}> = ({ rotY = 0, rotX = 0, rotZ = 0, scale = 1, x = 0, y = 0, children }) => (
  <div style={{ perspective: 1500 }}>
    <div
      style={{
        transform: `translate(${x}px, ${y}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  </div>
);
