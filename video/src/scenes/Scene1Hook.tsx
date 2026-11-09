import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { ProductSpot } from "../components/ProductSpot";
import { Kicker, KineticText } from "../components/KineticText";
import { C, WIDTH } from "../lib/theme";
import { easeInOut, lerp, prog } from "../lib/anim";

/** Scene 1 — black screen, a luxury product emerges from darkness, then the hook lines. */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const intensity = prog(frame, 8, 100, easeInOut);
  const reveal = prog(frame, 24, 90);
  const light = prog(frame, 24, 150, easeInOut);
  const shift = prog(frame, 84, 50);
  const size = lerp(620, 500, shift);
  const baseY = lerp(740, 600, shift);
  const rotY = lerp(-42, -6, frame / 255) + Math.sin(frame / 50) * 2;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={intensity} spotY={360} floorY={baseY - 6} />
      <ProductSpot
        kind="headphones"
        tier="premium"
        cx={WIDTH / 2}
        baseY={baseY}
        size={size}
        reveal={reveal}
        light={light}
        rotY={rotY}
        rotX={-4}
        float={Math.sin(frame / 38) * 5}
        reflection={0.22}
      />

      <div style={{ position: "absolute", top: 86, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kicker text="Why fake products can be better than real ones" start={14} outStart={78} size={22} />
      </div>

      <div style={{ position: "absolute", top: 738, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="WHY PAY MORE?" start={92} fontSize={150} stagger={7} outStart={150} outDur={16} />
      </div>

      <div style={{ position: "absolute", top: 722, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText
          text="WHEN YOU CAN GET ALMOST THE SAME THING FOR LESS?"
          start={172}
          fontSize={68}
          stagger={3}
          dur={22}
          accent={[4, 5, 6, 7]}
          accentColor={C.gold}
          maxWidth={1080}
        />
      </div>
    </div>
  );
};
