import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { lerp } from "../v2/anim";
import { LineArt } from "../v2/components/Draw";
import { FONT } from "../v2/theme";
import { p01 } from "../v5/smooth";
import { burst, Cam, card, floor, GOLD, GREEN, INK, Item, line3, motes, neon, pawn, RED, setView, spot, V3, wireBox } from "../v6/engine";
import { WordCaptions } from "../v6/WordCaptions";
import { ART } from "../v7/icons";
import { CHAPTERS, CUE, f, L, TOTAL_FRAMES, WORDS } from "../v8/timing";
import { camAt, camMotion, Z } from "./camera";

/* TikTok-safe lens (clear of the side buttons and caption overlay). */
const SAFE_CX = 500;
const VIEW_TT = { f: 1010, cx: SAFE_CX, cy: 770 };

/* ---------------------------------------------------------------- motion rules
 * One easing for everything (p01 = smooth in-out). Things enter over ENTER frames with a fade and a
 * small settle (no overshoot, no bounce), line art draws on over DRAW frames, and a whole station
 * fades out together as the camera leaves it.
 */
const ENTER = 12;
const DRAW = 20;
const inn = (fr: number, at: number, d = ENTER) => p01(fr, at, d);
const settle = (a: number, from = 0.92) => `scale(${lerp(from, 1, a)})`;
const fadeStation = (fr: number, a: number, b: number) => p01(fr, a, 12) * (1 - p01(fr, b - 8, 8));
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const EMPHASIS = ["five", "reasons", "fake", "real", "one", "price", "three", "thousand", "hundred", "same", "thirty", "cheaper", "four", "use", "babying", "dust", "panic", "rains", "nobody", "tell", "room", "replica", "two", "trends", "fast", "hype", "dies", "lost", "money", "keep", "invest", "ten", "years", "comments"];

/* --------------------------------------------------------------- small ui */
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
const Chip: React.FC<{ text: string; col: string; s?: number; solid?: boolean }> = ({ text, col, s = 24, solid }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...(solid ? { background: col, boxShadow: `0 0 26px ${col}` } : neon(col, 0.8)), borderRadius: 999 }}>
    <T s={s} c={solid ? "#000" : col} ls="0.18em" style={{ paddingLeft: "0.18em" }}>{text}</T>
  </div>
);
const Box: React.FC<{ col: string; s?: number; children?: React.ReactNode }> = ({ col, s = 1, children }) => <div style={{ position: "absolute", inset: 0, ...neon(col, s) }}>{children}</div>;

/** Chapter header for a reason: "#5  THE PRICE" in neon, standing at the top of its station. */
const chapter = (c: Cam, key: string, n: number, title: string, z: number, op: number): Item | null =>
  card(c, key, {
    p: [0, 880, z],
    w: 760,
    h: 120,
    opacity: op,
    noBlur: true,
    children: (
      <Center row gap={24}>
        <T s={104} c={GOLD} w={900} ls="0" glow>#{n}</T>
        <T s={52} w={800} ls="0.08em">{title}</T>
      </Center>
    ),
  });

/** A neon line-art bag on a wireframe pedestal under a light cone, label beneath the bag. */
const bagOn = (c: Cam, key: string, o: { x: number; z: number; op: number; col: string; draw: number; label?: string; labelOp?: number; light?: number; kind?: string }): (Item | null)[] => [
  spot(c, key + "-sp", { p: [o.x, 0, o.z], r: 160, color: o.col, opacity: o.op * 0.75 * (o.light ?? 1) }),
  wireBox(c, key + "-pd", { c: [o.x, 40, o.z], size: [240, 80, 240], color: o.col, opacity: o.op * 0.85, width: 2.5 }),
  card(c, key + "-b", {
    p: [o.x, 250, o.z],
    w: 290,
    h: 300,
    opacity: o.op,
    reflect: 0.2,
    children: (
      <Center gap={2}>
        <Art kind={o.kind ?? "handbag"} color={o.col} size={236} p={o.draw} />
        <T s={28} c={o.col} ls="0.3em" glow style={{ opacity: o.labelOp ?? 1, paddingLeft: "0.3em" }}>{o.label ?? ""}</T>
      </Center>
    ),
  }),
];

