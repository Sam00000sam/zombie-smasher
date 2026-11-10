import React from "react";
import { AbsoluteFill, Audio, spring, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { LineArt } from "../v2/components/Draw";
import { FONT } from "../v2/theme";
import { io, p01 } from "../v5/smooth";
import { burst, Cam, card, floor, GOLD, GREEN, INK, Item, line3, motes, neon, Panel, pawn, RED, spot, V3, wireBox } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { camAt, camMotion, LOOP_Z, Z } from "./camera";
import { ART } from "./icons";
import { CUE, EMPHASIS, f, L, TOTAL_FRAMES, WORDS } from "./timing";

/* ------------------------------------------------------------------ helpers */
const fade = (fr: number, a: number, b: number, fi = 10, fo = 12) => p01(fr, a, fi) * (1 - p01(fr, b - fo, fo));
const pop = (fr: number, at: number) => spring({ frame: fr - at, fps: 30, config: { damping: 13, stiffness: 170, mass: 0.7 } });
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const T: React.FC<{ s: number; c?: string; w?: number; ls?: string; glow?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, c = INK, w = 700, ls = "0.12em", glow, children, style }) => (
  <div style={{ fontFamily: FONT, fontSize: s, fontWeight: w, letterSpacing: ls, color: c, lineHeight: 1.05, whiteSpace: "nowrap", textShadow: glow ? `0 0 ${s * 0.4}px ${c}` : undefined, ...style }}>{children}</div>
);
const Center: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean }> = ({ children, gap = 6, row }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: row ? "row" : "column", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);
const Art: React.FC<{ kind: string; color: string; size: number; p?: number; width?: number }> = ({ kind, color, size, p = 1, width = 3 }) => (
  <div style={{ position: "relative", width: size, height: size, flex: "none", filter: `drop-shadow(0 0 10px ${color})` }}>
    <LineArt parts={ART[kind]} p={p} x={size / 2} y={size / 2} size={size} width={width} color={color} glow={false} />
  </div>
);
const Check: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ flex: "none" }}>
    <path d="M4 12.5 L10 18.5 L20 6.5" fill="none" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Pill: React.FC<{ text: string; bg: string; fg?: string; s?: number }> = ({ text, bg, fg = "#000", s = 30 }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: s, fontWeight: 800, letterSpacing: "0.14em", boxShadow: `0 0 30px ${bg}` }}>{text}</div>
);
const Chip: React.FC<{ text: string; col: string; s?: number; check?: boolean }> = ({ text, col, s = 26, check }) => (
  <div style={{ position: "absolute", inset: 0, ...neon(col, 0.8), borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
    <T s={s} c={col} ls="0.16em">{text}</T>
    {check && <Check c={col} s={s + 2} />}
  </div>
);
const shine = (fr: number, at: number) => p01(fr, at + 6, 22);

/* ---------------------------------------------------------- A: the opening */
/** "Real or fake?" — the first shot, and (one loop on) the last one. */
const opening = (c: Cam, fr: number, dz: number, op: number, win: number, pulse: number, key: string): (Item | null)[] => {
  const z = Z.A + dz;
  const it: (Item | null)[] = [];
  const dim = lerp(1, 0.4, win);
  it.push(
    card(c, key + "title", {
      p: [0, 850, z],
      w: 760,
      h: 130,
      opacity: op,
      noBlur: true,
      children: (
        <Center row gap={26}>
          <T s={90} w={900} ls="0.04em" glow style={{ opacity: lerp(1, 0.55, win) }}>REAL</T>
          <T s={46} c="rgba(255,255,255,0.6)" ls="0.2em">OR</T>
          <T s={90} w={900} ls="0.04em" c={GOLD} glow style={{ transform: `scale(${1 + 0.1 * pulse})` }}>FAKE?</T>
        </Center>
      ),
    }),
  );
  [
    { x: -215, col: INK, lab: "REAL", o: dim },
    { x: 215, col: GOLD, lab: "FAKE", o: 1 },
  ].forEach((b, i) => {
    it.push(spot(c, `${key}spot${i}`, { p: [b.x, 0, z], r: 170, color: b.col, opacity: op * b.o * (i ? lerp(0.8, 1.3, win) : 0.8) }));
    it.push(wireBox(c, `${key}ped${i}`, { c: [b.x, 40, z], size: [250, 80, 250], color: b.col, opacity: op * b.o * 0.85, width: 2.5 }));
    it.push(
      card(c, `${key}bag${i}`, {
        p: [b.x, 255, z],
        w: 290,
        h: 300,
        opacity: op * b.o,
        reflect: 0.22,
        children: (
          <Center gap={0}>
            <Art kind="handbag" color={b.col} size={240} />
            <T s={30} c={b.col} ls="0.3em" glow>{b.lab}</T>
          </Center>
        ),
      }),
    );
  });
  it.push(card(c, key + "vs", { p: [0, 250, z - 60], w: 150, h: 110, opacity: op * (1 - win), children: <Center><T s={64} w={900} c="rgba(255,255,255,0.85)" style={{ fontStyle: "italic" }}>VS</T></Center> }));
  if (win > 0) {
    const s = pop(fr, f(CUE.win) - 4);
    it.push(card(c, key + "crown", { p: [215, lerp(780, 500, s), z - 10], w: 170, h: 170, opacity: op * Math.min(1, win * 3), children: <Art kind="crown" color={GOLD} size={160} width={4} /> }));
    it.push(burst(c, key + "burst", { p: [215, 470, z + 20], t: p01(fr, f(CUE.win) + 4, 26), n: 30, spread: 320 }));
  }
  return it;
};

/* ================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];

  /* ---- A: hook ----------------------------------------------------------- */
  const aOut = 1 - p01(fr, f(3.3), 9);
  if (aOut > 0) it.push(...opening(c, fr, 0, aOut, p01(fr, f(CUE.win) - 4, 10), 0, "A"));

  /* ---- B: $3,000 vs $100 ------------------------------------------------- */
  const BO = fade(fr, f(3.1), f(8.65), 14, 9);
  if (BO > 0) {
    const z = Z.B;
    const dIn = f(L.price.start) - 2;
    const rIn = f(CUE.good) - 4;
    const rTag = f(CUE.hundred) - 8;
    [
      { x: -205, col: INK, lab: "DESIGNER", at: dIn },
      { x: 205, col: GOLD, lab: "REPLICA", at: rIn },
    ].forEach((b, i) => {
      const o = BO * p01(fr, b.at, 12);
      it.push(spot(c, `B-spot${i}`, { p: [b.x, 0, z], r: 165, color: b.col, opacity: o * 0.9 }));
      it.push(wireBox(c, `B-ped${i}`, { c: [b.x, 40, z], size: [240, 80, 240], color: b.col, opacity: o * 0.85, width: 2.5 }));
      it.push(card(c, `B-bag${i}`, { p: [b.x, 250, z], w: 280, h: 290, opacity: o, reflect: 0.22, children: <Center gap={0}><Art kind={i ? "tote" : "handbag"} color={b.col} size={230} p={p01(fr, b.at, 26)} /><T s={26} c={b.col} ls="0.3em">{b.lab}</T></Center> }));
    });
    // hanging price tags drop in on their strings
    const dT = pop(fr, f(CUE.three) - 8);
    it.push(card(c, "B-tag0", { p: [-205, 590 + (1 - dT) * 420, z], w: 330, h: 170, string: true, opacity: BO * p01(fr, f(CUE.three) - 8, 8), children: <Panel col={RED} shine={shine(fr, f(CUE.three))}><Center gap={2}><T s={22} ls="0.3em">PRICE</T><T s={78} c={RED} glow>{money(3000 * p01(fr, f(CUE.three), f(1.1)))}</T></Center></Panel> }));
    const rT = pop(fr, rTag);
    it.push(card(c, "B-tag1", { p: [205, 590 + (1 - rT) * 420, z], w: 330, h: 170, string: true, opacity: BO * p01(fr, rTag, 8), children: <Panel col={GREEN} shine={shine(fr, rTag)}><Center gap={2}><T s={22} ls="0.3em">PRICE</T><T s={78} c={GREEN} glow>$100</T></Center></Panel> }));
    it.push(burst(c, "B-burst", { p: [205, 590, z + 30], t: p01(fr, rTag + 6, 24), color: GREEN }));
    it.push(card(c, "B-30x", { p: [0, 860, z - 60], w: 420, h: 84, opacity: BO * p01(fr, f(CUE.hundred) + 2, 10), children: <Pill text="30× CHEAPER" bg={GOLD} s={34} /> }));
  }

  /* ---- C: scared to use it, so it sits in the closet ------------------- */
  const CO = fade(fr, f(8.25), f(11.7), 14, 9);
  if (CO > 0) {
    const z = Z.C;
    it.push(spot(c, "C-spot", { p: [0, 0, z], r: 230, color: INK, opacity: CO * 0.7 }));
    it.push(wireBox(c, "C-ward", { c: [0, 400, z], size: [520, 800, 300], color: INK, opacity: CO * 0.8, width: 3 }));
    it.push(line3(c, "C-shelf", { pts: [[-260, 520, z - 150], [260, 520, z - 150]], p: 1, color: INK, width: 2, opacity: CO * 0.5 }));
    const sc = p01(fr, f(CUE.scared), 6) * (1 - p01(fr, f(CUE.scared) + 18, 8));
    const jit = Math.sin(fr * 2.2) * 7 * sc;
    it.push(card(c, "C-bag", { p: [jit, 300, z], w: 260, h: 260, opacity: CO, children: <Center gap={0}><Art kind="handbag" color={INK} size={220} p={p01(fr, f(9.0), 22)} /><T s={22} c={RED} ls="0.2em">$3,000</T></Center> }));
    it.push(card(c, "C-scared", { p: [0, 900, z - 160], w: 470, h: 70, opacity: CO * p01(fr, f(CUE.scared) - 2, 10), children: <Chip text="TOO NICE TO USE" col={RED} /> }));
    // the doors swing shut on "closet"
    const shut = io(p01(fr, f(CUE.closet) - 10, 18));
    const a = lerp(1.25, 0, shut);
    [-1, 1].forEach((sd) => {
      const P = (w: number, y: number): V3 => [sd * (260 - w * Math.cos(a)), y, z - 150 - w * Math.sin(a)];
      it.push(line3(c, `C-door${sd}`, { pts: [P(0, 6), P(258, 6), P(258, 794), P(0, 794), P(0, 6)], p: 1, color: INK, width: 3.5, opacity: CO * 0.95 }));
      it.push(line3(c, `C-knob${sd}`, { pts: [P(225, 360), P(225, 440)], p: 1, color: GOLD, width: 5, opacity: CO }));
    });
    const lk = pop(fr, f(CUE.closet) + 8);
    it.push(card(c, "C-lock", { p: [0, 410, z - 170], w: 170, h: 170, opacity: CO * p01(fr, f(CUE.closet) + 8, 6), children: <div style={{ transform: `scale(${lk})` }}><Art kind="lock" color={RED} size={160} width={5} /></div> }));
    it.push(card(c, "C-used", { p: [0, 120, z - 200], w: 400, h: 70, opacity: CO * p01(fr, f(CUE.sits), 10), children: <Chip text="WORN: 0 TIMES" col={RED} /> }));
  }

  /* ---- D: cost per wear ------------------------------------------------- */
  const DO = fade(fr, f(11.3), f(17.35), 14, 9);
  if (DO > 0) {
    const z = Z.D;
    it.push(card(c, "D-title", { p: [0, 960, z], w: 680, h: 96, opacity: DO * lerp(0.35, 1, p01(fr, f(CUE.cost) - 4, 10)), children: <Center><T s={58} c={GOLD} w={800} ls="0.14em" glow>COST PER WEAR</T></Center> }));
    const n = Math.round(365 * p01(fr, f(CUE.every), f(CUE.year + 0.45) - f(CUE.every)));
    it.push(
      card(c, "D-cal", {
        p: [0, 640, z],
        w: 600,
        h: 450,
        opacity: DO,
        children: (
          <Panel col={GOLD} s={0.7} shine={shine(fr, f(CUE.cost))}>
            <div style={{ position: "absolute", left: 28, right: 28, top: 22, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <T s={24} ls="0.3em">ONE YEAR</T>
              <T s={44} c={GOLD} glow>{n} DAYS</T>
            </div>
            <div style={{ position: "absolute", left: 30, top: 92, display: "grid", gridTemplateColumns: "repeat(21, 20px)", gap: 6 }}>
              {Array.from({ length: 365 }, (_, i) => (
                <div key={i} style={{ width: 20, height: 12, borderRadius: 4, background: i < n ? GOLD : "rgba(255,255,255,0.12)", boxShadow: i < n && i > n - 22 ? `0 0 10px ${GOLD}` : undefined }} />
              ))}
            </div>
          </Panel>
        ),
      }),
    );
    // someone carrying the bag every day
    const wt = p01(fr, f(CUE.carry), f(CUE.less) - f(CUE.carry));
    const wo = DO * p01(fr, f(CUE.carry) - 6, 10) * (1 - p01(fr, f(CUE.less) - 8, 10));
    const wx = lerp(-380, 380, wt);
    const hop = Math.abs(Math.sin(fr / 4)) * 12;
    it.push(pawn(c, "D-pawn", { p: [wx, 0, z - 120], h: 210, opacity: wo, hop }));
    it.push(card(c, "D-pbag", { p: [wx + 80, 85 + hop, z - 130], w: 100, h: 100, opacity: wo, children: <Art kind="handbag" color={GOLD} size={92} /> }));
    // the maths
    const fm = pop(fr, f(CUE.less) - 4);
    it.push(
      card(c, "D-math", {
        p: [0, 210, z - 200],
        w: 560,
        h: 250,
        opacity: DO * p01(fr, f(CUE.less) - 4, 8),
        reflect: 0.18,
        children: (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.85, 1, fm)})` }}>
            <Panel col={GREEN} s={1.2} shine={shine(fr, f(CUE.thirty))}>
              <Center gap={4}>
                <T s={30} ls="0.18em">$100 ÷ 365 WEARS</T>
                <T s={120} w={800} c={GREEN} glow>{"<"}30¢</T>
                <T s={26} ls="0.3em" c={GREEN}>PER WEAR</T>
              </Center>
            </Panel>
          </div>
        ),
      }),
    );
    it.push(burst(c, "D-burst", { p: [0, 230, z - 150], t: p01(fr, f(CUE.thirty), 26), color: GREEN, n: 30, spread: 360 }));
  }

  /* ---- E: concerts, airports, rainy days -------------------------------- */
  const EO = fade(fr, f(16.95), f(22.05), 14, 9);
  if (EO > 0) {
    const z = Z.E;
    const cards = [
      { x: -290, at: f(CUE.concerts), lab: "CONCERTS", kind: "note" },
      { x: 0, at: f(CUE.airports), lab: "AIRPORTS", kind: "plane" },
      { x: 290, at: f(CUE.rainy), lab: "RAINY DAYS", kind: "cloud" },
    ];
    cards.forEach((k, i) => {
      const o = EO * lerp(0.3, 1, p01(fr, k.at - 4, 8));
      const s = pop(fr, k.at - 4);
      const t = fr - k.at;
      it.push(
        card(c, `E-card${i}`, {
          p: [k.x, 560 + (1 - s) * 40, z],
          w: 260,
          h: 330,
          opacity: o,
          reflect: 0.15,
          children: (
            <Panel col={GOLD} s={0.9} shine={shine(fr, k.at - 4)}>
              {i === 0 &&
                [-1, 1].map((sd) => (
                  <div key={sd} style={{ position: "absolute", left: 130 - 30, top: -40, width: 60, height: 300, transformOrigin: "50% 0", transform: `rotate(${sd * (18 + Math.sin(t / 7 + sd) * 14)}deg)`, background: `linear-gradient(${GOLD}66, transparent)`, filter: "blur(6px)" }} />
                ))}
              {i === 2 &&
                Array.from({ length: 14 }, (_, d) => {
                  const y = ((t * 9 + d * 47) % 230) + 120;
                  return <div key={d} style={{ position: "absolute", left: 30 + ((d * 61) % 200), top: y, width: 3, height: 22, borderRadius: 2, background: "#7fd7ff", opacity: 0.8 }} />;
                })}
              <div style={{ position: "absolute", left: 40, top: 34, transform: i === 1 ? `translate(${Math.sin(t / 9) * 10}px, ${-Math.abs(Math.sin(t / 9)) * 6}px) rotate(${Math.sin(t / 9) * 6}deg)` : undefined }}>
                <Art kind={k.kind} color={i === 2 ? INK : GOLD} size={180} p={p01(fr, k.at - 2, 18)} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
                <T s={26} ls="0.16em" c={GOLD}>{k.lab}</T>
              </div>
            </Panel>
          ),
        }),
      );
    });
    // the bag hops from card to card: "it goes everywhere"
    const ev = f(CUE.everywhere) - 4;
    const hopT = p01(fr, ev, f(CUE.zero) - ev + 6);
    const seg = Math.min(1, Math.floor(hopT * 2));
    const u = hopT * 2 - seg;
    const xs = [-290, 0, 290];
    const bo = EO * p01(fr, ev, 6) * (1 - p01(fr, f(CUE.zero) + 2, 8));
    it.push(card(c, "E-bag", { p: [lerp(xs[seg], xs[seg + 1], io(u)), 330 + Math.sin(u * Math.PI) * 140, z - 120], w: 120, h: 120, opacity: bo, children: <Art kind="handbag" color={GOLD} size={110} /> }));
    // zero stress
    const st = p01(fr, f(CUE.zero) - 2, 16);
    it.push(
      card(c, "E-stress", {
        p: [0, 190, z - 150],
        w: 560,
        h: 150,
        opacity: EO * p01(fr, f(CUE.zero) - 6, 8),
        reflect: 0.18,
        children: (
          <Panel col={GREEN} s={1.1} shine={shine(fr, f(CUE.zero))}>
            <div style={{ position: "absolute", left: 30, right: 30, top: 22, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <T s={26} ls="0.3em">STRESS</T>
              <T s={56} c={GREEN} glow>{Math.round(lerp(80, 0, st))}%</T>
            </div>
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, height: 18, borderRadius: 9, border: "2px solid rgba(255,255,255,0.5)" }}>
              <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: `${lerp(80, 1.5, st)}%`, borderRadius: 7, background: lerp(0, 1, st) > 0.6 ? GREEN : RED, boxShadow: `0 0 12px ${GREEN}` }} />
            </div>
          </Panel>
        ),
      }),
    );
  }

  /* ---- F: test a style on the turntable ---------------------------------- */
  const FO = fade(fr, f(21.65), f(28.7), 14, 9);
  if (FO > 0) {
    const z = Z.F;
    const R = 380;
    const A = Math.PI - 2 * Math.PI * (1 - io(p01(fr, f(22.1), f(CUE.try) + 6 - f(22.1))));
    it.push(spot(c, "F-spot", { p: [0, 0, z - R], r: 200, color: GREEN, opacity: FO * p01(fr, f(CUE.try), 14) }));
    ["handbag", "tote", "clutch", "crossbody", "backpack"].forEach((kind, i) => {
      const th = A + (i * 2 * Math.PI) / 5;
      const x = R * Math.sin(th);
      const zz = z + R * Math.cos(th);
      const front = i === 0 ? p01(fr, f(CUE.try), 12) : 0;
      const dimOthers = i === 0 ? 1 : lerp(1, 0.4, p01(fr, f(CUE.try), 12));
      const o = FO * dimOthers;
      it.push(wireBox(c, `F-ped${i}`, { c: [x, 30, zz], size: [170, 60, 170], yaw: th, color: front > 0.5 ? GREEN : GOLD, opacity: o * 0.8, width: 2.5 }));
      it.push(card(c, `F-bag${i}`, { p: [x, 190, zz], w: 220, h: 220, opacity: o, reflect: 0.2, children: <Art kind={kind} color={front > 0.5 ? GREEN : GOLD} size={200} p={p01(fr, f(21.8) + i * 3, 20)} /> }));
    });
    it.push(card(c, "F-title", { p: [0, 900, z], w: 640, h: 96, opacity: FO * p01(fr, f(CUE.test) - 4, 10), children: <Center><T s={58} c={GOLD} w={800} ls="0.14em" glow>TEST A STYLE</T></Center> }));
    const tt = pop(fr, f(CUE.try));
    it.push(card(c, "F-try", { p: [0, 420 + (1 - tt) * 300, z - R], w: 340, h: 116, string: true, opacity: FO * p01(fr, f(CUE.try), 8), children: <Panel col={GREEN} s={1.2} shine={shine(fr, f(CUE.hundred2) - 6)}><Center row gap={14}><T s={30} ls="0.2em">TRY IT</T><T s={60} c={GREEN} glow>{f(CUE.hundred2) - 6 <= fr ? "$100" : "···"}</T></Center></Panel> }));
    it.push(burst(c, "F-burst", { p: [0, 420, z - R + 30], t: p01(fr, f(CUE.hundred2) - 4, 24), color: GREEN }));
    const cm = p01(fr, f(CUE.commit) - 6, 12);
    it.push(
      card(c, "F-commit", {
        p: [0, 700, z + 120],
        w: 520,
        h: 120,
        opacity: FO * cm,
        children: (
          <Panel col={RED} s={0.8}>
            <Center row gap={18}>
              <Art kind="lock" color={RED} size={80} width={4} />
              <T s={30} ls="0.16em">COMMIT</T>
              <T s={56} c={RED} glow>$3,000</T>
            </Center>
          </Panel>
        ),
      }),
    );
  }

  /* ---- G: stolen or lost ------------------------------------------------ */
  const GO = fade(fr, f(28.3), f(33.55), 14, 9);
  if (GO > 0) {
    const z = Z.G;
    const sl = f(CUE.stolen);
    const gone = p01(fr, sl, 12);
    const g2 = gone * gone;
    it.push(spot(c, "G-spot", { p: [0, 0, z], r: 170, color: GOLD, opacity: GO * lerp(1, 0.35, gone) }));
    it.push(wireBox(c, "G-ped", { c: [0, 40, z], size: [250, 80, 250], color: GOLD, opacity: GO * 0.85, width: 2.5 }));
    const bx = 1300 * g2;
    it.push(card(c, "G-bag", { p: [bx, 255 + 120 * g2, z], w: 280, h: 290, opacity: GO * (1 - p01(fr, sl + 10, 4)), reflect: 0.2, children: <Art kind="handbag" color={GOLD} size={240} /> }));
    if (gone > 0 && gone < 1) it.push(line3(c, "G-trail", { pts: [[Math.max(0, bx - 500), 255 + 120 * g2 * 0.6, z], [bx - 120, 255 + 120 * g2, z]], p: 1, color: RED, width: 6, opacity: GO }));
    it.push(card(c, "G-q", { p: [0, 250, z], w: 160, h: 160, opacity: GO * p01(fr, sl + 12, 10) * (1 - p01(fr, f(CUE.out) - 4, 10)), children: <Center><T s={130} w={800} c={GOLD} glow>?</T></Center> }));
    it.push(card(c, "G-stolen", { p: [-200, 640, z - 60], w: 300, h: 70, opacity: GO * p01(fr, sl, 8) * (1 - p01(fr, f(CUE.out) - 6, 10)), children: <Chip text="STOLEN" col={RED} /> }));
    it.push(card(c, "G-lost", { p: [200, 640, z - 60], w: 360, h: 70, opacity: GO * p01(fr, f(CUE.lost), 8) * (1 - p01(fr, f(CUE.out) - 6, 10)), children: <Chip text="LOST ON A TRIP" col={RED} /> }));
    const tr = p01(fr, f(CUE.lost) - 4, 34);
    it.push(card(c, "G-case", { p: [lerp(-700, 700, tr), 830 + Math.sin(tr * Math.PI) * 60, z + 80], w: 160, h: 160, opacity: GO * (tr > 0 && tr < 1 ? 1 : 0), children: <Art kind="suitcase" color={INK} size={150} /> }));
    const ot = pop(fr, f(CUE.out) - 4);
    it.push(
      card(c, "G-out", {
        p: [0, 620, z - 120],
        w: 480,
        h: 190,
        opacity: GO * p01(fr, f(CUE.out) - 4, 8),
        children: (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.85, 1, ot)})` }}>
            <Panel col={GREEN} s={1.2} shine={shine(fr, f(CUE.out))}>
              <Center gap={2}>
                <T s={26} ls="0.3em">YOU'RE OUT</T>
                <T s={100} w={800} c={GREEN} glow>$100</T>
              </Center>
            </Panel>
          </div>
        ),
      }),
    );
    const nt = p01(fr, f(CUE.not) - 4, 10);
    const strike = p01(fr, f(CUE.months) + 4, 12);
    it.push(
      card(c, "G-pay", {
        p: [0, 390, z - 120],
        w: 480,
        h: 110,
        opacity: GO * nt,
        children: (
          <Panel col={RED} s={0.8}>
            <Center>
              <T s={40} c={RED} ls="0.12em">A MONTH'S PAY</T>
            </Center>
            <div style={{ position: "absolute", left: 30, top: "50%", width: `${strike * 88}%`, height: 6, borderRadius: 3, background: RED, boxShadow: `0 0 14px ${RED}`, transform: "rotate(-6deg)" }} />
          </Panel>
        ),
      }),
    );
  }

  /* ---- H: "an investment" ------------------------------------------------- */
  const HO = fade(fr, f(33.15), f(38.75), 14, 9);
  if (HO > 0) {
    const z = Z.H;
    const ax = p01(fr, f(33.2), 16);
    it.push(line3(c, "H-ax", { pts: [[-380, 900, z], [-380, 120, z], [380, 120, z]], p: ax, color: "rgba(255,255,255,0.55)", width: 2, opacity: HO }));
    // "you paid" level
    for (let i = 0; i < 13; i++) {
      const x0 = -380 + i * 60;
      it.push(line3(c, `H-dash${i}`, { pts: [[x0, 460, z], [x0 + 32, 460, z]], p: p01(fr, f(33.3) + i, 6), color: INK, width: 3, opacity: HO * 0.7 }));
    }
    it.push(card(c, "H-paid", { p: [-215, 505, z], w: 300, h: 56, opacity: HO * p01(fr, f(33.5), 10), children: <Center><T s={24} ls="0.2em">YOU PAID $3,000</T></Center> }));
    const up: V3[] = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return [-380 + t * 760, 460 + 380 * Math.pow(t, 1.3) + Math.sin(t * 22) * 22 * t, z];
    });
    const down: V3[] = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return [-380 + t * 760, 460 - 300 * Math.pow(t, 0.8) + Math.sin(t * 19) * 16 * t, z];
    });
    const inv = f(CUE.investment) - 6;
    const rs = f(CUE.resell) - 4;
    it.push(line3(c, "H-up", { pts: up, p: p01(fr, inv, 24), color: GOLD, width: 6, opacity: HO * lerp(1, 0.3, p01(fr, rs, 10)), dot: fr < rs }));
    it.push(card(c, "H-inv", { p: [210, 900, z], w: 380, h: 70, opacity: HO * p01(fr, inv + 14, 10) * lerp(1, 0.35, p01(fr, rs, 10)), children: <Center><T s={40} c={GOLD} ls="0.12em" glow>"INVESTMENT"</T></Center> }));
    it.push(line3(c, "H-down", { pts: down, p: p01(fr, rs, 26), color: RED, width: 7, opacity: HO, dot: true }));
    it.push(card(c, "H-resale", { p: [250, 100, z - 10], w: 260, h: 60, opacity: HO * p01(fr, rs + 20, 10), children: <Center><T s={30} c={RED} ls="0.2em" glow>RESALE ↓</T></Center> }));
    it.push(card(c, "H-less", { p: [0, 1010, z - 80], w: 520, h: 80, opacity: HO * p01(fr, f(CUE.less2) - 4, 10), children: <Pill text="LESS THAN YOU PAID" bg={RED} fg="#fff" s={30} /> }));
  }

  /* ---- I: nobody sees the receipt ---------------------------------------- */
  const IO = fade(fr, f(38.35), f(43.4), 14, 9);
  if (IO > 0) {
    const z = Z.I;
    const nb = p01(fr, f(CUE.nobody) - 2, 12);
    it.push(
      card(c, "I-rec", {
        p: [-200, 620, z - 100],
        w: 300,
        h: 380,
        yaw: nb * 0.5,
        opacity: IO * lerp(1, 0.35, nb),
        children: (
          <Panel col={INK} s={0.6}>
            <div style={{ position: "absolute", left: 28, top: 26, right: 28 }}>
              <T s={24} ls="0.3em">RECEIPT</T>
              {["BAG", "TAX", "SHIPPING"].map((r, i) => (
                <div key={r} style={{ display: "flex", justifyContent: "space-between", marginTop: 22, opacity: 0.75 }}>
                  <T s={20} ls="0.16em">{r}</T>
                  <T s={20}>{["$88", "$7", "$5"][i]}</T>
                </div>
              ))}
              <div style={{ height: 2, background: "rgba(255,255,255,0.4)", margin: "26px 0 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <T s={24} ls="0.2em">TOTAL</T>
                <T s={40} c={GOLD}>$100</T>
              </div>
            </div>
          </Panel>
        ),
      }),
    );
    const es = pop(fr, f(CUE.nobody));
    it.push(card(c, "I-eye", { p: [-200, 620, z - 140], w: 220, h: 220, opacity: IO * p01(fr, f(CUE.nobody), 6), children: <div style={{ transform: `scale(${es})`, position: "relative", width: 210, height: 210 }}><div style={{ position: "absolute", inset: 0 }}><Art kind="eye" color={RED} size={210} width={5} /></div><div style={{ position: "absolute", inset: 0 }}><Art kind="slash" color={RED} size={210} width={7} p={p01(fr, f(CUE.nobody) + 4, 8)} /></div></div> }));
    // the person carrying it, lit up, with eyes on them
    const sp = p01(fr, f(CUE.see) - 8, 14);
    it.push(spot(c, "I-spot", { p: [170, 0, z], r: 190, color: GOLD, opacity: IO * lerp(0.15, 1.2, sp) }));
    const hop = Math.abs(Math.sin(fr / 5)) * 8 * sp;
    it.push(pawn(c, "I-hero", { p: [170, 0, z], h: 300, opacity: IO, hop }));
    it.push(card(c, "I-bag", { p: [270, 120 + hop, z - 10], w: 130, h: 130, opacity: IO, children: <Art kind="handbag" color={GOLD} size={120} width={4} /> }));
    it.push(burst(c, "I-burst", { p: [270, 140, z - 30], t: p01(fr, f(CUE.carry2), 26), n: 26, spread: 240 }));
    [-430, -180, 380, 560].forEach((x, i) => {
      const o = IO * 0.45 * p01(fr, f(CUE.see) - 12 + i * 3, 12);
      it.push(pawn(c, `I-p${i}`, { p: [x, 0, z + 520], h: 190, opacity: o, tie: false }));
      it.push(card(c, `I-pe${i}`, { p: [x, 260, z + 520], w: 90, h: 90, opacity: o * 1.6, children: <Art kind="eye" color={GOLD} size={84} width={3} /> }));
    });
  }

  /* ---- J: keep the look, keep the money ---------------------------------- */
  const JO = fade(fr, f(43.0), f(45.85), 14, 9);
  if (JO > 0) {
    const z = Z.J;
    const k1 = pop(fr, f(CUE.keep) - 4);
    const k2 = pop(fr, f(CUE.money) - 8);
    it.push(card(c, "J-look", { p: [0, 680, z], w: 620, h: 170, opacity: JO * lerp(0.3, 1, p01(fr, f(CUE.keep) - 4, 8)), reflect: 0.12, children: <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.8, 1, k1)})` }}><Panel col={GOLD} s={1.1} shine={shine(fr, f(CUE.keep))}><Center row gap={22}><Art kind="handbag" color={GOLD} size={120} /><T s={48} c={GOLD} w={800} glow>KEEP THE LOOK</T><Check c={GOLD} s={48} /></Center></Panel></div> }));
    it.push(card(c, "J-money", { p: [0, 450, z], w: 620, h: 170, opacity: JO * lerp(0.3, 1, p01(fr, f(CUE.money) - 8, 8)), reflect: 0.12, children: <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.8, 1, k2)})` }}><Panel col={GREEN} s={1.1} shine={shine(fr, f(CUE.money) - 4)}><Center row gap={22}><div style={{ width: 96, height: 96, borderRadius: "50%", border: `5px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${GREEN}` }}><T s={60} c={GREEN} w={800}>$</T></div><T s={48} c={GREEN} w={800} glow>KEEP THE MONEY</T><Check c={GREEN} s={48} /></Center></Panel></div> }));
    for (let i = 0; i < 9; i++) {
      const t = p01(fr, f(CUE.money) - 4 + i * 3, 22);
      if (t <= 0 || t >= 1) continue;
      const x = -300 + ((i * 137) % 600);
      it.push(card(c, `J-coin${i}`, { p: [x, lerp(1100, 150, t * t), z - 160 + (i % 3) * 60], w: 64, h: 64, yaw: t * 6 + i, opacity: JO * Math.min(1, t * 6) * (1 - t * t), children: <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: "#000", boxShadow: `0 0 18px ${GOLD}` }}>$</div> }));
    }
  }

  /* ---- back to the start (one loop on), so the video loops -------------- */
  const loopIn = p01(fr, f(45.55), 14);
  if (loopIn > 0) {
    const pulse = Math.sin(Math.PI * p01(fr, f(CUE.pick) - 2, 18));
    it.push(...opening(c, fr, LOOP_Z, loopIn, 0, pulse, "L"));
  }
  return it;
};

/** "Real or Fake?" — vertical neon-3D explainer, narration-led, loops seamlessly. */
export const RealOrFake: React.FC = () => {
  const fr = useCurrentFrame();
  const c = camAt(fr);
  const { roll, speed } = camMotion(fr);
  const items = [floor(c, [[0, 380, Z.F], [0, 300, Z.I]]), ...motes(c, fr, LOOP_Z, TOTAL_FRAMES), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(3.5, (speed - 38) / 16));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 42%, #0e0e14 0%, #000 72%)" }} />
      <AbsoluteFill style={{ transform: `rotate(${roll}rad) scale(${1 + Math.abs(roll) * 0.9})`, filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: "0.26em", color: "rgba(255,255,255,0.45)", opacity: p01(fr, f(4.2), 14) * (1 - p01(fr, f(CUE.speechEnd) - 30, 14)) }}>ILLUSTRATIVE PRICES</div>
      <Audio src={staticFile("voice/realorfake-narration.wav")} />
    </AbsoluteFill>
  );
};

export const REALFAKE_FRAMES = TOTAL_FRAMES;
