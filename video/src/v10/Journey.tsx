import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { LineArt } from "../v2/components/Draw";
import { FONT } from "../v2/theme";
import { io, p01 } from "../v5/smooth";
import { burst, Cam, camSeg, card, floor, GOLD, GREEN, INK, Item, line3, motes, neon, pawn, RED, setView, spot, V3, W, H, wireBox } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { ART } from "../v7/icons";
import { camAt, camMotion, EX, EZ, FLIGHTS, rigAt, RX, RZ, Z } from "./camera";
import { CUE, EMPHASIS, f, L, TOTAL_FRAMES, WORDS } from "./timing";

/* TikTok-safe lens: clear of the side buttons and the caption overlay. */
const SAFE_CX = 500;
const VIEW_TT = { f: 1010, cx: SAFE_CX, cy: 770 };
const ORANGE = "#ff9f43";

/* motion rules: one easing, fade + small settle, draw-on line art, stations fade out together */
const inn = (fr: number, at: number, d = 12) => p01(fr, at, d);
const settle = (a: number, from = 0.92) => `scale(${lerp(from, 1, a)})`;
const station = (fr: number, a: number, b: number) => p01(fr, a, 12) * (1 - p01(fr, b - 8, 8));
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ ui bits */
const T: React.FC<{ s: number; c?: string; w?: number; ls?: string; glow?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, c = INK, w = 800, ls = "0.1em", glow, children, style }) => (
  <div style={{ fontFamily: FONT, fontSize: s, fontWeight: w, letterSpacing: ls, color: c, lineHeight: 1.05, whiteSpace: "nowrap", textShadow: glow ? `0 0 ${s * 0.35}px ${c}` : undefined, ...style }}>{children}</div>
);
const Center: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean; style?: React.CSSProperties }> = ({ children, gap = 6, row, style }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: row ? "row" : "column", alignItems: "center", justifyContent: "center", gap, ...style }}>{children}</div>
);
const Art: React.FC<{ kind: string; color: string; size: number; p?: number; width?: number }> = ({ kind, color, size, p = 1, width = 3 }) => (
  <div style={{ position: "relative", width: size, height: size, flex: "none", filter: `drop-shadow(0 0 10px ${color})` }}>
    <LineArt parts={ART[kind]} p={p} x={size / 2} y={size / 2} size={size} width={width} color={color} glow={false} />
  </div>
);
const Chip: React.FC<{ text: string; col: string; s?: number; solid?: boolean; strike?: number }> = ({ text, col, s = 22, solid, strike = 0 }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...(solid ? { background: col, boxShadow: `0 0 24px ${col}` } : neon(col, 0.8)), borderRadius: 999 }}>
    <div style={{ position: "relative" }}>
      <T s={s} c={solid ? "#000" : col} ls="0.16em" style={{ paddingLeft: "0.16em" }}>{text}</T>
      {strike > 0 && <div style={{ position: "absolute", left: -8, top: "50%", height: 4, width: `calc(${strike * 100}% + 16px)`, background: RED, borderRadius: 2, boxShadow: `0 0 10px ${RED}` }} />}
    </div>
  </div>
);
const Box: React.FC<{ col: string; s?: number; children?: React.ReactNode }> = ({ col, s = 1, children }) => <div style={{ position: "absolute", inset: 0, ...neon(col, s) }}>{children}</div>;
const Star: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 8px ${c})` }}>
    <path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z" fill="none" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------- set pieces */
/** A conveyor belt along z: two rails, rollers, and chevrons that run while the bag moves. */
const belt = (c: Cam, key: string, o: { x: number; z0: number; z1: number; col: string; run: number; opacity: number }): Item | null => {
  if (o.opacity <= 0.001) return null;
  const els: React.ReactNode[] = [];
  let n = 0;
  const seg = (a: V3, b: V3, col: string, w: number, op: number) => {
    const s = camSeg(c, a, b);
    if (!s) return;
    const zNear = Math.min(s[0].z, s[1].z);
    const fadeD = Math.max(0, Math.min(1, 1.3 - s[0].z / 4500)) * Math.max(0, Math.min(1, (zNear - 420) / 380));
    if (fadeD <= 0) return;
    els.push(<line key={n++} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke={col} strokeOpacity={op * fadeD} strokeWidth={w} strokeLinecap="round" />);
  };
  const zMin = Math.max(o.z0, c.z - 5200);
  const zMax = Math.min(o.z1, c.z + 5200);
  if (zMax <= zMin) return null;
  for (let z = zMin; z < zMax; z += 300) {
    const z2 = Math.min(zMax, z + 300);
    seg([o.x - 120, 34, z], [o.x - 120, 34, z2], o.col, 3, 0.9);
    seg([o.x + 120, 34, z], [o.x + 120, 34, z2], o.col, 3, 0.9);
  }
  const r0 = Math.ceil(zMin / 110) * 110;
  for (let z = r0; z < zMax; z += 110) seg([o.x - 116, 30, z], [o.x + 116, 30, z], "#ffffff", 1.5, 0.22);
  // chevrons drift forward with the belt
  const off = (o.run * 90) % 220;
  for (let z = Math.floor(zMin / 220) * 220 + off; z < zMax; z += 220) {
    seg([o.x - 50, 36, z - 30], [o.x, 36, z], o.col, 2.5, 0.55);
    seg([o.x, 36, z], [o.x + 50, 36, z - 30], o.col, 2.5, 0.55);
  }
  return { z: 1e8, node: <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o.opacity, filter: `drop-shadow(0 0 6px ${o.col})` }}>{els}</svg> };
};

/** Marble-floor tiles: a lit square of floor grid around a point. */
const tiles = (c: Cam, key: string, o: { x: number; z: number; half: number; step: number; opacity: number }): Item | null => {
  if (o.opacity <= 0.001) return null;
  const els: React.ReactNode[] = [];
  let n = 0;
  for (let v = -o.half; v <= o.half + 1; v += o.step) {
    const a = camSeg(c, [o.x + v, 1, o.z - o.half], [o.x + v, 1, o.z + o.half]);
    const b = camSeg(c, [o.x - o.half, 1, o.z + v], [o.x + o.half, 1, o.z + v]);
    [a, b].forEach((s) => {
      if (s) els.push(<line key={n++} x1={s[0].x} y1={s[0].y} x2={s[1].x} y2={s[1].y} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.4} />);
    });
  }
  return { z: 9e7, node: <svg key={key} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o.opacity, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}>{els}</svg> };
};

/** Neon building sign. */
const sign = (c: Cam, key: string, p: V3, text: string, op: number, col = GOLD, w = 480): Item | null =>
  card(c, key, { p, w, h: 100, opacity: op, children: <Box col={col} s={1.1}><Center><T s={54} c={col} w={900} ls="0.22em" glow style={{ paddingLeft: "0.22em" }}>{text}</T></Center></Box> });

/** The price tag that hangs over a bag. */
const tag = (c: Cam, key: string, p: V3, value: number, op: number, col: string, label = "PRICE"): Item | null =>
  card(c, key, {
    p,
    w: 300,
    h: 130,
    string: true,
    opacity: op,
    children: (
      <Box col={col}>
        <Center gap={2}>
          <T s={20} ls="0.3em">{label}</T>
          <T s={66} c={col} glow>{money(value)}</T>
        </Center>
      </Box>
    ),
  });

/** "+$900 LOGO": appears beside the tag and drifts up as it fades. */
const delta = (c: Cam, key: string, p: V3, text: string, col: string, fr: number, at: number): Item | null => {
  const t = (fr - at) / 50;
  if (t < 0 || t > 1) return null;
  const a = Math.min(1, t * 6) * (1 - p01(fr, at + 34, 16));
  return card(c, key, { p: [p[0], p[1] + io(Math.min(1, t * 1.4)) * 70, p[2]], w: 300, h: 60, opacity: a, noBlur: true, children: <Chip text={text} col={col} s={24} solid /> });
};

/* ---------------------------------------------------------- price stages */
const STAGES = [
  { at: CUE.three300, from: 0, to: 300 },
  { at: CUE.jumps, from: 300, to: 1200 },
  { at: CUE.add, from: 1200, to: 1800 },
  { at: CUE.another, from: 1800, to: 3000 },
];
const priceAt = (fr: number) => {
  let v = 0;
  for (const s of STAGES) if (fr >= f(s.at)) v = lerp(s.from, s.to, p01(fr, f(s.at), 18));
  return v;
};
const priceCol = (v: number) => (v < 600 ? GREEN : v < 2400 ? GOLD : RED);

/** Where the hero bag is on the main conveyor: on each leg it moves in lock-step with the camera's
 *  own progress, so it holds steady on screen (a tracking shot) while the world streams past. */
const LEGS = [FLIGHTS.lo, FLIGHTS.ad, FLIGHTS.st, FLIGHTS.yo];
const STOPS = [Z.FA, Z.LO, Z.AD, Z.ST, Z.YO];
const legP = (fr: number, i: number) => {
  const a = f(LEGS[i][0]);
  const b = f(LEGS[i][1]);
  if (fr <= a) return 0;
  if (fr >= b) return 1;
  const cs = rigAt(a).tz;
  const ce = rigAt(b).tz;
  return Math.max(0, Math.min(1, (rigAt(fr).tz - cs) / (ce - cs)));
};
const heroZ = (fr: number) => {
  let z = STOPS[0];
  LEGS.forEach((_, i) => {
    z = lerp(z, STOPS[i + 1], legP(fr, i));
  });
  return z;
};
const heroRun = (fr: number) => LEGS.reduce((acc, _, i) => acc + legP(fr, i) * 15, 0);

/* ===================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];

  /* ---- hook: the finished $3,000 bag ---------------------------------------- */
  const HO = 1 - p01(fr, f(FLIGHTS.fa[0]) - 2, 8);
  if (HO > 0) {
    const z = Z.HK;
    it.push(spot(c, "H-sp", { p: [0, 0, z], r: 180, color: INK, opacity: HO * 0.85 }));
    it.push(wireBox(c, "H-pd", { c: [0, 40, z], size: [260, 80, 260], color: INK, opacity: HO * 0.85, width: 2.5 }));
    it.push(card(c, "H-bag", { p: [0, 250, z], w: 300, h: 300, opacity: HO, reflect: 0.2, children: <Center><Art kind="handbag" color={INK} size={250} p={p01(fr, 0, 20)} /></Center> }));
    const ht = inn(fr, f(1.14) - 5);
    it.push(tag(c, "H-tag", [0, 540 + (1 - ht) * 60, z], 3000, HO * ht, RED));
    const fm = inn(fr, f(2.6));
    it.push(card(c, "H-follow", { p: [0, 800, z], w: 760, h: 120, opacity: HO * fm, noBlur: true, children: <Center style={{ transform: settle(fm) }}><T s={64} w={900} ls="0.04em" c={GOLD} glow>FOLLOW THE MONEY</T></Center> }));
    it.push(line3(c, "H-path", { pts: [[0, 2, z + 150], [0, 2, Z.FA - 700]], p: p01(fr, f(3.0), 30), color: GOLD, width: 3, opacity: HO * 0.8, dot: true }));
  }

  /* ---- the main conveyor + hero bag ------------------------------------------- */
  const beltO = p01(fr, f(FLIGHTS.fa[0]), 14) * (1 - p01(fr, f(FLIGHTS.end[0]), 14));
  it.push(belt(c, "belt", { x: 0, z0: Z.FA - 700, z1: Z.YO + 300, col: GOLD, run: heroRun(fr), opacity: beltO }));
  const handoff = p01(fr, f(CUE.reaches) - 4, 18);
  const heroO = p01(fr, f(L.factory.start) - 6, 12) * (1 - p01(fr, f(FLIGHTS.rep[1]) + 6, 10));
  if (heroO > 0) {
    const zb = heroZ(fr);
    const stamped = p01(fr, f(CUE.stamps) + 4, 6);
    const sc = lerp(1, 0.5, handoff);
    const bx = lerp(0, -112, io(handoff));
    const by = lerp(200, 112, io(handoff));
    const v = priceAt(fr);
    it.push(
      card(c, "hero", {
        p: [bx, by, zb],
        w: 270 * sc,
        h: 280 * sc,
        opacity: heroO,
        reflect: 0.18 * (1 - handoff),
        children: (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
            <div style={{ position: "relative", width: 270, height: 280 }}>
              <div style={{ position: "absolute", left: 10, top: 10 }}>
                <Art kind="handbag" color={INK} size={250} p={p01(fr, f(CUE.leather) - 2, f(CUE.labour + 0.4) - f(CUE.leather))} />
              </div>
              {stamped > 0 && (
                <div style={{ position: "absolute", left: 107, top: 150, opacity: stamped, transform: settle(stamped, 1.6) }}>
                  <Art kind="crest" color={GOLD} size={56} width={2.5} />
                </div>
              )}
            </div>
          </div>
        ),
      }),
    );
    const tagO = heroO * inn(fr, f(CUE.three300) - 8) * (1 - handoff);
    it.push(tag(c, "hero-tag", [0, 500, zb], v, tagO, priceCol(v)));
    // the deltas as each markup lands
    it.push(delta(c, "d-logo", [190, 650, zb - 40], "+$900 LOGO", GOLD, fr, f(CUE.jumps)));
    it.push(delta(c, "d-ads", [215, 395, zb - 60], "+$600 ADS", ORANGE, fr, f(CUE.add)));
    it.push(delta(c, "d-store", [0, 690, zb - 60], "+$1,200 STORE", RED, fr, f(CUE.another)));
  }

  /* ---- 1: factory ---------------------------------------------------------------- */
  const FO = station(fr, f(FLIGHTS.fa[0]) - 4, f(FLIGHTS.lo[0]) + 3);
  if (FO > 0) {
    const z = Z.FA;
    it.push(sign(c, "F-sign", [0, 990, z + 320], "FACTORY", FO));
    it.push(wireBox(c, "F-m1", { c: [-310, 170, z], size: [150, 340, 180], color: INK, opacity: FO * 0.8, width: 2.5 }));
    it.push(wireBox(c, "F-m1b", { c: [-310, 250, z - 90], size: [90, 60, 4], color: GREEN, opacity: FO * 0.8, width: 2 }));
    it.push(wireBox(c, "F-m2", { c: [310, 130, z], size: [150, 260, 180], color: INK, opacity: FO * 0.8, width: 2.5 }));
    // a robot arm working over the belt
    const a = Math.sin(fr / 14) * 0.25;
    const j1: V3 = [310, 260, z];
    const j2: V3 = [190 + Math.sin(a) * 40, 470 + Math.cos(a) * 20, z];
    const j3: V3 = [100 + Math.sin(a * 2) * 50, 360 + Math.cos(a) * 30, z];
    it.push(line3(c, "F-arm", { pts: [j1, j2, j3], p: 1, color: GOLD, width: 6, opacity: FO * 0.9, dot: true }));
    // gauge lights blinking on the left machine
    [0, 1, 2].forEach((i) => {
      const on = Math.floor(fr / 9 + i) % 3 === 0;
      it.push(card(c, `F-l${i}`, { p: [-310 + (i - 1) * 34, 330, z - 92], w: 20, h: 20, opacity: FO * (on ? 1 : 0.3), children: <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: i === 1 ? RED : GREEN, boxShadow: `0 0 12px ${i === 1 ? RED : GREEN}` }} /> }));
    });
    // two workers at the back
    it.push(pawn(c, "F-w1", { p: [-180, 0, z + 330], h: 170, opacity: FO * 0.55, tie: false }));
    it.push(pawn(c, "F-w2", { p: [190, 0, z + 330], h: 170, opacity: FO * 0.55, tie: false }));
    // what the bag is made of
    [
      { t: "LEATHER  $150", at: f(CUE.leather), p: [-240, 640, z - 60] as V3 },
      { t: "HARDWARE  $60", at: f(CUE.hardware), p: [240, 640, z - 60] as V3 },
      { t: "LABOUR  $90", at: f(CUE.labour), p: [0, 720, z - 60] as V3 },
    ].forEach((m, i) => {
      const a2 = inn(fr, m.at - 3);
      it.push(card(c, `F-mat${i}`, { p: m.p, w: 300, h: 56, opacity: FO * a2, children: <div style={{ position: "absolute", inset: 0, transform: settle(a2) }}><Chip text={m.t} col={GREEN} s={22} /></div> }));
    });
  }

  /* ---- 2: the logo press -------------------------------------------------------- */
  const LO = station(fr, f(FLIGHTS.lo[0]) - 4, f(FLIGHTS.ad[0]) + 3);
  if (LO > 0) {
    const z = Z.LO;
    // wall of crests behind
    for (let r = 0; r < 3; r++)
      for (let q = 0; q < 5; q++)
        it.push(card(c, `B-wall${r}${q}`, { p: [-360 + q * 180, 360 + r * 170, z + 380], w: 110, h: 110, opacity: LO * 0.22, children: <Art kind="crest" color={GOLD} size={100} width={2} /> }));
    it.push(sign(c, "B-sign", [0, 940, z + 260], "BRAND", LO));
    const st = f(CUE.stamps);
    const down = p01(fr, st - 6, 7) * (1 - p01(fr, st + 6, 14));
    const yh = lerp(600, 372, down);
    it.push(wireBox(c, "B-postL", { c: [-175, 340, z], size: [26, 680, 26], color: INK, opacity: LO * 0.8, width: 2 }));
    it.push(wireBox(c, "B-postR", { c: [175, 340, z], size: [26, 680, 26], color: INK, opacity: LO * 0.8, width: 2 }));
    it.push(wireBox(c, "B-beam", { c: [0, 690, z], size: [380, 30, 60], color: INK, opacity: LO * 0.8, width: 2 }));
    it.push(line3(c, "B-rod", { pts: [[0, 675, z], [0, yh + 30, z]], p: 1, color: INK, width: 3, opacity: LO * 0.8 }));
    it.push(wireBox(c, "B-head", { c: [0, yh, z], size: [220, 56, 150], color: GOLD, opacity: LO, width: 3 }));
    it.push(burst(c, "B-burst", { p: [0, 345, z - 40], t: p01(fr, st + 1, 24), n: 26, spread: 260 }));
    const lg = inn(fr, f(CUE.logo) - 2);
    it.push(card(c, "B-tm", { p: [-300, 560, z - 60], w: 190, h: 56, opacity: LO * lg, children: <div style={{ position: "absolute", inset: 0, transform: settle(lg) }}><Chip text="LOGO ™" col={GOLD} s={22} /></div> }));
  }

  /* ---- 3: marketing ---------------------------------------------------------------- */
  const AO = station(fr, f(FLIGHTS.ad[0]) - 4, f(FLIGHTS.st[0]) + 3);
  if (AO > 0) {
    const z = Z.AD;
    const ce = inn(fr, f(CUE.celebrities) - 3);
    const bb = inn(fr, f(CUE.billboards) - 3);
    const mg = inn(fr, f(CUE.magazine) - 3);
    // billboard on a pole: the celebrity
    it.push(line3(c, "A-pole1", { pts: [[-300, 0, z + 120], [-300, 470, z + 120]], p: ce, color: INK, width: 3, opacity: AO * 0.8 }));
    it.push(card(c, "A-celeb", { p: [-300, 560, z + 120], w: 260, h: 180, opacity: AO * ce, children: <Box col={GOLD}><Center row gap={14} style={{ transform: settle(ce) }}><Star s={66} c={GOLD} /><div><T s={22} ls="0.16em">FACE OF</T><T s={30} c={GOLD} glow>THE BRAND</T></div></Center></Box> }));
    // camera flashes around the celebrity
    [0, 1, 2, 3].forEach((i) => {
      const t0 = f(CUE.celebrities) + 2 + i * 7;
      it.push(burst(c, `A-flash${i}`, { p: [-300 + (i % 2 ? 110 : -110), 560 + (i < 2 ? 70 : -70), z + 100], t: p01(fr, t0, 10), color: "#ffffff", n: 10, spread: 70 }));
    });
    // the big billboard
    it.push(line3(c, "A-pole2", { pts: [[-120, 0, z + 300], [-120, 690, z + 300]], p: bb, color: INK, width: 3, opacity: AO * 0.7 }));
    it.push(line3(c, "A-pole3", { pts: [[120, 0, z + 300], [120, 690, z + 300]], p: bb, color: INK, width: 3, opacity: AO * 0.7 }));
    it.push(card(c, "A-bill", { p: [0, 800, z + 300], w: 420, h: 190, opacity: AO * bb, children: <Box col={ORANGE} s={1.1}><Center row gap={18} style={{ transform: settle(bb) }}><Art kind="handbag" color={ORANGE} size={110} p={bb} /><div><T s={24} ls="0.24em">THE</T><T s={44} c={ORANGE} glow>NEW SEASON</T></div></Center></Box> }));
    // magazine cover
    it.push(card(c, "A-mag", { p: [265, 520, z + 60], w: 200, h: 270, opacity: AO * mg, children: <Box col={INK} s={0.8}><div style={{ position: "absolute", left: 18, right: 18, top: 16, transform: settle(mg) }}><T s={30} w={900} ls="0.12em">MAGAZINE</T><div style={{ height: 2, background: "rgba(255,255,255,0.5)", margin: "8px 0 10px" }} /><Art kind="handbag" color={GOLD} size={150} p={mg} /><T s={16} ls="0.2em" style={{ marginTop: 6 }}>IT BAG OF THE YEAR</T></div></Box> }));
  }

  /* ---- 4: the store ---------------------------------------------------------------- */
  const SO = station(fr, f(FLIGHTS.st[0]) - 4, f(FLIGHTS.yo[0]) + 3);
  if (SO > 0) {
    const z = Z.ST;
    const arch: V3[] = [[-310, 0, z], [-310, 600, z], ...Array.from({ length: 13 }, (_, i) => [lerp(-310, 310, i / 12), 600 + Math.sin((i / 12) * Math.PI) * 120, z] as V3), [310, 600, z], [310, 0, z]];
    it.push(line3(c, "S-arch", { pts: arch, p: p01(fr, f(FLIGHTS.st[0]), 24), color: INK, width: 3.5, opacity: SO }));
    const awn: V3[] = Array.from({ length: 17 }, (_, i) => [lerp(-330, 330, i / 16), i % 2 ? 560 : 520, z - 40] as V3);
    it.push(line3(c, "S-awn", { pts: awn, p: p01(fr, f(FLIGHTS.st[0]) + 8, 20), color: GOLD, width: 3, opacity: SO }));
    it.push(sign(c, "S-sign", [0, 830, z + 5], "STORE", SO, GOLD, 400));
    it.push(tiles(c, "S-tiles", { x: 0, z: z - 120, half: 380, step: 95, opacity: SO * lerp(0.25, 0.9, inn(fr, f(CUE.marble) - 3)) }));
    const rent = inn(fr, f(CUE.prime) - 3);
    it.push(card(c, "S-rent", { p: [235, 470, z - 160], w: 210, h: 116, opacity: SO * rent, children: <Box col={GREEN}><Center gap={2} style={{ transform: settle(rent) }}><T s={18} ls="0.24em">PRIME RENT</T><T s={46} c={GREEN} glow>$$$</T></Center></Box> }));
    const g = inn(fr, f(CUE.guy) - 3);
    it.push(spot(c, "S-dsp", { p: [-250, 0, z - 230], r: 120, color: GOLD, opacity: SO * g }));
    it.push(pawn(c, "S-door", { p: [-250, 0, z - 230], h: 240, opacity: SO * lerp(0.35, 1, g) }));
  }

  /* ---- 5: you -------------------------------------------------------------------------- */
  const YO = station(fr, f(FLIGHTS.yo[0]) - 4, f(FLIGHTS.rep[0]) + 10);
  if (YO > 0) {
    const z = Z.YO;
    it.push(spot(c, "Y-sp", { p: [-200, 0, z], r: 170, color: INK, opacity: YO * 0.8 }));
    it.push(pawn(c, "Y-you", { p: [-200, 0, z], h: 270, opacity: YO }));
    it.push(card(c, "Y-lbl", { p: [-200, 330, z - 10], w: 150, h: 54, opacity: YO * inn(fr, f(CUE.reaches)), children: <Chip text="YOU" col={INK} s={24} /> }));
    const rows = [
      { l: "MATERIALS", v: 300, col: GREEN },
      { l: "LOGO", v: 900, col: GOLD },
      { l: "ADS", v: 600, col: ORANGE },
      { l: "STORE", v: 1200, col: RED },
    ];
    const r0 = f(CUE.reaches) + 4;
    const every = inn(fr, f(CUE.every) - 2);
    it.push(
      card(c, "Y-rec", {
        p: [215, 480, z - 40],
        w: 340,
        h: 430,
        opacity: YO * inn(fr, r0 - 4),
        children: (
          <Box col={INK} s={0.6}>
            <div style={{ position: "absolute", left: 26, right: 26, top: 22 }}>
              <T s={22} ls="0.3em">RECEIPT</T>
              {rows.map((r, i) => {
                const a = inn(fr, r0 + i * 6, 10);
                const hot = r.l === "ADS" ? every : 0;
                return (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, opacity: a, padding: "4px 8px", margin: "16px -8px 0", borderRadius: 8, border: `2px solid rgba(255,74,90,${hot})`, boxShadow: hot > 0.5 ? `0 0 14px ${RED}` : undefined }}>
                    <T s={22} ls="0.14em" c={r.col}>{r.l}</T>
                    <T s={28}>{money(r.v)}</T>
                  </div>
                );
              })}
              <div style={{ height: 2, background: "rgba(255,255,255,0.4)", margin: "18px 0 12px", opacity: inn(fr, f(CUE.three3000) - 4) }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: inn(fr, f(CUE.three3000) - 4) }}>
                <T s={24} ls="0.2em">TOTAL</T>
                <T s={50} c={RED} glow>$3,000</T>
              </div>
            </div>
          </Box>
        ),
      }),
    );
  }

  /* ---- the replica lane (filmed side-on: screen-right is -z, depth is +x) ---------------- */
  const RO = p01(fr, f(FLIGHTS.rep[0]), 14) * (1 - p01(fr, f(FLIGHTS.end[0]) - 3, 8));
  if (RO > 0) {
    /** side-on layout: sx = screen offset, d = depth (+ further away), around a point at z = base */
    const S = (sx: number, y: number, d: number, base: number): V3 => [RX + d, y, base - sx];
    const ship = p01(fr, f(FLIGHTS.ship[0]) + 2, f(FLIGHTS.ship[1]) - f(FLIGHTS.ship[0]));
    const gone = 1 - ship;
    it.push(belt(c, "rbelt", { x: RX, z0: RZ.FA - 700, z1: RZ.YO + 500, col: GREEN, run: ship * 15, opacity: RO }));
    it.push(sign(c, "R-sign", S(0, 1010, 420, RZ.FA), "REPLICA", RO * gone, GREEN, 460));
    it.push(wireBox(c, "R-m", { c: S(-310, 140, 260, RZ.FA), size: [160, 280, 140], color: INK, opacity: RO * 0.8 * gone, width: 2.5 }));
    const ch = inn(fr, f(CUE.cheaper) - 3);
    it.push(card(c, "R-cheap", { p: S(0, 700, -60, RZ.FA), w: 400, h: 56, opacity: RO * ch * gone, children: <div style={{ position: "absolute", inset: 0, transform: settle(ch) }}><Chip text="CHEAPER MATERIALS" col={GREEN} s={22} /></div> }));
    [
      { t: "LOGO TAX", at: f(CUE.no1), x: -255 },
      { t: "BILLBOARDS", at: f(CUE.no2), x: 0 },
      { t: "MARBLE", at: f(CUE.no3), x: 255 },
    ].forEach((n, i) => {
      const a = inn(fr, n.at - 3);
      it.push(card(c, `R-no${i}`, { p: S(n.x, 610, -60, RZ.FA), w: 230, h: 54, opacity: RO * a * gone, children: <div style={{ position: "absolute", inset: 0, transform: settle(a) }}><Chip text={n.t} col={RED} s={20} strike={p01(fr, n.at + 4, 10)} /></div> }));
    });
    // the bag rides with the camera's target as it ships, then goes into the customer's hand
    const rz = rigAt(fr).tx > RX - 5 ? Math.max(RZ.FA, Math.min(RZ.YO, rigAt(fr).tz)) : RZ.FA;
    const hand = p01(fr, f(FLIGHTS.ship[1]) - 2, 16);
    const sc = lerp(1, 0.5, hand);
    const bp = S(lerp(0, -108, io(hand)), lerp(200, 112, io(hand)), lerp(0, -160, io(hand)), rz);
    it.push(card(c, "R-bag", { p: bp, w: 270 * sc, h: 280 * sc, opacity: RO * inn(fr, f(CUE.similar) - 4), reflect: 0.18 * (1 - hand), children: <div style={{ position: "absolute", inset: 0, transform: `scale(${sc})`, transformOrigin: "0 0" }}><div style={{ position: "relative", left: 10, top: 10 }}><Art kind="handbag" color={GOLD} size={250} p={p01(fr, f(CUE.similar) - 2, 22)} /></div></div> }));
    if (ship > 0 && ship < 1) it.push(line3(c, "R-streak", { pts: [[RX, 120, Math.max(RZ.FA, rz - 600)], [RX, 120, rz - 150]], p: 1, color: GREEN, width: 5, opacity: RO * Math.sin(ship * Math.PI) }));
    const you = S(-200, 0, -150, RZ.YO);
    it.push(spot(c, "R-ysp", { p: you, r: 160, color: GREEN, opacity: RO * 0.8 }));
    it.push(pawn(c, "R-you", { p: you, h: 270, opacity: RO }));
    it.push(card(c, "R-lbl", { p: S(-200, 330, -160, RZ.YO), w: 150, h: 54, opacity: RO * inn(fr, f(FLIGHTS.ship[1])), children: <Chip text="YOU" col={INK} s={24} /> }));
    const hn = inn(fr, f(CUE.hundred100) - 6);
    it.push(tag(c, "R-tag", S(70, 520, 0, RZ.YO), 100, RO * hn, GREEN));
    it.push(card(c, "R-direct", { p: S(250, 250, -80, RZ.YO), w: 240, h: 54, opacity: RO * inn(fr, f(FLIGHTS.ship[1]) + 2), children: <Chip text="DIRECT TO YOU" col={GREEN} s={18} solid /> }));
    it.push(burst(c, "R-burst", { p: S(70, 520, -30, RZ.YO), t: p01(fr, f(CUE.hundred100), 24), color: GREEN }));
  }

  /* ---- the end: same look, different journey --------------------------------------- */
  const EO = p01(fr, f(FLIGHTS.end[0]) - 2, 14);
  if (EO > 0) {
    const z = EZ;
    const sides = [
      { x: EX - 220, col: INK, price: 3000, pc: RED, crest: true },
      { x: EX + 220, col: GOLD, price: 100, pc: GREEN, crest: false },
    ];
    sides.forEach((s, i) => {
      it.push(spot(c, `E-sp${i}`, { p: [s.x, 0, z], r: 170, color: s.col, opacity: EO * 0.8 }));
      it.push(pawn(c, `E-p${i}`, { p: [s.x, 0, z], h: 270, opacity: EO }));
      it.push(card(c, `E-b${i}`, { p: [s.x + 92, 112, z - 12], w: 130, h: 130, opacity: EO, children: <div style={{ position: "relative" }}><Art kind="handbag" color={s.col} size={124} p={p01(fr, f(FLIGHTS.end[0]), 20)} />{s.crest && <div style={{ position: "absolute", left: 50, top: 74 }}><Art kind="crest" color={GOLD} size={26} width={2} /></div>}</div> }));
      it.push(tag(c, `E-t${i}`, [s.x, 470, z], s.price, EO * inn(fr, f(FLIGHTS.end[1]) + i * 5), s.pc));
    });
    const sm = inn(fr, f(CUE.same) - 3);
    it.push(card(c, "E-same", { p: [EX, 250, z - 60], w: 240, h: 54, opacity: EO * sm, children: <div style={{ position: "absolute", inset: 0, transform: settle(sm) }}><Chip text="SAME LOOK" col={INK} s={20} /></div> }));
    // everything you never see, rising behind the $3,000 one
    [
      { k: "crest", l: "LOGO", col: GOLD },
      { k: "megaphone", l: "ADS", col: ORANGE },
      { k: "store", l: "STORE", col: RED },
    ].forEach((g, i) => {
      const a = inn(fr, f(CUE.difference) + i * 7, 16);
      it.push(card(c, `E-g${i}`, { p: [EX - 220 + (i - 1) * 140, 650 + (1 - a) * -60, z + 160], w: 150, h: 170, opacity: EO * a * 0.85, children: <Center gap={2}><Art kind={g.k} color={g.col} size={116} p={a} /><T s={20} c={g.col} ls="0.2em">{g.l}</T></Center> }));
    });
    const q = inn(fr, f(CUE.so) - 3);
    it.push(card(c, "E-q", { p: [EX, 880, z + 40], w: 900, h: 110, opacity: EO * q, noBlur: true, children: <Center style={{ transform: settle(q) }}><T s={48} w={900} ls="0.02em">WHICH ONE ARE YOU <span style={{ color: GOLD, textShadow: `0 0 22px ${GOLD}` }}>PAYING</span> FOR?</T></Center> }));
  }
  return it;
};

/* -------------------------------------------------------------- ledger HUD */
/** The running breakdown of the $3,000 (top of the safe area), then the replica's sliver beside it. */
const Ledger: React.FC<{ fr: number }> = ({ fr }) => {
  const show = p01(fr, f(L.factory.start), 12) * (1 - p01(fr, f(L.end.start) + 10, 12));
  if (show <= 0) return null;
  const segs = [
    { l: "MATERIALS", v: 300, col: GREEN, at: f(CUE.three300) },
    { l: "LOGO", v: 900, col: GOLD, at: f(CUE.jumps) },
    { l: "ADS", v: 600, col: ORANGE, at: f(CUE.add) },
    { l: "STORE", v: 1200, col: RED, at: f(CUE.another) },
  ];
  const WD = 700;
  const rep = p01(fr, f(L.replica.start), 12);
  const repFill = p01(fr, f(CUE.hundred100) - 4, 14);
  const stop = [
    { t: "STOP 1 · FACTORY", a: L.factory.start, b: L.logo.start },
    { t: "STOP 2 · BRAND", a: L.logo.start, b: L.ads.start },
    { t: "STOP 3 · MARKETING", a: L.ads.start, b: L.store.start },
    { t: "STOP 4 · STORE", a: L.store.start, b: L.you.start },
    { t: "STOP 5 · YOU", a: L.you.start, b: L.replica.start },
    { t: "THE REPLICA", a: L.replica.start, b: 99 },
  ];
  return (
    <div style={{ position: "absolute", top: 178, left: SAFE_CX - WD / 2, width: WD, opacity: show, fontFamily: FONT }}>
      <div style={{ position: "relative", height: 30 }}>
        {stop.map((s) => {
          const o = p01(fr, f(s.a), 8) * (1 - p01(fr, f(s.b), 8));
          return o > 0 ? (
            <div key={s.t} style={{ position: "absolute", inset: 0, textAlign: "center", opacity: o, fontSize: 22, fontWeight: 800, letterSpacing: "0.26em", color: GOLD, textShadow: `0 0 12px ${GOLD}` }}>{s.t}</div>
          ) : null;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
        <div style={{ width: 96, fontSize: 16, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.75)" }}>REAL</div>
        <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", display: "flex", overflow: "hidden" }}>
          {segs.map((s) => (
            <div key={s.l} style={{ width: `${(s.v / 3000) * 100 * p01(fr, s.at, 16)}%`, height: "100%", background: s.col, boxShadow: `0 0 10px ${s.col}` }} />
          ))}
        </div>
        <div style={{ width: 90, textAlign: "right", fontSize: 20, fontWeight: 800, color: priceCol(priceAt(fr)) }}>{money(priceAt(fr))}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, opacity: rep }}>
        <div style={{ width: 96, fontSize: 16, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.75)" }}>REPLICA</div>
        <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${(100 / 3000) * 100 * repFill}%`, minWidth: repFill > 0 ? 8 : 0, height: "100%", background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
        </div>
        <div style={{ width: 90, textAlign: "right", fontSize: 20, fontWeight: 800, color: GREEN, opacity: repFill }}>$100</div>
      </div>
    </div>
  );
};

/** "Follow the Money": where a $3,000 bag's price comes from, versus the replica's direct route. */
export const Journey: React.FC = () => {
  const fr = useCurrentFrame();
  setView({ ...VIEW_TT, billboard: true });
  const c = camAt(fr);
  const { roll, speed } = camMotion(fr);
  const items = [floor(c, [], 1, true), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(2, (speed - 40) / 20));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 46% 40%, #0e0e14 0%, #000 72%)" }} />
      <AbsoluteFill style={{ transform: `rotate(${roll}rad) scale(${1 + Math.abs(roll) * 0.9})`, filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 46% 41%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
      <Ledger fr={fr} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} top={1255} cx={SAFE_CX} smooth />
      <div style={{ position: "absolute", left: 0, width: SAFE_CX * 2, top: 1222, textAlign: "center", fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: "0.26em", color: "rgba(255,255,255,0.4)", opacity: p01(fr, f(L.factory.start), 12) * (1 - p01(fr, f(L.end.start), 12)) }}>ILLUSTRATIVE FIGURES</div>
      <Audio src={staticFile("voice/journey-narration.wav")} />
    </AbsoluteFill>
  );
};

export const JOURNEY_FRAMES = TOTAL_FRAMES;
