import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { ProductSpot } from "../components/ProductSpot";
import { Kicker, KineticText } from "../components/KineticText";
import { Shopper } from "../components/Shopper";
import { C, FONT } from "../lib/theme";
import { easeInOut, lerp, prog } from "../lib/anim";

const LX = 440;
const RX = 1480;
const BASE = 610;
/** local frames where the shopper's attention switches (0 = branded, 1 = value) */
export const LOOK_AT = [
  { f: 70, to: 0 },
  { f: 138, to: 1 },
  { f: 206, to: 0 },
  { f: 266, to: 1 },
];

/** Shopper's attention: 0 = branded (left) … 1 = value (right), eased between the cues. */
const attention = (frame: number) => {
  let value = 0.5;
  for (const k of LOOK_AT) {
    value = lerp(value, k.to, prog(frame, k.f - 20, 24, easeInOut));
  }
  return value;
};

/** Scene 4 — a shopper weighs the branded watch against the value one. */
export const Scene4Choice: React.FC = () => {
  const frame = useCurrentFrame();
  const att = attention(frame); // 0 left .. 1 right
  const look = (att - 0.5) * 2;
  const leftGlow = Math.max(0, 1 - att * 1.6);
  const rightGlow = Math.max(0, att * 1.6 - 0.6);
  const settle = prog(frame, 300, 24);
  const revL = prog(frame, 6, 40);
  const revR = prog(frame, 18, 40);
  const shopper = prog(frame, 20, 36);
  const dash = -frame * 1.2;
  const capOut = 1 - prog(frame, 322, 16, easeInOut);

  const beam = (x: number, color: string, strength: number) => (
    <line
      x1={960}
      y1={520}
      x2={x}
      y2={430}
      stroke={color}
      strokeWidth={3}
      strokeDasharray="6 10"
      strokeDashoffset={x < 960 ? -dash : dash}
      opacity={strength * 0.9}
    />
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={1} spotY={380} floorY={BASE - 6} warm="rgba(227,189,115,0.18)" cool="rgba(79,224,205,0.15)" />

      <div style={{ position: "absolute", top: 54, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kicker text="The freedom of choice" start={2} color={C.dim} size={24} />
      </div>
      <div style={{ position: "absolute", top: 104, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="YOU DECIDE WHAT'S WORTH IT." start={12} fontSize={78} stagger={5} accent={[2, 3, 4]} accentColor={C.text} />
      </div>

      <ProductSpot
        kind="watch"
        tier="premium"
        cx={LX}
        baseY={BASE}
        size={400}
        reveal={revL}
        light={prog(frame, 6, 120, easeInOut)}
        rotY={-12}
        glow={`rgba(227,189,115,${0.18 + leftGlow * 0.3})`}
        opacity={lerp(0.55, 1, Math.max(leftGlow, settle))}
        float={Math.sin(frame / 40) * 4}
      />
      <ProductSpot
        kind="watch"
        tier="generic"
        cx={RX}
        baseY={BASE}
        size={400}
        reveal={revR}
        light={prog(frame, 18, 120, easeInOut)}
        rotY={12}
        glow={`rgba(79,224,205,${0.18 + rightGlow * 0.3})`}
        opacity={lerp(0.55, 1, Math.max(rightGlow, settle))}
        float={Math.sin(frame / 40 + 2) * 4}
      />

      {/* attention beams */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {beam(LX + 160, C.gold, leftGlow * (1 - settle))}
        {beam(RX - 160, C.teal, rightGlow * (1 - settle))}
      </svg>

      <div style={{ position: "absolute", left: 960 - 100, top: 300 + (1 - shopper) * 40, opacity: shopper }}>
        <Shopper height={440} look={look} />
      </div>

      {/* prices under each pedestal */}
      <div style={{ position: "absolute", left: LX - 300, width: 600, top: 676, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: prog(frame, 40, 20) }}>
        <Kicker text="Branded" start={40} color={C.gold} size={24} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, color: C.gold, letterSpacing: "-0.03em" }}>$480</div>
      </div>
      <div style={{ position: "absolute", left: RX - 300, width: 600, top: 676, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: prog(frame, 50, 20) }}>
        <Kicker text="Value alternative" start={50} color={C.teal} size={24} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, color: C.teal, letterSpacing: "-0.03em" }}>$60</div>
      </div>

      {/* captions that follow the shopper's attention */}
      <div style={{ position: "absolute", left: LX - 330, width: 660, top: 820, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 32, color: C.text, opacity: capOut * lerp(0.3, 1, leftGlow) * prog(frame, 60, 20) }}>
        Love the brand? <span style={{ color: C.gold }}>That's a valid choice.</span>
      </div>
      <div style={{ position: "absolute", left: RX - 330, width: 660, top: 820, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 32, color: C.text, opacity: capOut * lerp(0.3, 1, rightGlow) * prog(frame, 60, 20) }}>
        Want the value? <span style={{ color: C.teal }}>Keep the difference.</span>
      </div>

      <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="A FAMOUS LOGO ISN'T ALWAYS WORTH THE EXTRA." start={334} fontSize={56} stagger={3} accent={[1, 2]} accentColor={C.gold} maxWidth={1700} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}>
        <Kicker text="Illustrative example prices" start={60} color="#5d5d68" size={18} />
      </div>
    </div>
  );
};
