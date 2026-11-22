import React from "react";
import { AbsoluteFill, Audio, spring, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { io, p01 } from "../v5/smooth";
import { burst, Cam, card, floor, Item, motes, setView, spot } from "../v6/engine";
import { camAt, camMotion, Z } from "./camera";
import "./fonts";
import { LuxBag } from "./LuxBag";
import { ChapterCards, Grain, PhraseCaptions, SAFE_CX, Tracker } from "./overlays";
import { Chip, disc, Fill, Glass, GOLD, goldText, GREEN, money, MUTED, rain, RED, Txt, WHITE } from "./stage";
import { CHAPTERS, CUE, f, L, TOTAL_FRAMES } from "./timing";

/* TikTok-safe lens: a little wider, centred left of the side buttons and above the caption area. */
const VIEW_TT = { f: 1010, cx: SAFE_CX, cy: 770 };

const fade = (fr: number, a: number, b: number, fi = 12, fo = 9) => p01(fr, a, fi) * (1 - p01(fr, b - fo, fo));
const pop = (fr: number, at: number, stiff = 170) => spring({ frame: fr - at, fps: 30, config: { damping: 14, stiffness: stiff, mass: 0.7 } });
const WARM = "#ffe2a8";
const BAG_Y = 158; // card centre that puts the bag's base on a 36-high pedestal

/** A bag standing on a glossy pedestal, softly spot-lit, with its reflection in the floor. */
const bagOn = (c: Cam, key: string, o: { x: number; z: number; op: number; tone?: "black" | "tan" | "cream"; glint?: number; size?: number; lift?: number; light?: number }): (Item | null)[] => {
  const size = o.size ?? 340;
  return [
    spot(c, key + "-sp", { p: [o.x, 0, o.z], r: 150, color: WARM, opacity: o.op * 0.55 * (o.light ?? 1), top: 1300 }),
    disc(c, key + "-d", { p: [o.x, 0, o.z], r: 128, h: 36, opacity: o.op }),
    card(c, key + "-b", {
      p: [o.x, BAG_Y * (size / 300) + (o.lift ?? 0), o.z - 2],
      w: size,
      h: size,
      opacity: o.op,
      reflect: 0.2,
      children: (
        <div style={{ filter: "drop-shadow(0 26px 22px rgba(0,0,0,0.55))" }}>
          <LuxBag id={key} size={size} tone={o.tone} glint={o.glint} />
        </div>
      ),
    }),
  ];
};

/* ===================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  const [c5, c4, c3, c2, c1] = CHAPTERS;

  /* ---- hook: two identical bags, "5 reasons" -------------------------------- */
  const HO = 1 - p01(fr, f(c5.from) - 3, 8);
  if (HO > 0) {
    const z = Z.H;
    it.push(...bagOn(c, "H-l", { x: -200, z, op: HO }));
    it.push(...bagOn(c, "H-r", { x: 200, z, op: HO, glint: p01(fr, f(CUE.stay), 22) }));
    const a1 = p01(fr, f(L.hook.start) - 2, 12);
    const a2 = p01(fr, f(CUE.fake) - 4, 12);
    it.push(
      card(c, "H-title", {
        p: [0, 735, z],
        w: 880,
        h: 260,
        opacity: HO,
        noBlur: true,
        children: (
          <Fill gap={10}>
            <div style={{ clipPath: `inset(-20% ${100 - a1 * 100}% -20% 0)`, display: "flex", alignItems: "baseline", gap: 22 }}>
              <Txt s={150} w={900} style={{ ...goldText, letterSpacing: "-0.03em" }}>5</Txt>
              <Txt s={124} w={900} ls="-0.02em">REASONS</Txt>
            </div>
            <div style={{ opacity: a2, transform: `translateY(${(1 - a2) * 16}px)` }}>
              <Txt s={44} w={700} ls="0.14em" c={MUTED} style={{ paddingLeft: "0.14em" }}>
                THE <span style={{ color: GOLD }}>FAKE</span> BEATS THE REAL
              </Txt>
            </div>
          </Fill>
        ),
      }),
    );
    it.push(card(c, "H-cr", { p: [-200, 395, z - 10], w: 170, h: 54, opacity: HO * p01(fr, f(CUE.real) - 3, 8), children: <Chip text="REAL" /> }));
    it.push(card(c, "H-cf", { p: [200, 395, z - 10], w: 170, h: 54, opacity: HO * p01(fr, f(CUE.fake) - 3, 8), children: <Chip text="FAKE" gold /> }));
  }

  /* ---- 5: the price ----------------------------------------------------------- */
  const O5 = fade(fr, f(c5.from) - 6, f(c4.from) + 5, 12, 8);
  if (O5 > 0) {
    const z = Z.R5;
    it.push(...bagOn(c, "P-l", { x: -205, z, op: O5 }));
    it.push(...bagOn(c, "P-r", { x: 205, z, op: O5, glint: p01(fr, f(CUE.hundred), 22) }));
    const t0 = f(CUE.three) - 4;
    const t1 = f(CUE.hundred) - 6;
    const tag = (key: string, x: number, at: number, label: string, value: React.ReactNode, gold: boolean) => {
      const s = pop(fr, at);
      return card(c, key, {
        p: [x, 570 + (1 - s) * 60, z],
        w: 320,
        h: 170,
        opacity: O5 * p01(fr, at, 6),
        children: (
          <Glass gold={gold}>
            <Fill gap={6}>
              <Txt s={22} w={700} ui ls="0.3em" c={MUTED}>{label}</Txt>
              {value}
            </Fill>
          </Glass>
        ),
      });
    };
    it.push(tag("P-t0", -205, t0, "DESIGNER", <Txt s={80} w={800}>{money(3000 * io(p01(fr, t0 + 2, 18)))}</Txt>, false));
    it.push(tag("P-t1", 205, t1, "REPLICA", <Txt s={80} w={800} style={goldText}>$100</Txt>, true));
    const eq = pop(fr, f(CUE.same) - 3);
    it.push(card(c, "P-eq", { p: [0, 210, z - 60], w: 150, h: 150, opacity: O5 * p01(fr, f(CUE.same) - 3, 6), children: <div style={{ position: "absolute", inset: 0, transform: `scale(${eq})` }}><Glass r={75}><Fill><Txt s={84} w={800}>=</Txt></Fill></Glass></div> }));
    it.push(card(c, "P-same", { p: [0, 92, z - 60], w: 240, h: 50, opacity: O5 * p01(fr, f(CUE.same) + 3, 8), children: <Chip text="SAME LOOK" s={22} /> }));
    const x30 = pop(fr, f(CUE.thirty) - 4, 140);
    it.push(
      card(c, "P-30", {
        p: [0, 805, z - 40],
        w: 560,
        h: 150,
        opacity: O5 * p01(fr, f(CUE.thirty) - 4, 6),
        noBlur: true,
        children: (
          <Fill row gap={20} style={{ transform: `scale(${lerp(0.7, 1, x30)})` }}>
            <Txt s={136} w={900} ls="-0.03em" style={goldText}>30×</Txt>
            <Txt s={50} w={800} ls="0.04em">CHEAPER</Txt>
          </Fill>
        ),
      }),
    );
    it.push(burst(c, "P-burst", { p: [0, 800, z + 20], t: p01(fr, f(CUE.thirty), 26), n: 26, spread: 340 }));
  }

  /* ---- 4: you'll actually use it --------------------------------------------- */
  const O4 = fade(fr, f(c4.from) - 6, f(c3.from) + 5, 12, 8);
  if (O4 > 0) {
    const z = Z.R4;
    const used = pop(fr, f(CUE.use) - 2, 200);
    const sway = Math.sin(Math.min(1, (fr - f(CUE.use)) / 24) * Math.PI * 2) * (fr > f(CUE.use) ? 1 : 0) * 10;
    it.push(...bagOn(c, "U", { x: -175, z, op: O4, lift: Math.abs(sway) * 2, glint: p01(fr, f(CUE.use), 22) }));
    it.push(card(c, "U-daily", { p: [-175, 405, z - 10], w: 250, h: 56, opacity: O4 * p01(fr, f(CUE.use) - 2, 8), children: <div style={{ position: "absolute", inset: 0, transform: `scale(${used})` }}><Chip text="EVERY DAY" gold s={22} /></div> }));
    const rows = [
      { t: "BABYING IT", at: f(CUE.no1) },
      { t: "DUST BAG", at: f(CUE.no2) },
      { t: "RAIN PANIC", at: f(CUE.no3) },
    ];
    it.push(
      card(c, "U-list", {
        p: [205, 360, z - 30],
        w: 380,
        h: 400,
        opacity: O4 * p01(fr, f(CUE.youll), 10),
        children: (
          <Glass>
            <div style={{ position: "absolute", left: 34, top: 30 }}>
              <Txt s={22} w={700} ui ls="0.3em" c={MUTED}>NO MORE</Txt>
            </div>
            {rows.map((r, i) => {
              const on = p01(fr, r.at - 3, 8);
              const strike = p01(fr, r.at + 3, 9);
              return (
                <div key={r.t} style={{ position: "absolute", left: 34, right: 34, top: 92 + i * 98, height: 78, display: "flex", alignItems: "center", gap: 18, opacity: lerp(0.25, 1, on) }}>
                  <div style={{ width: 46, height: 46, borderRadius: 23, background: on > 0.5 ? "rgba(255,90,95,0.18)" : "rgba(255,255,255,0.06)", border: `2px solid ${on > 0.5 ? RED : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={22} height={22} viewBox="0 0 22 22">
                      <path d="M5 5 L17 17 M17 5 L5 17" stroke={on > 0.5 ? RED : "rgba(255,255,255,0.4)"} strokeWidth={3} strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Txt s={34} w={800}>{r.t}</Txt>
                    <div style={{ position: "absolute", left: -4, top: "52%", height: 4, width: `calc(${strike * 100}% + 8px)`, background: RED, borderRadius: 2, boxShadow: `0 0 10px ${RED}` }} />
                  </div>
                </div>
              );
            })}
          </Glass>
        ),
      }),
    );
    it.push(rain(c, "U-rain", { c: [-175, 0, z - 40], w: 260, d: 160, h: 900, fr, opacity: O4 * p01(fr, f(CUE.no3) - 4, 12) }));
  }

  /* ---- 3: nobody can tell ---------------------------------------------------- */
  const O3 = fade(fr, f(c3.from) - 6, f(c2.from) + 5, 12, 8);
  if (O3 > 0) {
    const z = Z.R3;
    const rv = p01(fr, f(CUE.realThing) - 2, 10);
    it.push(...bagOn(c, "T-l", { x: -200, z, op: O3, glint: rv > 0 ? p01(fr, f(CUE.realThing), 22) : 0, light: lerp(1, 1.5, rv) }));
    it.push(...bagOn(c, "T-r", { x: 200, z, op: O3, light: lerp(1, 0.7, rv) }));
    const q = pop(fr, f(CUE.nobody) - 2);
    it.push(
      card(c, "T-q", {
        p: [0, 690, z],
        w: 860,
        h: 170,
        opacity: O3 * p01(fr, f(CUE.nobody) - 2, 8),
        noBlur: true,
        children: (
          <Fill gap={4} style={{ transform: `scale(${lerp(0.85, 1, q)})` }}>
            <Txt s={26} w={700} ui ls="0.3em" c={MUTED}>CAN YOU TELL?</Txt>
            <Txt s={74} w={900} ls="-0.02em">
              WHICH ONE IS <span style={goldText}>REAL</span>?
            </Txt>
          </Fill>
        ),
      }),
    );
    // A / B, then the reveal
    [
      { x: -200, ab: "A", ans: "REPLICA", gold: true },
      { x: 200, ab: "B", ans: "REAL", gold: false },
    ].forEach((b, i) => {
      it.push(
        card(c, `T-ab${i}`, {
          p: [b.x, 405, z - 10],
          w: 230,
          h: 64,
          opacity: O3 * p01(fr, f(CUE.nobody) + 4 + i * 3, 8),
          children: (
            <div style={{ position: "absolute", inset: 0, transform: `rotateX(${(rv < 0.5 ? rv : 1 - rv) * 180}deg)` }}>
              <Chip text={rv < 0.5 ? b.ab : b.ans} gold={rv >= 0.5 && b.gold} s={rv < 0.5 ? 30 : 24} />
            </div>
          ),
        }),
      );
    });
    it.push(burst(c, "T-burst", { p: [-200, 300, z + 20], t: p01(fr, f(CUE.realThing) + 4, 26), n: 24, spread: 280 }));
  }

  /* ---- 2: trends move fast --------------------------------------------------- */
  const O2 = fade(fr, f(c2.from) - 6, f(c1.from) + 5, 12, 8);
  if (O2 > 0) {
    const z = Z.R2;
    const tr = f(CUE.trends);
    const dies = f(CUE.dies);
    const W2 = 760;
    const curve = (t: number) => (t < 0.45 ? Math.pow(t / 0.45, 1.6) : Math.max(0.05, 1 - Math.pow((t - 0.45) / 0.5, 0.8)));
    const drawn = 0.45 * io(p01(fr, tr - 2, 16)) + 0.55 * io(p01(fr, dies - 6, 22));
    const pts = Array.from({ length: 61 }, (_, i) => i / 60).filter((t) => t <= drawn);
    const px = (t: number) => 40 + t * (W2 - 80);
    const py = (t: number) => 330 - curve(t) * 230;
    const path = pts.map((t, i) => `${i ? "L" : "M"}${px(t).toFixed(1)} ${py(t).toFixed(1)}`).join(" ");
    const tip = pts.length ? pts[pts.length - 1] : 0;
    it.push(
      card(c, "N-hype", {
        p: [0, 620, z],
        w: W2,
        h: 380,
        opacity: O2,
        children: (
          <Glass>
            <div style={{ position: "absolute", left: 34, top: 26 }}>
              <Txt s={22} w={700} ui ls="0.3em" c={MUTED}>HYPE</Txt>
            </div>
            <div style={{ position: "absolute", right: 34, bottom: 18 }}>
              <Txt s={20} w={700} ui ls="0.3em" c={MUTED}>TIME →</Txt>
            </div>
            <svg width={W2} height={380} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="hypeG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={GOLD} />
                  <stop offset="0.5" stopColor={GOLD} />
                  <stop offset="0.62" stopColor={RED} />
                  <stop offset="1" stopColor={RED} />
                </linearGradient>
              </defs>
              <line x1={40} y1={334} x2={W2 - 40} y2={334} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
              {pts.length > 1 && <path d={path} fill="none" stroke="url(#hypeG)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 10px rgba(242,193,78,0.6))" }} />}
              {pts.length > 1 && <circle cx={px(tip)} cy={py(tip)} r={10} fill={tip > 0.55 ? RED : GOLD} />}
            </svg>
            <div style={{ position: "absolute", left: px(0.45) - 70, top: 50, opacity: p01(fr, tr + 10, 8) * (1 - p01(fr, dies, 8)) }}>
              <Chip text="PEAK" gold s={20} />
            </div>
            <div style={{ position: "absolute", left: px(0.92) - 120, top: 220, width: 140, height: 46, opacity: p01(fr, dies + 10, 8) }}>
              <Chip text="DEAD" s={20} />
            </div>
          </Glass>
        ),
      }),
    );
    // what you lose when it dies
    const lo = p01(fr, f(CUE.lost) - 4, 10);
    const b1 = p01(fr, f(CUE.hundred2) - 4, 12);
    const b2 = p01(fr, f(CUE.three2) - 4, 18);
    it.push(
      card(c, "N-loss", {
        p: [0, 215, z - 120],
        w: W2,
        h: 270,
        opacity: O2 * lo,
        children: (
          <Glass gold>
            <div style={{ position: "absolute", left: 34, top: 24 }}>
              <Txt s={22} w={700} ui ls="0.3em" c={MUTED}>WHAT YOU LOSE</Txt>
            </div>
            {[
              { l: "REPLICA", v: "−$100", w: 30, col: GREEN, p: b1 },
              { l: "DESIGNER", v: "−$3,000", w: 430, col: RED, p: b2 },
            ].map((r, i) => (
              <div key={r.l} style={{ position: "absolute", left: 34, right: 34, top: 82 + i * 84, display: "flex", alignItems: "center", gap: 20, opacity: lerp(0.2, 1, r.p) }}>
                <div style={{ width: 170 }}>
                  <Txt s={28} w={800}>{r.l}</Txt>
                </div>
                <div style={{ width: Math.max(14, r.w * io(r.p)), height: 26, borderRadius: 13, background: r.col, boxShadow: `0 0 18px ${r.col}88` }} />
                <Txt s={40} w={800} c={r.col}>{r.v}</Txt>
              </div>
            ))}
          </Glass>
        ),
      }),
    );
  }

  /* ---- 1: the money you keep -------------------------------------------------- */
  const O1 = fade(fr, f(c1.from) - 6, f(L.r1.end + 0.15) + 5, 12, 8);
  if (O1 > 0) {
    const z = Z.R1;
    const kp = f(c1.until) - 2;
    const inv = f(CUE.invest);
    const end = f(CUE.five2) + 18;
    const vals = Array.from({ length: 11 }, (_, y) => 2900 * Math.pow(1.07, y));
    const g = p01(fr, inv, end - inv);
    const kc = pop(fr, kp);
    it.push(
      card(c, "M-keep", {
        p: [0, 790, z],
        w: 720,
        h: 170,
        opacity: O1 * p01(fr, kp, 8),
        noBlur: true,
        children: (
          <Fill gap={2} style={{ transform: `scale(${lerp(0.85, 1, kc)})` }}>
            <Txt s={24} w={700} ui ls="0.3em" c={MUTED}>{fr < inv ? "YOU KEEP" : `INVESTED · YEAR ${Math.min(10, Math.max(1, Math.ceil(io(g) * 10)))}`}</Txt>
            <Txt s={118} w={900} ls="-0.02em" style={goldText}>{money(fr < inv ? 2900 * io(p01(fr, kp, f(CUE.keep) + 8 - kp)) : lerp(2900, vals[10], io(g)))}</Txt>
          </Fill>
        ),
      }),
    );
    const BW = 760;
    it.push(
      card(c, "M-chart", {
        p: [0, 330, z - 60],
        w: BW,
        h: 430,
        opacity: O1 * p01(fr, inv - 6, 10),
        children: (
          <Glass>
            <div style={{ position: "absolute", left: 34, right: 34, bottom: 74, top: 40, display: "flex", alignItems: "flex-end", gap: 12 }}>
              {vals.slice(1).map((v, i) => {
                const on = p01(fr, inv + (i * (end - 20 - inv)) / 10, 10);
                const h = (v / vals[10]) * 260 * io(on);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: "100%", height: h, borderRadius: "10px 10px 4px 4px", background: i === 9 ? "linear-gradient(180deg, #ffe39a, #e2ab3d)" : "linear-gradient(180deg, rgba(242,193,78,0.75), rgba(242,193,78,0.25))", boxShadow: i === 9 && on > 0.9 ? "0 0 26px rgba(242,193,78,0.6)" : undefined }} />
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 34, right: 34, bottom: 40, display: "flex", justifyContent: "space-between" }}>
              <Txt s={20} w={700} ui ls="0.2em" c={MUTED}>YEAR 1</Txt>
              <Txt s={20} w={700} ui ls="0.2em" c={MUTED}>YEAR 10</Txt>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center" }}>
              <Txt s={16} w={600} ui ls="0.08em" c="rgba(246,243,236,0.45)">Illustrative: assumes a 7% average annual return. Not financial advice.</Txt>
            </div>
          </Glass>
        ),
      }),
    );
    it.push(burst(c, "M-burst", { p: [300, 520, z - 30], t: p01(fr, f(CUE.five2) + 4, 28), n: 30, spread: 320 }));
  }

  /* ---- the close: real or fake? -------------------------------------------------- */
  const OE = p01(fr, f(L.r1.end) - 2, 12);
  if (OE > 0) {
    const z = Z.E;
    it.push(...bagOn(c, "E-l", { x: -200, z, op: OE }));
    it.push(...bagOn(c, "E-r", { x: 200, z, op: OE, glint: p01(fr, f(CUE.fakeEnd), 22) }));
    const a = p01(fr, f(L.end.start) - 2, 10);
    const tl = p01(fr, f(CUE.tell) - 3, 10);
    it.push(
      card(c, "E-title", {
        p: [0, 720, z],
        w: 880,
        h: 260,
        opacity: OE,
        noBlur: true,
        children: (
          <Fill gap={18}>
            <div style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>
              <Txt s={108} w={900} ls="-0.02em">
                REAL OR <span style={goldText}>FAKE</span>?
              </Txt>
            </div>
            <div style={{ opacity: tl, transform: `translateY(${(1 - tl) * 14}px)`, display: "flex", alignItems: "center", gap: 16 }}>
              <svg width={46} height={42} viewBox="0 0 46 42">
                <path d="M6 4 H40 Q44 4 44 8 V28 Q44 32 40 32 H20 L10 40 V32 H6 Q2 32 2 28 V8 Q2 4 6 4 Z" fill="none" stroke={GOLD} strokeWidth={3.2} strokeLinejoin="round" />
              </svg>
              <Txt s={40} w={800} ls="0.08em" c={WHITE}>TELL ME IN THE COMMENTS</Txt>
            </div>
          </Fill>
        ),
      }),
    );
    it.push(card(c, "E-cr", { p: [-200, 395, z - 10], w: 170, h: 54, opacity: OE * p01(fr, f(CUE.realEnd) - 3, 8), children: <Chip text="REAL" /> }));
    it.push(card(c, "E-cf", { p: [200, 395, z - 10], w: 170, h: 54, opacity: OE * p01(fr, f(CUE.fakeEnd) - 3, 8), children: <Chip text="FAKE" gold /> }));
  }
  return it;
};

/** "5 Reasons the Fake Beats the Real" — vertical, TikTok-safe, narration-led countdown. */
export const Top5: React.FC = () => {
  const fr = useCurrentFrame();
  setView(VIEW_TT);
  const c = camAt(fr);
  const { roll, speed } = camMotion(fr);
  const items = [floor(c, [], 0.45), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(4, (speed - 34) / 14));
  const breathe = 0.5 + 0.5 * Math.sin(fr / 45);
  return (
    <AbsoluteFill style={{ background: "#08080a", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 55% at 46% 22%, rgba(242,193,78,${0.08 + 0.03 * breathe}) 0%, rgba(242,193,78,0) 60%), radial-gradient(ellipse 120% 70% at 46% 60%, #121216 0%, #08080a 70%)` }} />
      <AbsoluteFill style={{ transform: `rotate(${roll}rad) scale(${1 + Math.abs(roll) * 0.9})`, filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 72% at 46% 42%, transparent 52%, rgba(0,0,0,0.82) 100%)", pointerEvents: "none" }} />
      <ChapterCards />
      <Tracker />
      <PhraseCaptions />
      <div style={{ position: "absolute", left: 0, width: SAFE_CX * 2, top: 1192, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: "0.26em", color: "rgba(246,243,236,0.35)", opacity: p01(fr, f(L.r5.start) + 20, 12) * (1 - p01(fr, f(L.r2.end), 12)) }}>ILLUSTRATIVE PRICES</div>
      <Grain />
      <Audio src={staticFile("voice/top5-narration.wav")} />
    </AbsoluteFill>
  );
};

export const TOP5_FRAMES = TOTAL_FRAMES;
