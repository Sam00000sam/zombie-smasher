import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Kicker, KineticText } from "../components/KineticText";
import { Icon, IconName } from "../components/Chip";
import { C, FONT } from "../lib/theme";
import { easeOutExpo, prog } from "../lib/anim";

type Tone = "good" | "ok" | "bad";
const TONE: Record<Tone, string> = { good: C.green, ok: C.amber, bad: C.red };

const COLS: { title: string; sub: string; icon: IconName; color: string }[] = [
  { title: "GENUINE BRAND", sub: "The real thing", icon: "shield", color: C.gold },
  { title: "LEGIT ALTERNATIVE", sub: "Affordable & honest", icon: "tag", color: C.teal },
  { title: "COUNTERFEIT", sub: "Copies a brand's logo", icon: "warn", color: C.red },
];

const ROWS: { label: string; cells: { t: string; tone: Tone }[] }[] = [
  { label: "Quality control", cells: [{ t: "Strict", tone: "good" }, { t: "Varies", tone: "ok" }, { t: "None", tone: "bad" }] },
  { label: "Warranty & support", cells: [{ t: "Included", tone: "good" }, { t: "Usually", tone: "ok" }, { t: "None", tone: "bad" }] },
  { label: "Safety standards", cells: [{ t: "Certified", tone: "good" }, { t: "Check label", tone: "ok" }, { t: "Unverified", tone: "bad" }] },
  { label: "Legal to sell", cells: [{ t: "Yes", tone: "good" }, { t: "Yes", tone: "good" }, { t: "Illegal", tone: "bad" }] },
];

export const ROW_START = 84;
export const ROW_STEP = 28;

const COL_X = [560, 984, 1408];
const COL_W = 400;
const ROW_Y0 = 392;
const ROW_H = 92;

/** Scene 5 — balanced reality check: genuine vs legitimate alternative vs counterfeit. */
export const Scene5Reality: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stage intensity={0.9} spotY={300} floorY={null} warm="rgba(255,184,77,0.12)" cool="rgba(255,90,95,0.10)" />

      <div style={{ position: "absolute", top: 46, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kicker text="The reality check" start={2} color={C.amber} size={24} />
      </div>
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="CHEAPER IS NOT THE SAME AS FAKE." start={10} fontSize={70} stagger={5} accent={[5, 6]} accentColor={C.red} />
      </div>

      {/* column headers */}
      {COLS.map((c, i) => {
        const p = prog(frame, 26 + i * 12, 30, easeOutExpo);
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: COL_X[i],
              top: 214,
              width: COL_W,
              height: 150,
              borderRadius: 28,
              background: `linear-gradient(160deg, ${c.color}26, rgba(255,255,255,0.03))`,
              border: `1.5px solid ${c.color}77`,
              boxShadow: `0 0 60px ${c.color}22, inset 0 1px 0 rgba(255,255,255,0.18)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
            }}
          >
            <Icon name={c.icon} size={52} color={c.color} stroke={1.6} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: "0.1em", color: C.text }}>{c.title}</div>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 22, color: C.dim }}>{c.sub}</div>
          </div>
        );
      })}

      {/* rows */}
      {ROWS.map((r, ri) => {
        const rs = ROW_START + ri * ROW_STEP;
        const lp = prog(frame, rs, 24, easeOutExpo);
        const y = ROW_Y0 + ri * ROW_H;
        return (
          <React.Fragment key={r.label}>
            <div
              style={{
                position: "absolute",
                left: 100,
                top: y,
                width: 440,
                height: ROW_H - 14,
                display: "flex",
                alignItems: "center",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 34,
                color: C.text,
                opacity: lp,
                transform: `translateX(${(1 - lp) * -40}px)`,
              }}
            >
              {r.label}
            </div>
            {r.cells.map((cell, ci) => {
              const p = prog(frame, rs + 6 + ci * 7, 22, easeOutExpo);
              const col = TONE[cell.tone];
              const ic: IconName = cell.tone === "good" ? "check" : cell.tone === "bad" ? "cross" : "dot";
              return (
                <div
                  key={ci}
                  style={{
                    position: "absolute",
                    left: COL_X[ci],
                    top: y,
                    width: COL_W,
                    height: ROW_H - 14,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    background: `${col}14`,
                    border: `1.5px solid ${col}55`,
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 32,
                    color: col,
                    opacity: p,
                    transform: `scale(${0.88 + 0.12 * p})`,
                  }}
                >
                  <Icon name={ic} size={34} color={col} stroke={2.8} />
                  {cell.t}
                </div>
              );
            })}
            <div
              style={{
                position: "absolute",
                left: 100,
                width: 1708,
                top: y + ROW_H - 7,
                height: 1,
                background: "rgba(255,255,255,0.08)",
                opacity: lp,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* takeaway */}
      <div style={{ position: "absolute", top: 806, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText text="COUNTERFEITS CAN BE UNSAFE." start={238} fontSize={64} stagger={4} accent={[2, 3]} accentColor={C.red} />
      </div>
      <div style={{ position: "absolute", top: 896, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <KineticText
          text="A LEGITIMATE, AFFORDABLE ALTERNATIVE IS OFTEN THE SMARTER CHOICE."
          start={300}
          fontSize={36}
          stagger={2}
          weight={700}
          color={C.text}
          accent={[1, 2, 3]}
          accentColor={C.teal}
          maxWidth={1600}
          letterSpacing="0.01em"
        />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, textAlign: "center" }}>
        <Kicker text="Buy from reputable sellers · check reviews and certifications" start={360} color="#5d5d68" size={18} />
      </div>
    </div>
  );
};
