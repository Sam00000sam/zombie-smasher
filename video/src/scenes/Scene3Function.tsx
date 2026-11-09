import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { ProductSpot } from "../components/ProductSpot";
import { Kicker, KineticText } from "../components/KineticText";
import { Icon } from "../components/Chip";
import { Kind } from "../components/Products";
import { C, FONT } from "../lib/theme";
import { easeInOut, easeOutExpo, lerp, prog } from "../lib/anim";

export const CARD_FOCUS = [60, 150, 240, 330]; // local frames where each card takes focus
const CARD_W = 560;
const GAP = 70;
const CARD_Y = 300;
const CARD_H = 700;

type Card = {
  kind: Kind;
  cat: string;
  name: string;
  brand: number;
  alt: number;
  perks: string[];
};

const CARDS: Card[] = [
  { kind: "headphones", cat: "AUDIO", name: "Wireless headphones", brand: 349, alt: 39, perks: ["Wireless sound", "Comfortable fit", "All-day battery"] },
  { kind: "tee", cat: "CLOTHING", name: "Everyday tee", brand: 65, alt: 12, perks: ["Soft fabric", "Same clean fit", "Easy to wash"] },
  { kind: "sunglasses", cat: "ACCESSORIES", name: "Sunglasses", brand: 240, alt: 25, perks: ["Light frame", "Clear lenses", "Everyday style"] },
  { kind: "earbuds", cat: "GADGETS", name: "Wireless earbuds", brand: 179, alt: 29, perks: ["Bluetooth pairing", "Charging case", "Great daily use"] },
];

/** Camera position along the strip (0..3), eased between focus frames. */
const cameraIndex = (frame: number) => {
  let idx = 0;
  for (let i = 1; i < CARD_FOCUS.length; i++) {
    idx += prog(frame, CARD_FOCUS[i] - 22, 34, easeInOut);
  }
  return idx;
};

/** Scene 3 — affordable alternatives that do the same job; camera pans across category cards. */
export const Scene3Function: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraIndex(frame);
  const trackX = 960 - CARD_W / 2 - cam * (CARD_W + GAP);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={1} spotY={420} floorY={null} warm="rgba(79,224,205,0.12)" cool="rgba(120,140,255,0.14)" />

      <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="SAME JOB. SMALLER PRICE." start={4} fontSize={80} stagger={5} accent={[2, 3]} accentColor={C.teal} />
      </div>
      <div style={{ position: "absolute", top: 172, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kicker text="Many affordable alternatives deliver excellent everyday value" start={26} color={C.dim} size={22} />
      </div>

      {CARDS.map((c, i) => {
        const dist = Math.abs(cam - i);
        const focus = Math.max(0, 1 - dist);
        const scale = lerp(0.82, 1, focus);
        const opacity = lerp(0.35, 1, focus);
        const x = trackX + i * (CARD_W + GAP);
        const enter = prog(frame, 8 + i * 8, 34);
        const perkStart = CARD_FOCUS[i] + 14;
        const light = prog(frame, CARD_FOCUS[i] - 20, 110, easeInOut);
        return (
          <div
            key={c.kind}
            style={{
              position: "absolute",
              left: x,
              top: CARD_Y + (1 - enter) * 60,
              width: CARD_W,
              height: CARD_H,
              opacity: opacity * enter,
              transform: `scale(${scale})`,
              transformOrigin: "50% 40%",
              borderRadius: 40,
              background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.025) 55%)",
              border: "1.5px solid rgba(255,255,255,0.14)",
              boxShadow: `0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 ${focus * 80}px rgba(79,224,205,${0.16 * focus})`,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 30, left: 40, fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: "0.32em", color: C.teal }}>
              {c.cat}
            </div>
            <div style={{ position: "absolute", top: 66, left: 40, fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.text }}>
              {c.name}
            </div>

            {/* product */}
            <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H }}>
              <ProductSpot
                kind={c.kind}
                tier="generic"
                cx={CARD_W / 2}
                baseY={400}
                size={300}
                reveal={1}
                light={light}
                rotY={-16 + Math.sin(frame / 50 + i) * 8}
                rotX={-3}
                float={Math.sin(frame / 36 + i) * 4}
                reflection={0}
                glow="rgba(79,224,205,0.22)"
              />
            </div>

            {/* perks */}
            <div style={{ position: "absolute", left: 40, top: 452, display: "flex", flexDirection: "column", gap: 14 }}>
              {c.perks.map((perk, k) => {
                const p = prog(frame, perkStart + k * 12, 18, easeOutExpo);
                return (
                  <div key={perk} style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * 24}px)`, fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.text }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${C.teal}26`, border: `1.5px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.5 + 0.5 * p})` }}>
                      <Icon name="check" size={20} color={C.teal} stroke={2.6} />
                    </div>
                    {perk}
                  </div>
                );
              })}
            </div>

            {/* price strip */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 104, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0))", opacity: prog(frame, perkStart + 30, 20) }}>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.dim, textDecoration: "line-through", textDecorationColor: C.red }}>
                ${c.brand} branded
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.teal, letterSpacing: "-0.03em" }}>
                ${c.alt}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, textAlign: "center" }}>
        <Kicker text="Illustrative example prices" start={40} color="#5d5d68" size={18} />
      </div>
    </div>
  );
};
