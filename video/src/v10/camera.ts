import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { CUE, f, L, TOTAL_FRAMES } from "./timing";

const GAP = 1400;
/** Main lane (x = 0) stops, the replica lane (x = RX), and the ending between them. */
export const Z = { HK: 1200, FA: 1200 + GAP, LO: 1200 + 2 * GAP, AD: 1200 + 3 * GAP, ST: 1200 + 4 * GAP, YO: 1200 + 5 * GAP };
export const RX = 1700;
export const RZ = { FA: Z.YO, YO: Z.YO + GAP };
export const EX = RX / 2;
export const EZ = Z.YO + 2 * GAP + 600;

/** Flights between stops: [leave, arrive]. The hero bag rides the conveyor on the same timing. */
export const FLIGHTS = {
  fa: [L.hook.end + 0.05, L.factory.start + 0.3],
  lo: [L.factory.end + 0.05, L.logo.start + 0.25],
  ad: [L.logo.end + 0.05, L.ads.start + 0.25],
  st: [L.ads.end + 0.05, L.store.start + 0.25],
  yo: [L.store.end + 0.05, L.you.start + 0.25],
  rep: [L.you.end + 0.05, L.replica.start + 0.45],
  ship: [CUE.ships - 0.1, CUE.ships + 0.75],
  end: [L.replica.end + 0.05, L.end.start + 0.3],
} as const;

type K = Cam & { at: number; dur: number };
const k = (t: number, x: number, y: number, z: number, yaw: number, pitch: number, focus: number, dur = 30): K => ({ at: f(t), x, y, z, yaw, pitch, focus, dur });
const fly = (fl: readonly [number, number], x: number, y: number, z: number, focus: number, side: number, hold: number): K[] => {
  const at = f(fl[1]);
  const dur = at - f(fl[0]);
  const to = { x, y, z, yaw: 0, pitch: -0.04, focus };
  return [
    { ...to, at: at - Math.round(dur * 0.45), dur: Math.round(dur * 0.6), x: x + side * 150, y: y + 60, z: z - GAP * 0.55, yaw: -side * 0.06, pitch: -0.06 },
    { ...to, at, dur },
    // then one slow push for the rest of the stop
    { ...to, at: f(hold), dur: f(hold) - at, z: z + 90, focus: focus - 90, pitch: -0.045 },
  ];
};

const KEYS: K[] = [
  k(0, 0, 430, 180, 0, -0.04, 1020, 1),
  k(L.hook.end, 0, 420, 330, 0, -0.045, 870, f(L.hook.end) - 1),
  ...fly(FLIGHTS.fa, 0, 440, Z.FA - 1040, 1040, 1, FLIGHTS.lo[0]),
  ...fly(FLIGHTS.lo, 0, 440, Z.LO - 1040, 1040, -1, FLIGHTS.ad[0]),
  ...fly(FLIGHTS.ad, 0, 470, Z.AD - 1080, 1080, 1, FLIGHTS.st[0]),
  ...fly(FLIGHTS.st, 0, 450, Z.ST - 1060, 1060, -1, FLIGHTS.yo[0]),
  ...fly(FLIGHTS.yo, 0, 440, Z.YO - 1040, 1040, 1, FLIGHTS.rep[0]),
  // truck sideways to the replica lane
  k(FLIGHTS.rep[1], RX, 440, RZ.FA - 1040, 0, -0.04, 1040, f(FLIGHTS.rep[1] - FLIGHTS.rep[0])),
  k(FLIGHTS.ship[0], RX, 430, RZ.FA - 960, 0, -0.045, 960, f(FLIGHTS.ship[0] - FLIGHTS.rep[1])),
  k(FLIGHTS.ship[1], RX, 440, RZ.YO - 1040, 0, -0.04, 1040, f(FLIGHTS.ship[1] - FLIGHTS.ship[0])),
  k(FLIGHTS.end[0], RX, 430, RZ.YO - 980, 0, -0.045, 980, f(FLIGHTS.end[0] - FLIGHTS.ship[1])),
  ...fly(FLIGHTS.end, EX, 440, EZ - 1080, 1080, -1, TOTAL_FRAMES / 30),
];

export const camAt = (frame: number): Cam => {
  const c: Cam = { x: KEYS[0].x, y: KEYS[0].y, z: KEYS[0].z, yaw: KEYS[0].yaw, pitch: KEYS[0].pitch, focus: KEYS[0].focus };
  for (const key of KEYS) {
    const p = interpolate(frame, [key.at - key.dur, key.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
    c.x += (key.x - c.x) * p;
    c.y += (key.y - c.y) * p;
    c.z += (key.z - c.z) * p;
    c.yaw += (key.yaw - c.yaw) * p;
    c.pitch += (key.pitch - c.pitch) * p;
    c.focus += (key.focus - c.focus) * p;
  }
  const t = frame / 30;
  c.x += Math.sin(t * 0.5) * 6;
  c.y += Math.cos(t * 0.4) * 3;
  return c;
};

export const camMotion = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  const dx = (b.x - a.x) / 2;
  const dz = (b.z - a.z) / 2;
  const lateral = dx * Math.cos(a.yaw) - dz * Math.sin(a.yaw);
  return { roll: Math.max(-0.025, Math.min(0.025, -lateral * 0.0012)), speed: Math.hypot(dx, dz, (b.y - a.y) / 2) };
};
