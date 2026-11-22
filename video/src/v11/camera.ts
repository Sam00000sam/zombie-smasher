import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";
import { f, L, TOTAL_FRAMES } from "./timing";

const GAP = 1400;
export const Z = { HK: 1200, HR: 1200 + GAP, RP: 1200 + 2 * GAP, GP: 1200 + 3 * GAP, SP: 1200 + 4 * GAP, EN: 1200 + 5 * GAP };

/** Flights between stops: [leave, arrive]. */
export const FLIGHTS = {
  hr: [L.hook.end + 0.05, L.hours.start + 0.3],
  rp: [L.hours.end + 0.05, L.replica.start + 0.3],
  gp: [L.replica.end + 0.05, L.gap.start + 0.3],
  sp: [L.gap.end + 0.05, L.spend.start + 0.3],
  en: [L.spend.end + 0.05, L.end.start + 0.3],
} as const;

/** Orbit rig: target (tx, ty, tz), distance R, angle th in degrees (0 = from the front), camera height y. */
export type Rig = { tx: number; tz: number; ty: number; R: number; th: number; y: number };
type K = Rig & { at: number; dur: number };
const k = (at: number, dur: number, r: Rig): K => ({ ...r, at, dur });
const rig = (tz: number, th: number, R = 1040, y = 440, tx = 0, ty = 300): Rig => ({ tx, tz, th, R, y, ty });
const stop = (fl: readonly [number, number], next: number, tz: number, a: number, b: number, R = 1040, y = 440): K[] => [
  k(f(fl[1]), f(fl[1]) - f(fl[0]), rig(tz, a, R, y)),
  k(f(next), f(next) - f(fl[1]), rig(tz, b, R - 80, y - 10)),
];

const KEYS: K[] = [
  k(0, 1, rig(Z.HK, 0, 1000, 430)),
  k(f(L.hook.end), f(L.hook.end) - 1, rig(Z.HK, 360, 960, 450)),
  ...stop(FLIGHTS.hr, FLIGHTS.rp[0], Z.HR, 392, 330, 1080, 450),
  ...stop(FLIGHTS.rp, FLIGHTS.gp[0], Z.RP, 326, 392),
  ...stop(FLIGHTS.gp, FLIGHTS.sp[0], Z.GP, 394, 330),
  ...stop(FLIGHTS.sp, FLIGHTS.en[0], Z.SP, 330, 388, 1100, 450),
  ...stop(FLIGHTS.en, TOTAL_FRAMES / 30, Z.EN, 392, 335, 1060),
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
  const y = r.y + Math.cos((frame / 30) * 0.4) * 3;
  return { x: r.tx - r.R * Math.sin(th), y, z: r.tz - r.R * Math.cos(th), yaw: th, pitch: -Math.atan2(y - r.ty, r.R) * 0.55, focus: r.R };
};

export const camSpeed = (frame: number) => {
  const a = camAt(frame - 1);
  const b = camAt(frame + 1);
  return Math.hypot((b.x - a.x) / 2, (b.z - a.z) / 2, (b.y - a.y) / 2);
};
