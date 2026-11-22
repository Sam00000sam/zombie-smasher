import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { ProductSpot } from "../components/ProductSpot";
import { Kicker, KineticText } from "../components/KineticText";
import { Price, Pill } from "../components/Price";
import { Chip } from "../components/Chip";
import { C, FONT } from "../lib/theme";
import { easeInOut, easeOutExpo, prog } from "../lib/anim";

const PHASE_B = 212;

/** Scene 2 — side-by-side price reveal, then what the premium actually pays for. */
export const Scene2Price: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;
  const aOut = 1 - prog(frame, PHASE_B - 14, 16, easeInOut);
  const bIn = prog(frame, PHASE_B, 22, easeInOut);

  const revL = prog(frame, 22, 40);
  const revR = prog(frame, 50, 40);
  const lightL = prog(frame, 22, 110, easeInOut);
  const lightR = prog(frame, 50, 110, easeInOut);
  const baseY = 600;

  const bFloat = Math.sin(frame / 40) * 5;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={1} spotY={380} floorY={baseY - 6} />

      {/* ---------- phase A : two products, two prices ---------- */}
      <div style={{ position: "absolute", inset: 0, opacity: aOut }}>
        <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText text="SAME LOOK. VERY DIFFERENT PRICE." start={4} fontSize={62} stagger={4} accent={[3, 4]} outStart={PHASE_B - 14} outDur={12} />
        </div>

        <ProductSpot
          kind="headphones"
          tier="premium"
          cx={500 - (1 - revL) * 160}
          baseY={baseY}
          size={430}
          reveal={revL}
          light={lightL}
          rotY={-14 + Math.sin(frame / 45) * 4}
          glow="rgba(227,189,115,0.28)"
          float={Math.sin(frame / 38) * 4}
        />
        <ProductSpot
          kind="headphones"
          tier="generic"
          cx={1420 + (1 - revR) * 160}
          baseY={baseY}
          size={430}
          reveal={revR}
          light={lightR}
          rotY={14 + Math.sin(frame / 45 + 1) * 4}
          glow="rgba(79,224,205,0.26)"
          float={Math.sin(frame / 38 + 2) * 4}
        />

        {/* VS badge */}
        <div
          style={{
            position: "absolute",
            left: 960 - 46,
            top: 400,
            width: 92,
            height: 92,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 34,
            color: C.text,
            letterSpacing: "0.05em",
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            opacity: prog(frame, 60, 20),
            transform: `scale(${0.6 + prog(frame, 60, 24) * 0.4})`,
          }}
        >
          VS
        </div>

        {/* labels */}
        <div style={{ position: "absolute", left: 500 - 300, width: 600, top: 668, display: "flex", justifyContent: "center" }}>
          <Kicker text="Branded" start={40} color={C.gold} size={30} />
        </div>
        <div style={{ position: "absolute", left: 1420 - 300, width: 600, top: 668, display: "flex", justifyContent: "center" }}>
          <Kicker text="Generic alternative" start={68} color={C.teal} size={30} />
        </div>

        {/* prices */}
        <div style={{ position: "absolute", left: 500 - 300, width: 600, top: 730, display: "flex", justifyContent: "center" }}>
          <Price value={349} start={96} color={C.gold} />
        </div>
        <div style={{ position: "absolute", left: 1420 - 300, width: 600, top: 730, display: "flex", justifyContent: "center" }}>
          <Price value={39} start={138} color={C.teal} />
        </div>
        <div style={{ position: "absolute", left: 960 - 260, width: 520, top: 780, display: "flex", justifyContent: "center" }}>
          <Pill text="SAVE $310" start={176} color={C.green} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 985, textAlign: "center" }}>
          <Kicker text="Illustrative example prices" start={100} color="#5d5d68" size={18} />
        </div>
      </div>

      {/* ---------- phase B : what the premium pays for ---------- */}
      <div style={{ position: "absolute", inset: 0, opacity: bIn }}>
        <ProductSpot
          kind="headphones"
          tier="premium"
          cx={960}
          baseY={650}
          size={400}
          reveal={1}
          light={(frame - PHASE_B) / 160}
          rotY={-10 + Math.sin(frame / 45) * 6}
          glow="rgba(227,189,115,0.3)"
          float={bFloat}
        />
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kicker text="Part of what you're paying for" start={PHASE_B + 4} color={C.dim} size={26} />
        </div>
        <div style={{ position: "absolute", top: 160, left: 960 - 250, width: 500, display: "flex", justifyContent: "center" }}>
          <Chip icon="crown" label="PRESTIGE" start={PHASE_B + 26} fromX={0} />
        </div>
        <div style={{ position: "absolute", top: 330, left: 190, display: "flex" }}>
          <Chip icon="tag" label="BRANDING" start={PHASE_B + 44} fromX={-80} />
        </div>
        <div style={{ position: "absolute", top: 330, right: 190, display: "flex" }}>
          <Chip icon="megaphone" label="MARKETING" start={PHASE_B + 62} fromX={80} />
        </div>
        {/* connector lines */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[
            { x1: 960, y1: 235, x2: 960, y2: 330, d: 34 },
            { x1: 560, y1: 365, x2: 800, y2: 430, d: 52 },
            { x1: 1360, y1: 365, x2: 1120, y2: 430, d: 70 },
          ].map((l, i) => {
            const p = prog(frame, PHASE_B + l.d, 22, easeOutExpo);
            return (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x1 + (l.x2 - l.x1) * p}
                y2={l.y1 + (l.y2 - l.y1) * p}
                stroke={C.gold}
                strokeWidth={2}
                strokeDasharray="4 8"
                opacity={0.7}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: 806, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <KineticText
            text="YOU'RE OFTEN PAYING FOR THE NAME — NOT JUST THE PRODUCT."
            start={PHASE_B + 54}
            fontSize={56}
            stagger={3}
            accent={[4, 5]}
            accentColor={C.gold}
            maxWidth={1500}
          />
        </div>
      </div>
    </div>
  );
};
