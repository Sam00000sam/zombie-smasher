import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { ProductSpot } from "../components/ProductSpot";
import { Kind, Tier } from "../components/Products";
import { KineticText } from "../components/KineticText";
import { C } from "../lib/theme";
import { easeInOut, lerp, prog } from "../lib/anim";

const LINEUP: { kind: Kind; tier: Tier; x: number; size: number; base: number }[] = [
  { kind: "tee", tier: "generic", x: 330, size: 270, base: 640 },
  { kind: "sunglasses", tier: "premium", x: 590, size: 290, base: 650 },
  { kind: "headphones", tier: "generic", x: 850, size: 340, base: 664 },
  { kind: "watch", tier: "premium", x: 1110, size: 340, base: 664 },
  { kind: "backpack", tier: "generic", x: 1360, size: 290, base: 650 },
  { kind: "earbuds", tier: "premium", x: 1620, size: 270, base: 640 },
];

/** Scene 6 — cinematic lineup and the three closing lines. */
export const Scene6End: React.FC = () => {
  const frame = useCurrentFrame();
  const dolly = prog(frame, 0, 300, easeInOut);
  const dim = prog(frame, 296, 26, easeInOut);
  const finalIn = 308;
  const shine = prog(frame, finalIn + 20, 70, easeInOut);
  const fadeBlack = prog(frame, 478, 32, easeInOut);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={1} spotY={420} floorY={676} warm="rgba(227,189,115,0.2)" cool="rgba(79,224,205,0.16)" />

      {/* lineup, slowly dollying in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${lerp(1, 1.1, dolly)}) translateX(${lerp(14, -14, dolly)}px)`,
          transformOrigin: "50% 62%",
          opacity: lerp(1, 0.22, dim),
          filter: dim > 0 ? `blur(${dim * 6}px)` : undefined,
        }}
      >
        {LINEUP.map((p, i) => {
          const r = prog(frame, 4 + i * 11, 46);
          return (
            <ProductSpot
              key={p.kind}
              kind={p.kind}
              tier={p.tier}
              cx={p.x}
              baseY={p.base}
              size={p.size}
              reveal={r}
              light={prog(frame, 4 + i * 11, 180, easeInOut)}
              rotY={lerp(-24, 24, (i + 0.5) / LINEUP.length) * -1 + Math.sin(frame / 55 + i) * 4}
              float={Math.sin(frame / 36 + i * 1.3) * 6}
              glow={p.tier === "premium" ? "rgba(227,189,115,0.26)" : "rgba(79,224,205,0.24)"}
              reflection={0.34}
            />
          );
        })}
        {/* sweeping beam of light across the lineup */}
        <div
          style={{
            position: "absolute",
            top: 140,
            left: lerp(-500, 2100, prog(frame, 30, 200, easeInOut)),
            width: 260,
            height: 760,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
            transform: "skewX(-18deg)",
            filter: "blur(18px)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="IT'S NOT ALWAYS ABOUT THE BRAND." start={26} fontSize={84} stagger={5} outStart={150} outDur={16} />
      </div>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="IT'S ABOUT THE VALUE." start={176} fontSize={104} stagger={7} accent={[2, 3]} accentColor={C.gold} outStart={286} outDur={16} />
      </div>

      {/* final line */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <KineticText text="BUY SMART." start={finalIn} fontSize={190} stagger={8} dur={30} />
          <KineticText text="NOT EXPENSIVE." start={finalIn + 20} fontSize={190} stagger={8} dur={30} accent={[0, 1]} accentColor={C.gold} />
          {/* light shine passing over the lockup */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              overflow: "hidden",
              pointerEvents: "none",
              opacity: shine > 0 && shine < 1 ? 1 : 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${lerp(-30, 120, shine)}%`,
                width: "22%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                transform: "skewX(-20deg)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fadeBlack, pointerEvents: "none" }} />
    </div>
  );
};
