import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { LineArt } from "../v2/components/Draw";
import { io, p01 } from "../v5/smooth";
import { P } from "../v5/products";
import { CUE, f } from "../v5/timing";
import { camAt, LOOP_Z } from "./camera";
import { card, Cam, floor, GOLD, GREEN, INK, Item, line3, motes, neon, pawn, RED, V3, wireBox } from "./engine";
import { WordCaptions } from "./WordCaptions";
import { FONT } from "../v2/theme";

/* ---------------------------------------------------------------- helpers */
const fade = (fr: number, a: number, b: number, fi = 10, fo = 12) => p01(fr, a, fi) * (1 - p01(fr, b - fo, fo));
const T: React.FC<{ s: number; c?: string; w?: number; ls?: string; children: React.ReactNode; glow?: boolean; style?: React.CSSProperties }> = ({ s, c = INK, w = 700, ls = "0.12em", children, glow, style }) => (
  <div style={{ fontFamily: FONT, fontSize: s, fontWeight: w, letterSpacing: ls, color: c, lineHeight: 1.05, whiteSpace: "nowrap", textShadow: glow ? `0 0 ${s * 0.4}px ${c}` : undefined, ...style }}>{children}</div>
);
const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 6 }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);
const Bag: React.FC<{ kind?: string; color: string; size: number; p: number }> = ({ kind = "handbag", color, size, p }) => (
  <div style={{ position: "relative", width: size, height: size, filter: `drop-shadow(0 0 10px ${color})` }}>
    <LineArt parts={P[kind]} p={p} x={size / 2} y={size / 2} size={size} width={3} color={color} glow={false} />
  </div>
);
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const Pill: React.FC<{ text: string; bg: string; fg?: string; s?: number }> = ({ text, bg, fg = "#000", s = 30 }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: s, fontWeight: 800, letterSpacing: "0.14em", boxShadow: `0 0 30px ${bg}` }}>{text}</div>
);
const Check: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M4 12.5 L10 18.5 L20 6.5" fill="none" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* stations along the camera path */
const ZA = 1200;
const ZB = 3000;
const ZC = 4800;
const ZD = 6600;
const ZE = 8400;
const ZF = 10200;
const ZG = 12000;
const ZH = 13800;

/** The opening price tag (also the final frame, one station on, so the video loops). */
const openingTag = (c: Cam, fr: number, dz: number, op: number, strike: number, ninety: number, key: string): (Item | null)[] => [
  card(c, key + "tag", {
    p: [0, 560, ZA + dz],
    w: 440,
    h: 240,
    string: true,
    opacity: op,
    children: (
      <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}>
        <Center gap={2}>
          <T s={24} ls="0.3em">LUXURY PRICE</T>
          <div style={{ position: "relative" }}>
            <T s={104} c={GOLD} glow>$1,200</T>
            {strike > 0 && <div style={{ position: "absolute", left: -10, top: "50%", width: `calc(${strike * 100}% + 20px)`, height: 8, borderRadius: 4, background: RED, transform: "rotate(-8deg)", transformOrigin: "0 50%", boxShadow: `0 0 16px ${RED}` }} />}
          </div>
        </Center>
      </div>
    ),
  }),
  card(c, key + "90", {
    p: [0, 330, ZA + dz - 50],
    w: 340,
    h: 150,
    opacity: op * ninety,
    children: (
      <Center>
        <T s={130} c={GREEN} w={800} glow style={{ transform: `scale(${0.8 + 0.2 * ninety})` }}>$90</T>
      </Center>
    ),
  }),
];

