import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { f, L, CUE, TOTAL_FRAMES } from "./timing";

const GAP = 1400;
/** Main lane (x = 0) stops, the replica lane (x = RX), and the ending between them. */
export const Z = { HK: 1200, FA: 1200 + GAP, LO: 1200 + 2 * GAP, AD: 1200 + 3 * GAP, ST: 1200 + 4 * GAP, YO: 1200 + 5 * GAP };
export const RX = 1700;
export const RZ = { FA: Z.YO, YO: Z.YO + GAP };
export const EX = RX / 2;
export const EZ = Z.YO + 2 * GAP + 600;

/** Flights between stops: [leave, arrive]. The hero bag rides the conveyor in step with the camera. */
export const FLIGHTS = {
  fa: [L.hook.end + 0.05, L.factory.start + 0.3],
  lo: [L.factory.end + 0.05, L.logo.start + 0.25],
  ad: [L.logo.end + 0.05, L.ads.start + 0.25],
  st: [L.ads.end + 0.05, L.store.start + 0.25],
  yo: [L.store.end + 0.05, L.you.start + 0.25],
  rep: [L.you.end + 0.05, L.replica.start + 0.55],
  ship: [CUE.ships - 0.1, CUE.ships + 0.75],
  end: [L.replica.end + 0.05, L.end.start + 0.35],
} as const;

/**
 * An orbit rig: the camera circles a target point (tx, ty, tz) at distance R and angle th (degrees,
 * 0 = looking down +z from in front, 90 = looking down +x from the left). Interpolating the rig's
 * values rather than raw positions turns every move into a smooth arc around the subject.
 */
export type Rig = { tx: number; tz: number; ty: number; R: number; th: number; y: number };
type K = Rig & { at: number; dur: number };
const k = (at: number, dur: number, r: Rig): K => ({ ...r, at, dur });
const rig = (tx: number, tz: number, th: number, R = 1040, y = 440, ty = 300): Rig => ({ tx, tz, th, R, y, ty });

/** Arrive at a stop at angle a, then keep orbiting slowly to angle b until the next flight. */
const stop = (fl: readonly [number, number], next: number, tx: number, tz: number, a: number, b: number, R = 1040, y = 440): K[] => [
  k(f(fl[1]), f(fl[1]) - f(fl[0]), rig(tx, tz, a, R, y)),
  k(f(next), f(next) - f(fl[1]), rig(tx, tz, b, R - 80, y - 10)),
];

const KEYS: K[] = [
  k(0, 1, rig(0, Z.HK, 0, 1000, 430)),
  // a full turn around the $3,000 bag
  k(f(L.hook.end), f(L.hook.end) - 1, rig(0, Z.HK, 360, 980, 450)),
  ...stop(FLIGHTS.fa, FLIGHTS.lo[0], 0, Z.FA, 395, 328),
  ...stop(FLIGHTS.lo, FLIGHTS.ad[0], 0, Z.LO, 322, 392),
  ...stop(FLIGHTS.ad, FLIGHTS.st[0], 0, Z.AD, 396, 334, 1080, 460),
  ...stop(FLIGHTS.st, FLIGHTS.yo[0], 0, Z.ST, 328, 396, 1060),
  ...stop(FLIGHTS.yo, FLIGHTS.rep[0], 0, Z.YO, 392, 340),
  // swing 90° to watch the replica lane side-on
  ...stop(FLIGHTS.rep, FLIGHTS.ship[0], RX, RZ.FA, 450, 442),
  k(f(FLIGHTS.ship[1]), f(FLIGHTS.ship[1]) - f(FLIGHTS.ship[0]), rig(RX, RZ.YO, 446, 1040)),
  k(f(FLIGHTS.end[0]), f(FLIGHTS.end[0]) - f(FLIGHTS.ship[1]), rig(RX, RZ.YO, 440, 980)),
  // round to the front of the ending, then a slow arc around the two of them
  ...stop(FLIGHTS.end, TOTAL_FRAMES / 30, EX, EZ, 382, 335, 1100),
];

export const rigAt = (frame: number): Rig => {
  const r: Rig = { tx: KEYS[0].tx, tz: KEYS[0].tz, ty: KEYS[0].ty, R: KEYS[0].R, th: KEYS[0].th, y: KEYS[0].y };
  for (const key of KEYS) {
    const p = interpolate(frame, [key.at - key.dur, key.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
    (Object.keys(r) as (keyof Rig)[]).forEach((n) => {
      r[n] += (key[n] - r[n]) * p;
    });
  }
  return r;
};

export const camAt = (frame: number): Cam => {
  const r = rigAt(frame);
  const th = (r.th * Math.PI) / 180;
  const t = frame / 30;
  const y = r.y + Math.cos(t * 0.4) * 3;
  // look at the target: yaw from the orbit angle, pitch down towards the target's height
  return { x: r.tx - r.R * Math.sin(th), y, z: r.tz - r.R * Math.cos(th), yaw: th, pitch: -Math.atan2(y - r.ty, r.R) * 0.55, focus: r.R };
};

/** Speed (units/frame) for a light motion blur; no roll (orbits read cleaner level). */
export const camMotion = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  return { roll: 0, speed: Math.hypot((b.x - a.x) / 2, (b.z - a.z) / 2, (b.y - a.y) / 2) };
};