/* ====================================================================== world */
const world = (c: Cam, fr: number): (Item | null)[] => {
  const it: (Item | null)[] = [];
  const [c5, c4, c3, c2, c1] = CHAPTERS;

  /* ---- hook --------------------------------------------------------------------- */
  const HO = 1 - p01(fr, f(c5.from) - 3, 8);
  if (HO > 0) {
    const z = Z.H;
    const d = p01(fr, 0, DRAW);
    it.push(...bagOn(c, "H-l", { x: -200, z, op: HO, col: INK, draw: d, label: "REAL", labelOp: inn(fr, f(CUE.real) - 3) }));
    it.push(...bagOn(c, "H-r", { x: 200, z, op: HO, col: GOLD, draw: d, label: "FAKE", labelOp: inn(fr, f(CUE.fake) - 3), light: lerp(1, 1.35, inn(fr, f(CUE.stay))) }));
    const a1 = inn(fr, f(L.hook.start) - 4);
    const a2 = inn(fr, f(CUE.fake) - 4);
    it.push(
      card(c, "H-title", {
        p: [0, 800, z],
        w: 860,
        h: 220,
        opacity: HO,
        noBlur: true,
        children: (
          <Center gap={14}>
            <T s={124} c={GOLD} w={900} ls="0.02em" glow style={{ opacity: a1, transform: settle(a1) }}>5 REASONS</T>
            <T s={40} w={700} ls="0.16em" style={{ opacity: a2, transform: settle(a2), paddingLeft: "0.16em" }}>
              THE <span style={{ color: GOLD }}>FAKE</span> BEATS THE REAL
            </T>
          </Center>
        ),
      }),
    );
  }

  /* ---- #5 the price ---------------------------------------------------------- */
  const O5 = fadeStation(fr, f(c5.from) - 6, f(c4.from) + 5);
  if (O5 > 0) {
    const z = Z.R5;
    const d = p01(fr, f(c5.from), DRAW);
    const x30 = inn(fr, f(CUE.thirty) - 4);
    it.push(chapter(c, "P-ch", 5, c5.title, z, O5 * (1 - x30)));
    it.push(...bagOn(c, "P-l", { x: -205, z, op: O5, col: INK, draw: d, label: "DESIGNER" }));
    it.push(...bagOn(c, "P-r", { x: 205, z, op: O5, col: GOLD, draw: d, label: "REPLICA" }));
    const tag = (key: string, x: number, at: number, col: string, value: string) => {
      const a = inn(fr, at);
      return card(c, key, {
        p: [x, 570 + (1 - a) * 70, z],
        w: 320,
        h: 160,
        string: true,
        opacity: O5 * a,
        children: (
          <Box col={col}>
            <Center gap={4}>
              <T s={22} ls="0.3em">PRICE</T>
              <T s={76} c={col} glow>{value}</T>
            </Center>
          </Box>
        ),
      });
    };
    const t0 = f(CUE.three) - 6;
    const t1 = f(CUE.hundred) - 8;
    it.push(tag("P-t0", -205, t0, RED, money(3000 * p01(fr, t0 + 4, 20))));
    it.push(tag("P-t1", 205, t1, GREEN, "$100"));
    const eq = inn(fr, f(CUE.same) - 4);
    it.push(card(c, "P-eq", { p: [0, 290, z - 60], w: 110, h: 110, opacity: O5 * eq, children: <div style={{ position: "absolute", inset: 0, transform: settle(eq, 0.8) }}><div style={{ position: "absolute", inset: 0, ...neon(INK, 0.8), borderRadius: "50%" }}><Center><T s={72} w={500} ls="0">=</T></Center></div></div> }));
    it.push(card(c, "P-same", { p: [0, 410, z - 60], w: 230, h: 50, opacity: O5 * inn(fr, f(CUE.same) + 2), children: <Chip text="SAME LOOK" col={INK} s={22} /> }));
    it.push(card(c, "P-note", { p: [0, 700, z], w: 320, h: 30, opacity: O5 * inn(fr, t0) * 0.75, children: <Center><T s={17} w={600} ls="0.24em" c="rgba(255,255,255,0.7)">ILLUSTRATIVE PRICES</T></Center> }));
    it.push(card(c, "P-30", { p: [0, 880, z], w: 620, h: 110, opacity: O5 * x30, noBlur: true, children: <div style={{ position: "absolute", inset: 0, transform: settle(x30, 0.85) }}><Chip text="30× CHEAPER" col={GOLD} s={52} solid /></div> }));
  }

  /* ---- #4 you'll actually use it --------------------------------------------- */
  const O4 = fadeStation(fr, f(c4.from) - 6, f(c3.from) + 5);
  if (O4 > 0) {
    const z = Z.R4;
    it.push(chapter(c, "U-ch", 4, c4.title, z, O4));
    it.push(spot(c, "U-sp", { p: [-190, 0, z], r: 170, color: GOLD, opacity: O4 * 0.8 }));
    it.push(pawn(c, "U-pawn", { p: [-190, 0, z], h: 270, opacity: O4 }));
    it.push(card(c, "U-bag", { p: [-95, 112, z - 12], w: 120, h: 120, opacity: O4, children: <Art kind="handbag" color={GOLD} size={112} p={p01(fr, f(c4.from), DRAW)} /> }));
    const ed = inn(fr, f(CUE.use) - 3);
    it.push(card(c, "U-daily", { p: [-190, 345, z - 10], w: 240, h: 56, opacity: O4 * ed, children: <div style={{ position: "absolute", inset: 0, transform: settle(ed) }}><Chip text="EVERY DAY" col={GOLD} s={22} solid /></div> }));
    const rows = [
      { t: "BABYING IT", at: f(CUE.no1) },
      { t: "DUST BAG", at: f(CUE.no2) },
      { t: "RAIN PANIC", at: f(CUE.no3) },
    ];
    it.push(
      card(c, "U-list", {
        p: [195, 400, z - 30],
        w: 370,
        h: 380,
        opacity: O4 * inn(fr, f(CUE.youll)),
        children: (
          <Box col={INK} s={0.6}>
            <div style={{ position: "absolute", left: 30, top: 26 }}>
              <T s={22} ls="0.3em">NO MORE</T>
            </div>
            {rows.map((r, i) => {
              const on = inn(fr, r.at - 3, 10);
              const strike = p01(fr, r.at + 3, 10);
              return (
                <div key={r.t} style={{ position: "absolute", left: 30, right: 30, top: 86 + i * 96, height: 76, display: "flex", alignItems: "center", gap: 18, opacity: lerp(0.28, 1, on) }}>
                  <svg width={40} height={40} viewBox="0 0 40 40" style={{ flex: "none" }}>
                    <circle cx={20} cy={20} r={17} fill="none" stroke={on > 0.5 ? RED : "rgba(255,255,255,0.4)"} strokeWidth={2.5} />
                    <path d="M13 13 L27 27 M27 13 L13 27" stroke={on > 0.5 ? RED : "rgba(255,255,255,0.4)"} strokeWidth={3} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "relative" }}>
                    <T s={32} ls="0.08em">{r.t}</T>
                    <div style={{ position: "absolute", left: -4, top: "50%", height: 4, width: `calc(${strike * 100}% + 8px)`, background: RED, borderRadius: 2, boxShadow: `0 0 10px ${RED}` }} />
                  </div>
                </div>
              );
            })}
          </Box>
        ),
      }),
    );
    // a small rain cloud over the bag: it rains, and nothing happens
    const rc = inn(fr, f(CUE.no3) - 2);
    it.push(
      card(c, "U-cloud", {
        p: [-150, 560, z - 30],
        w: 190,
        h: 200,
        opacity: O4 * rc,
        children: (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 5, top: -20 }}>
              <Art kind="cloud" color={INK} size={180} p={rc} />
            </div>
            {Array.from({ length: 8 }, (_, d) => {
              const y = 100 + ((fr * 5 + d * 37) % 90);
              return <div key={d} style={{ position: "absolute", left: 40 + d * 15, top: y, width: 3, height: 18, borderRadius: 2, background: "#9fdcff", opacity: 0.85 * Math.sin(((y - 100) / 90) * Math.PI) }} />;
            })}
          </div>
        ),
      }),
    );
  }

  /* ---- #3 nobody can tell ----------------------------------------------------- */
  const O3 = fadeStation(fr, f(c3.from) - 6, f(c2.from) + 5);
  if (O3 > 0) {
    const z = Z.R3;
    const d = p01(fr, f(c3.from), DRAW);
    const rv = inn(fr, f(CUE.realThing) - 2);
    it.push(chapter(c, "T-ch", 3, c3.title, z, O3));
    it.push(...bagOn(c, "T-l", { x: -200, z, op: O3, col: INK, draw: d, light: lerp(1, 1.3, rv) }));
    it.push(...bagOn(c, "T-r", { x: 200, z, op: O3, col: INK, draw: d }));
    const q = inn(fr, f(CUE.nobody) - 2);
    it.push(card(c, "T-q", { p: [0, 650, z], w: 780, h: 90, opacity: O3 * q, noBlur: true, children: <Center style={{ transform: settle(q) }}><T s={60} w={900} ls="0.02em">WHICH ONE IS <span style={{ color: GOLD, textShadow: `0 0 20px ${GOLD}` }}>REAL</span>?</T></Center> }));
    [
      { x: -200, ab: "A", ans: "REPLICA", col: GOLD },
      { x: 200, ab: "B", ans: "REAL", col: INK },
    ].forEach((b, i) => {
      const a = inn(fr, f(CUE.nobody) + 4 + i * 3);
      it.push(card(c, `T-a${i}`, { p: [b.x, 420, z - 10], w: 120, h: 60, opacity: O3 * a * (1 - rv), children: <Chip text={b.ab} col={INK} s={28} /> }));
      it.push(card(c, `T-r${i}`, { p: [b.x, 420, z - 10], w: 250, h: 60, opacity: O3 * rv, children: <div style={{ position: "absolute", inset: 0, transform: settle(rv) }}><Chip text={b.ans} col={b.col} s={24} solid={i === 0} /></div> }));
    });
  }

  /* ---- #2 trends move fast ----------------------------------------------------- */
  const O2 = fadeStation(fr, f(c2.from) - 6, f(c1.from) + 5);
  if (O2 > 0) {
    const z = Z.R2;
    it.push(chapter(c, "N-ch", 2, c2.title, z, O2));
    const base = 420;
    const ax = p01(fr, f(c2.from), 16);
    it.push(line3(c, "N-ax", { pts: [[-360, 790, z], [-360, base, z], [360, base, z]], p: ax, color: "rgba(255,255,255,0.5)", width: 2, opacity: O2 }));
    it.push(card(c, "N-hl", { p: [-290, 770, z], w: 120, h: 40, opacity: O2 * ax, children: <Center><T s={20} ls="0.3em">HYPE</T></Center> }));
    const peakX = -40;
    const rise: V3[] = Array.from({ length: 21 }, (_, i) => {
      const t = i / 20;
      return [lerp(-350, peakX, t), base + 10 + 330 * Math.pow(t, 1.7), z];
    });
    const fall: V3[] = Array.from({ length: 21 }, (_, i) => {
      const t = i / 20;
      return [lerp(peakX, 350, t), base + 340 - 320 * Math.pow(t, 0.75), z];
    });
    const tr = f(CUE.trends) - 2;
    const di = f(CUE.dies) - 6;
    it.push(line3(c, "N-rise", { pts: rise, p: p01(fr, tr, 18), color: GOLD, width: 6, opacity: O2, dot: fr < di }));
    it.push(line3(c, "N-fall", { pts: fall, p: p01(fr, di, 22), color: RED, width: 6, opacity: O2, dot: true }));
    it.push(card(c, "N-peak", { p: [peakX, 800, z - 5], w: 150, h: 48, opacity: O2 * inn(fr, tr + 14), children: <Chip text="PEAK" col={GOLD} s={20} /> }));
    it.push(card(c, "N-dead", { p: [290, 500, z - 5], w: 150, h: 48, opacity: O2 * inn(fr, di + 18), children: <Chip text="DEAD" col={RED} s={20} /> }));
    const lo = inn(fr, f(CUE.lost) - 4);
    const b1 = p01(fr, f(CUE.hundred2) - 4, 12);
    const b2 = p01(fr, f(CUE.three2) - 4, 18);
    it.push(
      card(c, "N-loss", {
        p: [0, 190, z - 120],
        w: 720,
        h: 230,
        opacity: O2 * lo,
        children: (
          <Box col={GOLD} s={0.7}>
            <div style={{ position: "absolute", left: 30, top: 22 }}>
              <T s={22} ls="0.3em">WHAT YOU LOSE</T>
            </div>
            {[
              { l: "REPLICA", v: "−$100", w: 26, col: GREEN, p: b1 },
              { l: "DESIGNER", v: "−$3,000", w: 400, col: RED, p: b2 },
            ].map((r, i) => (
              <div key={r.l} style={{ position: "absolute", left: 30, right: 30, top: 76 + i * 74, display: "flex", alignItems: "center", gap: 18, opacity: lerp(0.25, 1, r.p) }}>
                <div style={{ width: 160 }}>
                  <T s={26} ls="0.12em">{r.l}</T>
                </div>
                <div style={{ width: Math.max(12, r.w * r.p), height: 20, borderRadius: 10, background: r.col, boxShadow: `0 0 14px ${r.col}` }} />
                <T s={36} c={r.col} glow>{r.v}</T>
              </div>
            ))}
          </Box>
        ),
      }),
    );
  }

  /* ---- #1 the money you keep ---------------------------------------------------- */
  const O1 = fadeStation(fr, f(c1.from) - 6, f(L.r1.end + 0.15) + 5);
  if (O1 > 0) {
    const z = Z.R1;
    it.push(chapter(c, "M-ch", 1, c1.title, z, O1));
    const kp = f(c1.until) - 2;
    const inv = f(CUE.invest);
    const end = f(CUE.five2) + 18;
    const vals = Array.from({ length: 11 }, (_, y) => 2900 * Math.pow(1.07, y));
    const g = p01(fr, inv, end - inv);
    const year = Math.min(10, Math.max(1, Math.ceil(g * 10)));
    it.push(
      card(c, "M-val", {
        p: [0, 690, z],
        w: 640,
        h: 160,
        opacity: O1 * inn(fr, kp),
        noBlur: true,
        children: (
          <Center gap={2}>
            <T s={24} ls="0.3em">{fr < inv ? "YOU KEEP" : `INVESTED · YEAR ${year}`}</T>
            <T s={104} c={GOLD} w={900} ls="0.02em" glow>{money(fr < inv ? 2900 * p01(fr, kp, f(CUE.keep) + 8 - kp) : lerp(2900, vals[10], g))}</T>
          </Center>
        ),
      }),
    );
    // ten bars rising in 3D, one per year
    vals.slice(1).forEach((v, i) => {
      const on = p01(fr, inv + (i * (end - 16 - inv)) / 10, 14);
      if (on <= 0) return;
      const h = (v / vals[10]) * 440 * on;
      it.push(wireBox(c, `M-bar${i}`, { c: [-315 + i * 70, h / 2, z - 40], size: [46, Math.max(2, h), 46], color: GOLD, opacity: O1 * (i === 9 ? 1 : 0.75), width: i === 9 ? 3.5 : 2.5 }));
    });
    it.push(card(c, "M-y1", { p: [-315, -26, z - 80], w: 120, h: 34, opacity: O1 * inn(fr, inv), children: <Center><T s={18} ls="0.2em">YEAR 1</T></Center> }));
    it.push(card(c, "M-y10", { p: [315, -26, z - 80], w: 130, h: 34, opacity: O1 * inn(fr, inv + 10), children: <Center><T s={18} ls="0.2em">YEAR 10</T></Center> }));
    it.push(card(c, "M-note", { p: [0, 560, z], w: 640, h: 30, opacity: O1 * inn(fr, inv + 6) * 0.7, children: <Center><T s={16} w={600} ls="0.08em" c="rgba(255,255,255,0.7)">ILLUSTRATIVE · ASSUMES 7% A YEAR · NOT FINANCIAL ADVICE</T></Center> }));
    it.push(burst(c, "M-burst", { p: [315, 470, z - 20], t: p01(fr, f(CUE.five2) + 4, 26), n: 22, spread: 260 }));
  }

  /* ---- the close ------------------------------------------------------------------ */
  const OE = p01(fr, f(L.r1.end) - 2, 12);
  if (OE > 0) {
    const z = Z.E;
    const d = p01(fr, f(L.r1.end), DRAW);
    it.push(...bagOn(c, "E-l", { x: -200, z, op: OE, col: INK, draw: d, label: "REAL", labelOp: inn(fr, f(CUE.realEnd) - 3) }));
    it.push(...bagOn(c, "E-r", { x: 200, z, op: OE, col: GOLD, draw: d, label: "FAKE", labelOp: inn(fr, f(CUE.fakeEnd) - 3) }));
    const a = inn(fr, f(L.end.start) - 3);
    const tl = inn(fr, f(CUE.tell) - 3);
    it.push(
      card(c, "E-title", {
        p: [0, 790, z],
        w: 880,
        h: 230,
        opacity: OE,
        noBlur: true,
        children: (
          <Center gap={18}>
            <T s={104} w={900} ls="0.02em" style={{ opacity: a, transform: settle(a) }}>
              REAL OR <span style={{ color: GOLD, textShadow: `0 0 30px ${GOLD}` }}>FAKE</span>?
            </T>
            <div style={{ opacity: tl, transform: settle(tl), display: "flex", alignItems: "center", gap: 16 }}>
              <svg width={44} height={40} viewBox="0 0 46 42" style={{ filter: `drop-shadow(0 0 8px ${GOLD})` }}>
                <path d="M6 4 H40 Q44 4 44 8 V28 Q44 32 40 32 H20 L10 40 V32 H6 Q2 32 2 28 V8 Q2 4 6 4 Z" fill="none" stroke={GOLD} strokeWidth={3.2} strokeLinejoin="round" />
              </svg>
              <T s={36} ls="0.12em">TELL ME IN THE COMMENTS</T>
            </div>
          </Center>
        ),
      }),
    );
  }
  return it;
};

/** "5 Reasons" in the neon-3D reference style, with calmer, cleaner motion. */
export const Neon5: React.FC = () => {
  const fr = useCurrentFrame();
  setView(VIEW_TT);
  const c = camAt(fr);
  const { roll, speed } = camMotion(fr);
  const items = [floor(c), ...motes(c, fr), ...(world(c, fr).filter(Boolean) as Item[])];
  items.sort((a, b) => b.z - a.z);
  const mb = Math.max(0, Math.min(2, (speed - 40) / 20));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 46% 40%, #0e0e14 0%, #000 72%)" }} />
      <AbsoluteFill style={{ transform: `rotate(${roll}rad) scale(${1 + Math.abs(roll) * 0.9})`, filter: mb > 0.2 ? `blur(${mb.toFixed(2)}px)` : undefined }}>{items.map((i) => i.node)}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 70% at 46% 41%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
      <WordCaptions words={WORDS} emphasis={EMPHASIS} top={1255} cx={SAFE_CX} smooth />
      <Audio src={staticFile("voice/top5-narration.wav")} />
    </AbsoluteFill>
  );
};

export const NEON5_FRAMES = TOTAL_FRAMES;