/* =================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];

  /* ---- A: hook -------------------------------------------------------- */
  const tagOut = 1 - p01(fr, f(1.25), 12);
  it.push(...openingTag(c, fr, 0, tagOut, p01(fr, f(0.5), 9), p01(fr, f(0.8), 10), "A"));
  it.push(
    card(c, "A-title", {
      p: [0, 800, ZA + 60],
      w: 700,
      h: 80,
      opacity: fade(fr, f(0.3), f(4.3), 14, 14),
      noBlur: true,
      children: (
        <Center>
          <T s={50} c={GOLD} ls="0.24em" glow>UNPOPULAR OPINION</T>
        </Center>
      ),
    }),
  );
  const bagsO = fade(fr, f(1.4), f(4.5), 14, 14);
  const smart = p01(fr, f(CUE.smarter) - 3, 12);
  [
    { x: -220, col: INK, lab: "REAL", at: f(1.45), dim: lerp(1, 0.5, smart) },
    { x: 220, col: GOLD, lab: "FAKE", at: f(CUE.sometimes) + 6, dim: 1 },
  ].forEach((b, i) => {
    it.push(wireBox(c, `A-ped${i}`, { c: [b.x, 30, ZA + 100], size: [270, 60, 270], color: b.col, opacity: bagsO * p01(fr, b.at, 14) * b.dim * 0.8, width: 2.5 }));
    it.push(
      card(c, `A-bag${i}`, {
        p: [b.x, 210, ZA + 100],
        w: 300,
        h: 300,
        opacity: bagsO * p01(fr, b.at, 10) * b.dim,
        children: (
          <Center gap={0}>
            <Bag color={b.col} size={250} p={p01(fr, b.at, 26)} />
            <T s={28} c={b.col} ls="0.3em">{b.lab}</T>
          </Center>
        ),
      }),
    );
  });
  it.push(card(c, "A-smart", { p: [220, 430, ZA + 100], w: 300, h: 64, opacity: bagsO * smart, children: <Pill text="SMARTER BUY" bg={GOLD} s={28} /> }));

  /* ---- B: price tower, copy, same -------------------------------------- */
  const bIn = f(4.3);
  const bOut = f(18.75);
  const lux = f(CUE.luxury);
  const take = f(CUE.copy);
  const good = f(CUE.good) - 4;
  const BO = fade(fr, bIn, bOut, 16, 16);
  if (BO > 0) {
    it.push(wireBox(c, "B-ped0", { c: [-250, 30, ZB], size: [270, 60, 270], color: INK, opacity: BO * 0.7, width: 2.5 }));
    it.push(card(c, "B-gen", { p: [-250, 220, ZB], w: 300, h: 300, opacity: BO, children: <Center gap={0}><Bag color={INK} size={250} p={p01(fr, bIn + 6, 26)} /><T s={26} ls="0.3em">GENUINE</T></Center> }));
    it.push(
      card(c, "B-tag", {
        p: [-250, 570, ZB],
        w: 340,
        h: 180,
        string: true,
        opacity: BO * p01(fr, lux - 6, 12),
        children: (
          <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}>
            <Center gap={2}>
              <T s={22} ls="0.3em">LUXURY PRICE</T>
              <T s={76} c={GOLD} glow>{money(1200 * p01(fr, lux, 26))}</T>
            </Center>
          </div>
        ),
      }),
    );
    // stack of what the price pays for
    const blocks = [
      { lab: "PRODUCT", amt: 90, h: 70, col: GREEN, at: f(CUE.product) },
      { lab: "LOGO", amt: 520, h: 170, col: GOLD, at: f(CUE.logo) },
      { lab: "ADS", amt: 280, h: 120, col: GOLD, at: f(CUE.ads) },
      { lab: "STORE", amt: 310, h: 140, col: GOLD, at: f(CUE.store) },
    ];
    let base = 0;
    blocks.forEach((b, i) => {
      const cy = base + b.h / 2;
      base += b.h + 4;
      const inP = p01(fr, b.at - 6, 16);
      const away = i > 0 ? p01(fr, take + (i - 1) * 4, 22) : p01(fr, good - 6, 14);
      const op = BO * inP * (1 - away);
      if (op <= 0) return;
      const fly = i > 0 ? io(away) : 0;
      const cx = 250 + fly * 700;
      const y = cy + (1 - inP) * 500 + fly * 300;
      const col = fly > 0.05 ? RED : b.col;
      it.push(wireBox(c, `B-blk${i}`, { c: [cx, y, ZB], size: [300, b.h, 220], yaw: fly * 1.2, color: col, opacity: op, width: 3 }));
      it.push(
        card(c, `B-lab${i}`, {
          p: [cx, y, ZB - 112],
          w: 290,
          h: Math.min(b.h - 12, 64),
          yaw: fly * 1.2,
          opacity: op,
          children: (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
              <T s={26} c={col} ls="0.18em">{b.lab}</T>
              <T s={30} c={INK}>{money(b.amt)}</T>
            </div>
          ),
        }),
      );
    });
    it.push(card(c, "B-total", { p: [250, 590, ZB], w: 340, h: 120, opacity: BO * fade(fr, f(CUE.store) + 8, take + 6, 12, 10), children: <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}><Center gap={0}><T s={22} ls="0.3em">TOTAL</T><T s={62} c={GOLD} glow>$1,200</T></Center></div> }));
    // the good copy
    const cp = p01(fr, good, 14);
    it.push(wireBox(c, "B-ped1", { c: [250, 30, ZB], size: [270, 60, 270], color: GOLD, opacity: BO * cp * 0.8, width: 2.5 }));
    it.push(card(c, "B-copy", { p: [250, 220, ZB], w: 300, h: 300, opacity: BO * cp, children: <Center gap={0}><Bag color={GOLD} size={250} p={p01(fr, good, 26)} /><T s={26} c={GOLD} ls="0.3em">GOOD COPY</T></Center> }));
    it.push(card(c, "B-ctag", { p: [250, 570, ZB], w: 300, h: 180, string: true, opacity: BO * p01(fr, good + 4, 12), children: <div style={{ position: "absolute", inset: 0, ...neon(GREEN) }}><Center gap={2}><T s={22} ls="0.3em">COPY PRICE</T><T s={76} c={GREEN} glow>$90</T></Center></div> }));
    it.push(card(c, "B-approx", { p: [0, 250, ZB - 60], w: 240, h: 170, opacity: BO * p01(fr, f(CUE.look), 14), children: <Center gap={4}><T s={96} w={300} glow>≈</T><T s={20} ls="0.24em">ALMOST IDENTICAL</T></Center> }));
    // fraction bars → same chips
    const frac = f(CUE.fraction);
    it.push(
      card(c, "B-bars", {
        p: [0, 110, ZB - 300],
        w: 640,
        h: 130,
        opacity: BO * fade(fr, frac - 6, f(CUE.same) + 2, 12, 12),
        children: (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "0 10px" }}>
            {[
              { l: "GENUINE", v: 1200, w: 420, col: INK },
              { l: "COPY", v: 90, w: 32, col: GOLD },
            ].map((b, i) => (
              <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 120, textAlign: "right" }}>
                  <T s={22} ls="0.2em" c={b.col}>{b.l}</T>
                </div>
                <div style={{ width: b.w * p01(fr, frac + i * 6, 22), height: 16, borderRadius: 8, background: b.col, boxShadow: `0 0 16px ${b.col}` }} />
                <T s={30} c={b.col}>{money(b.v)}</T>
              </div>
            ))}
          </div>
        ),
      }),
    );
    [
      { t: "SAME SHAPE", y: 160, at: f(CUE.shape) },
      { t: "SAME COLOUR", y: 95, at: f(CUE.colour) },
      { t: "SAME EVERYDAY USE", y: 30, at: f(CUE.everyday) },
    ].forEach((s, i) => {
      const op = BO * p01(fr, s.at - 5, 12);
      it.push(
        card(c, `B-same${i}`, {
          p: [0, s.y, ZB - 320],
          w: 460,
          h: 54,
          opacity: op,
          children: (
            <div style={{ position: "absolute", inset: 0, ...neon(GOLD, 0.8), borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <T s={26} c={GOLD} ls="0.16em">{s.t}</T>
              <Check c={GOLD} s={28} />
            </div>
          ),
        }),
      );
    });
  }

  /* ---- C: nobody notices --------------------------------------------- */
  const CO = fade(fr, f(18.5), f(25.6), 16, 16);
  if (CO > 0) {
    const walk = f(CUE.walk);
    const passEnd = f(CUE.stitching) + 6;
    it.push(pawn(c, "C-main", { p: [0, 0, ZC], h: 240, opacity: CO }));
    it.push(card(c, "C-bag", { p: [120, 95, ZC - 10], w: 120, h: 120, opacity: CO, children: <Bag color={GOLD} size={110} p={p01(fr, f(18.9), 22)} /> }));
    for (let i = 0; i < 7; i++) {
      const st = walk - 30 + i * 21;
      if (fr < st) continue;
      const x = 1100 - (fr - st) * 16;
      if (x < -1100) continue;
      const edge = Math.min(1, (1100 - x) / 200, (x + 1100) / 200);
      it.push(pawn(c, `C-p${i}`, { p: [x, Math.abs(Math.sin((fr - st) / 4.5)) * 6, ZC + 450], h: 170, opacity: CO * 0.6 * edge }));
    }
    it.push(card(c, "C-pass", { p: [-210, 650, ZC + 120], w: 340, h: 160, opacity: CO * p01(fr, walk - 6, 12), children: <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}><Center gap={0}><T s={22} ls="0.24em">PEOPLE PASSED</T><T s={80} c={GOLD} glow>{Math.round(100 * p01(fr, walk, passEnd - walk))}</T></Center></div> }));
    const nob = p01(fr, f(CUE.nobody), 12);
    it.push(card(c, "C-noticed", { p: [210, 650, ZC + 120], w: 340, h: 160, opacity: CO * p01(fr, f(CUE.noticeWord) - 6, 12), children: <div style={{ position: "absolute", inset: 0, ...neon(GREEN, 1 + nob) }}><Center gap={0}><T s={22} ls="0.24em">NOTICED</T><T s={80} c={GREEN} glow>0</T></Center></div> }));
    const st = p01(fr, f(CUE.nobody) + 6, 16);
    it.push(line3(c, "C-line", { pts: [[150, 100, ZC - 12], [260, 150, ZC - 40]], p: st, color: RED, width: 3, opacity: CO }));
    it.push(card(c, "C-stitch", { p: [260, 190, ZC - 40], w: 420, h: 62, opacity: CO * st, children: <div style={{ position: "absolute", inset: 0, ...neon(RED) }}><Center><T s={24} c={RED} ls="0.16em">STITCHING · NOT CHECKED</T></Center></div> }));
  }

  /* ---- D: trends, rent, next season ----------------------------------- */
  const DO = fade(fr, f(25.0), f(31.4), 16, 16);
  if (DO > 0) {
    const t0 = f(CUE.trend);
    const rentAt = f(CUE.rent) - 10;
    const chartO = DO * (1 - p01(fr, rentAt - 4, 14));
    const hype = (t: number) => 40 + 480 * (t < 0.42 ? Math.pow(t / 0.42, 1.8) : Math.max(0.06, 1 - Math.pow((t - 0.42) / 0.5, 0.7))) * 0.95;
    const pts: V3[] = Array.from({ length: 41 }, (_, i) => [-360 + (i / 40) * 720, hype(i / 40), ZD + 150]);
    it.push(line3(c, "D-ax1", { pts: [[-380, 560, ZD + 150], [-380, 20, ZD + 150], [380, 20, ZD + 150]], p: p01(fr, t0 - 10, 14), color: "rgba(255,255,255,0.5)", width: 2, opacity: chartO }));
    it.push(line3(c, "D-curve", { pts, p: p01(fr, t0, f(1.6)), color: GOLD, width: 6, opacity: chartO, dot: true }));
    it.push(card(c, "D-trend", { p: [-250, 640, ZD + 150], w: 300, h: 70, opacity: chartO * p01(fr, t0, 12), children: <Center><T s={40} c={GOLD} ls="0.24em" glow>TREND</T></Center> }));
    it.push(card(c, "D-hype", { p: [-60, 600, ZD + 150], w: 200, h: 50, opacity: chartO * p01(fr, t0 + 22, 12), children: <Center><T s={24} ls="0.24em">HYPE</T></Center> }));
    it.push(card(c, "D-out", { p: [330, 110, ZD + 150], w: 160, h: 50, opacity: chartO * p01(fr, t0 + 44, 12), children: <Center><T s={24} c={RED} ls="0.24em">OUT</T></Center> }));
    const rO = DO * p01(fr, rentAt - 4, 14) * (1 - p01(fr, f(CUE.stop) - 4, 14));
    it.push(card(c, "D-rent", { p: [-200, 380, ZD - 50], w: 300, h: 320, opacity: rO, children: <div style={{ position: "absolute", inset: 0, ...neon(INK, 0.7) }}><Center gap={6}><T s={22} ls="0.3em">RENT</T><Bag kind="house" color={INK} size={150} p={p01(fr, rentAt + 4, 22)} /><T s={52}>$1,200</T></Center></div> }));
    it.push(card(c, "D-eq", { p: [0, 380, ZD - 50], w: 100, h: 100, opacity: rO * p01(fr, rentAt + 8, 10), children: <Center><T s={90} w={300} glow>=</T></Center> }));
    it.push(card(c, "D-bagc", { p: [200, 380, ZD - 50], w: 300, h: 320, opacity: rO, children: <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}><Center gap={6}><T s={22} ls="0.3em">ONE BAG</T><div style={{ width: 150, height: 150 }} /><T s={52} c={GOLD} glow>$1,200</T></Center></div> }));
    // the bag itself, which then drops into next season's box
    const stop = f(CUE.stop);
    const toBox = p01(fr, stop, 24);
    const bx = lerp(200, 0, toBox);
    const by = lerp(395, 110, io(toBox));
    it.push(card(c, "D-bag", { p: [bx, by, ZD - 60], w: 160, h: 160, opacity: DO * p01(fr, rentAt + 4, 12) * (1 - p01(fr, f(CUE.season) + 2, 8)), children: <Bag color={GOLD} size={150} p={p01(fr, rentAt + 6, 22)} /> }));
    const boxO = DO * p01(fr, stop - 4, 14);
    it.push(wireBox(c, "D-box", { c: [0, 75, ZD - 40], size: [320, 150, 240], color: GOLD, opacity: boxO }));
    const lid = p01(fr, f(CUE.season), 14);
    it.push(line3(c, "D-lid", { pts: [[-160, 150, ZD - 160], [160, 150 + (1 - lid) * 230, ZD - 160]], p: 1, color: GOLD, width: 4, opacity: boxO }));
    it.push(card(c, "D-lab", { p: [0, 75, ZD - 162], w: 300, h: 56, opacity: boxO, children: <Center><T s={26} c={GOLD} ls="0.24em" glow>NEXT SEASON</T></Center> }));
  }

  /* ---- E: no pressure ------------------------------------------------- */
  const EO = fade(fr, f(30.9), f(38.2), 16, 16);
  if (EO > 0) {
    const pr = f(CUE.pressure);
    const sc = f(CUE.scuff);
    const sp = f(CUE.spill);
    const bus = f(CUE.leave);
    const dis = f(CUE.disaster);
    [
      { x: -230, col: INK, lab: "REAL", fill: 0.92, mc: RED, ml: "HIGH" },
      { x: 230, col: GOLD, lab: "CHEAPER", fill: 0.14, mc: GREEN, ml: "LOW" },
    ].forEach((b, i) => {
      it.push(wireBox(c, `E-ped${i}`, { c: [b.x, 30, ZE], size: [270, 60, 270], color: b.col, opacity: EO * 0.7, width: 2.5 }));
      it.push(card(c, `E-bag${i}`, { p: [b.x, 220, ZE], w: 300, h: 300, opacity: EO * (i ? 1 : 0.75), children: <Center gap={0}><Bag color={b.col} size={250} p={p01(fr, f(31.3) + i * 6, 26)} /><T s={26} c={b.col} ls="0.3em">{b.lab}</T></Center> }));
      it.push(
        card(c, `E-meter${i}`, {
          p: [b.x, 520, ZE],
          w: 340,
          h: 96,
          opacity: EO * p01(fr, pr - 8 + i * 4, 12),
          children: (
            <div style={{ position: "absolute", inset: 0, ...neon(b.mc, 0.7), padding: "14px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <T s={22} ls="0.24em">WORRY</T>
                <T s={22} c={b.mc} ls="0.24em">{b.ml}</T>
              </div>
              <div style={{ marginTop: 12, height: 16, borderRadius: 8, border: "2px solid rgba(255,255,255,0.6)", position: "relative" }}>
                <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, width: `calc(${b.fill * 100 * p01(fr, pr - 4, 24)}% - 4px)`, borderRadius: 6, background: b.mc, boxShadow: `0 0 12px ${b.mc}` }} />
              </div>
            </div>
          ),
        }),
      );
    });
    // scuffs, a spill and a bus
    it.push(card(c, "E-scuff", { p: [205, 235, ZE - 12], w: 120, h: 60, opacity: EO * p01(fr, sc, 8), children: <svg width={120} height={60}>{[0, 1, 2].map((k) => <line key={k} x1={20 + k * 26} y1={48} x2={40 + k * 26} y2={14} stroke={RED} strokeWidth={5} strokeLinecap="round" />)}</svg> }));
    const dT = p01(fr, sp - 4, 12);
    it.push(card(c, "E-drop", { p: [270, lerp(720, 330, dT), ZE - 14], w: 50, h: 64, opacity: EO * (dT > 0 && dT < 1 ? 1 : 0), children: <svg width={50} height={64} viewBox="0 0 30 40"><path d="M15 2 C15 2 4 18 4 26 A11 11 0 0 0 26 26 C26 18 15 2 15 2 Z" fill="#7fd7ff" /></svg> }));
    const bx = lerp(1100, 470, io(p01(fr, bus - 8, 34)));
    it.push(card(c, "E-bus", { p: [bx, 90, ZE - 260], w: 240, h: 170, opacity: EO * p01(fr, bus - 8, 10), children: <Bag kind="bus" color={GOLD} size={230} p={p01(fr, bus - 6, 22)} /> }));
    [
      { t: "SCUFFED", at: sc, y: 830 },
      { t: "SPILLED ON", at: sp + 2, y: 765 },
      { t: "LEFT ON THE BUS", at: bus + 4, y: 700 },
    ].forEach((ch, i) => {
      it.push(card(c, `E-chip${i}`, { p: [0, ch.y, ZE + 60], w: 440, h: 54, opacity: EO * p01(fr, ch.at, 12), children: <div style={{ position: "absolute", inset: 0, ...neon(GREEN, 0.7), borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}><T s={26} c={GREEN} ls="0.16em">{ch.t}</T><Check c={GREEN} s={28} /></div> }));
    });
    it.push(card(c, "E-ok", { p: [230, 430, ZE - 30], w: 300, h: 60, opacity: EO * p01(fr, dis, 12), children: <Pill text="NO BIG DEAL" bg={GREEN} s={26} /> }));
  }

  /* ---- F: five styles, or let it grow --------------------------------- */
  const FO = fade(fr, f(37.7), f(48.7), 16, 16);
  if (FO > 0) {
    const sv = f(CUE.saveWord);
    const five = f(CUE.five);
    const inst = f(CUE.instead);
    const skip = f(CUE.skip);
    const put = f(CUE.put);
    const grow = f(CUE.growWord);
    const add = f(CUE.addup);
    const tEnd = f(CUE.time) + 10;
    const rowOut = p01(fr, skip + 2, 18);
    it.push(card(c, "F-saved", { p: [0, 780, ZF], w: 420, h: 160, opacity: FO * p01(fr, f(38.1), 12) * (1 - p01(fr, grow - 20, 14)), children: <div style={{ position: "absolute", inset: 0, ...neon(GOLD) }}><Center gap={0}><T s={22} ls="0.3em">YOU SAVED</T><T s={80} c={GOLD} glow>{money(1110 * p01(fr, sv - 6, 24))}</T></Center></div> }));
    it.push(card(c, "F-real", { p: [-330, 270, ZF - 250], w: 200, h: 250, opacity: FO * (1 - rowOut) * lerp(1, 0.45, p01(fr, inst, 14)), children: <div style={{ position: "absolute", inset: 0, ...neon(INK, 0.6) }}><Center gap={4}><Bag color={INK} size={140} p={p01(fr, f(38.2), 22)} /><T s={22} ls="0.24em">1 REAL</T></Center></div> }));
    ["handbag", "tote", "clutch", "backpack", "crossbody"].forEach((k, i) => {
      const on = p01(fr, five + i * 5 - 4, 14);
      const keep = i === 0 ? 1 : 1 - rowOut;
      it.push(card(c, `F-copy${i}`, { p: [-60 + i * 120, 270, ZF - 200 + i * 230], w: 200, h: 250, yaw: -0.35, opacity: FO * keep * lerp(0.25, 1, on) * (1 - rowOut * (i === 0 ? 1 : 0)), children: <div style={{ position: "absolute", inset: 0, ...neon(GOLD, on) }}><Center gap={4}><Bag kind={k} color={GOLD} size={140} p={on} /><T s={24} c={GOLD}>$90</T></Center></div> }));
    });
    it.push(card(c, "F-5", { p: [200, 470, ZF + 200], w: 300, h: 70, opacity: FO * (1 - rowOut) * p01(fr, inst, 12), children: <Center><T s={44} c={GOLD} ls="0.2em" glow>5 STYLES</T></Center> }));
    // growth: savings chart rising over time
    const chartO = FO * p01(fr, skip + 14, 16);
    const g = 0.5 * p01(fr, put + 6, grow - put + 10) + 0.5 * p01(fr, add, tEnd - add);
    const curve: V3[] = Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      return [-340 + t * 680, 50 + 480 * Math.pow(t, 1.6), ZF + 200];
    });
    it.push(line3(c, "F-ax", { pts: [[-360, 600, ZF + 200], [-360, 30, ZF + 200], [360, 30, ZF + 200]], p: p01(fr, skip + 14, 14), color: "rgba(255,255,255,0.5)", width: 2, opacity: chartO }));
    it.push(line3(c, "F-curve", { pts: curve, p: g, color: GOLD, width: 6, opacity: chartO, dot: true }));
    it.push(card(c, "F-sav", { p: [-150, 560, ZF + 190], w: 360, h: 150, opacity: chartO, children: <Center gap={0}><T s={22} ls="0.3em">SAVINGS</T><T s={84} c={GOLD} glow>{money(lerp(1110, 3330, p01(fr, add, tEnd - add)))}</T></Center> }));
    it.push(card(c, "F-time", { p: [250, 0, ZF + 190], w: 260, h: 50, opacity: chartO * p01(fr, add, 12), children: <Center><T s={24} ls="0.24em">OVER TIME →</T></Center> }));
    // coins dropping in as the money is put to work
    for (let i = 0; i < 6; i++) {
      const t = p01(fr, put + i * 5, 20);
      if (t <= 0 || t >= 1) continue;
      it.push(card(c, `F-coin${i}`, { p: [-200 + i * 60, lerp(820, 120, io(t)), ZF + 150], w: 60, h: 60, opacity: FO * Math.min(1, t * 5) * (1 - t * t), children: <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 36, color: "#000", boxShadow: `0 0 18px ${GOLD}` }}>$</div> }));
    }
  }

  /* ---- G: status ------------------------------------------------------ */
  const GO = fade(fr, f(48.3), f(53.55), 16, 14);
  if (GO > 0) {
    const isnt = f(CUE.isnt);
    const know = f(CUE.knowing);
    const over = f(CUE.overpay);
    const raise = p01(fr, over - 2, 14);
    it.push(pawn(c, "G-pawn", { p: [0, 0, ZG], h: 260, opacity: GO, raise, hop: raise * 12 }));
    it.push(card(c, "G-bag", { p: [130, 100 + raise * 10, ZG - 10], w: 130, h: 130, opacity: GO, children: <Bag color={GOLD} size={120} p={p01(fr, f(48.6), 22)} /> }));
    const crestO = GO * p01(fr, f(CUE.logoArm) - 10, 14) * (1 - p01(fr, know - 4, 14));
    const strike = p01(fr, isnt + 4, 14);
    it.push(card(c, "G-crest", { p: [0, 560, ZG], w: 220, h: 220, opacity: crestO * lerp(1, 0.5, strike), children: <Center><Bag kind="crest" color={GOLD} size={200} p={p01(fr, f(CUE.logoArm) - 8, 22)} /></Center> }));
    it.push(line3(c, "G-strike", { pts: [[-110, 670, ZG - 20], [110, 450, ZG - 20]], p: strike, color: RED, width: 7, opacity: crestO }));
    it.push(card(c, "G-ne", { p: [0, 410, ZG - 20], w: 280, h: 60, opacity: crestO * p01(fr, isnt + 8, 12), children: <Center><T s={32} c={RED} ls="0.2em" glow>≠ STATUS</T></Center> }));
    it.push(card(c, "G-ok", { p: [0, 600, ZG - 40], w: 400, h: 70, opacity: GO * p01(fr, over - 4, 14), children: <Pill text="DIDN'T OVERPAY" bg={GOLD} s={30} /> }));
    it.push(card(c, "G-rec", { p: [270, 340, ZG - 150], w: 300, h: 250, opacity: GO * p01(fr, know, 14), children: <div style={{ position: "absolute", inset: 0, ...neon(GREEN) }}><div style={{ position: "absolute", left: 26, top: 22 }}><T s={20} ls="0.3em">RECEIPT</T><div style={{ height: 14 }} /><T s={20} ls="0.24em">PAID</T><T s={56} c={INK}>$90</T><div style={{ height: 8 }} /><T s={20} ls="0.24em" style={{ opacity: p01(fr, over, 12) }}>SAVED</T><T s={56} c={GREEN} glow style={{ opacity: p01(fr, over, 12) }}>$1,110</T></div></div> }));
  }

  /* ---- H: checkout, then loop ----------------------------------------- */
  const loopOut = p01(fr, f(CUE.speechEnd) + 8, 16);
  const HO = fade(fr, f(53.4), f(70), 16, 1) * (1 - loopOut);
  if (HO > 0) {
    const pay = f(CUE.pay);
    const name = pay + 12;
    const pq = f(CUE.productQ) - 4;
    const lb = f(CUE.label) - 4;
    const nameGlow = p01(fr, name, 12) * (1 - p01(fr, pq, 12));
    it.push(
      card(c, "H-co", {
        p: [0, 560, ZH],
        w: 540,
        h: 330,
        opacity: HO,
        children: (
          <div style={{ position: "absolute", inset: 0, ...neon(INK, 0.6) }}>
            <div style={{ position: "absolute", left: 30, top: 24 }}>
              <T s={22} ls="0.3em">YOUR ORDER</T>
            </div>
            <div style={{ position: "absolute", left: 30, top: 72 }}>
              <Bag color={INK} size={110} p={p01(fr, f(53.8), 22)} />
            </div>
            <div style={{ position: "absolute", left: 160, top: 96 }}>
              <T s={28} ls="0.1em" c={nameGlow > 0.5 ? GOLD : INK} glow={nameGlow > 0.5}>BRAND-NAME BAG</T>
              <div style={{ marginTop: 6, width: 290 * nameGlow, height: 4, background: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
            </div>
            <div style={{ position: "absolute", right: 30, top: 150 }}>
              <T s={40}>$1,200</T>
            </div>
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, height: 70, borderRadius: 999, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${GOLD}` }}>
              <T s={30} c="#000" w={800} ls="0.2em">PAY $1,200</T>
            </div>
          </div>
        ),
      }),
    );
    it.push(pawn(c, "H-pawn", { p: [-340, 0, ZH - 200], h: 210, opacity: HO * p01(fr, f(CUE.ask) - 8, 14), q: p01(fr, f(CUE.ask), 12) }));
    it.push(card(c, "H-prod", { p: [0, 270, ZH - 100], w: 460, h: 120, opacity: HO * p01(fr, pq, 14), children: <div style={{ position: "absolute", inset: 0, ...neon(GREEN) }}><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" }}><T s={28} ls="0.2em">THE PRODUCT</T><T s={62} c={GREEN} glow>$90</T></div></div> }));
    it.push(card(c, "H-label", { p: [0, 130, ZH - 100], w: 460, h: 120, opacity: HO * p01(fr, lb, 14), children: <div style={{ position: "absolute", inset: 0, ...neon(RED, 1.3) }}><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" }}><T s={28} ls="0.2em">THE LABEL</T><T s={62} c={RED} glow>{money(1110 * p01(fr, lb + 2, 16))}</T></div></div> }));
  }
  // the loop: the opening tag, one station on
  const loopIn = p01(fr, f(59.7) - 26, 22);
  it.push(...openingTag(c, fr, LOOP_Z, loopIn, 0, 0, "L"));

  return it;
};

/** "Product or Label?" — 60 s vertical cut in the neon-3D style of the supplied TikTok references. */
export const NeonLabel: React.FC = () => {
  const fr = useCurrentFrame();
  const c = camAt(fr);
  const items = [floor(c, [[0, 380, ZC], [0, 380, ZG]]), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0b0b10 0%, #000 70%)", overflow: "hidden" }}>
      {items.map((i) => i.node)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.75) 100%)", pointerEvents: "none" }} />
      <WordCaptions />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: "0.26em", color: "rgba(255,255,255,0.45)", opacity: p01(fr, f(4.5), 14) * (1 - p01(fr, f(CUE.speechEnd) + 6, 14)) }}>ILLUSTRATIVE PRICES</div>
      <Audio src={staticFile("voice/label60-narration.wav")} />
    </AbsoluteFill>
  );
};
