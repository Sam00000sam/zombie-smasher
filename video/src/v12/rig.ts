import { interpolate } from "remotion";
import { io } from "../v5/smooth";
import { Cam } from "../v6/engine";

/**
 * Orbit rig shared by the single-set videos: the camera circles a target (tx, ty, tz) at distance R
 * and angle th (degrees; 0 = from the front, +90 = from the left looking right), at height y.
 * Keys ease one after another; interpolating the rig (not positions) makes every move an arc.
 */
export type Rig = { tx: number; ty: number; tz: number; R: number; th: number; y: number };
export type Key = Rig & { at: number; dur: number };
export const key = (at: number, dur: number, r: Partial<Rig>, base: Rig): Key => ({ ...base, ...r, at, dur });

export const makeRig = (keys: Key[]) => {
  const rigAt = (frame: number): Rig => {
    const r: Rig = { tx: keys[0].tx, ty: keys[0].ty, tz: keys[0].tz, R: keys[0].R, th: keys[0].th, y: keys[0].y };
    for (const k of keys) {
      const p = interpolate(frame, [k.at - k.dur, k.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: io });
      (Object.keys(r) as (keyof Rig)[]).forEach((n) => {
        r[n] += (k[n] - r[n]) * p;
      });
    }
    return r;
  };
  const camAt = (frame: number): Cam => {
    const r = rigAt(frame);
    const th = (r.th * Math.PI) / 180;
    const y = r.y + Math.cos((frame / 30) * 0.4) * 3;
    return { x: r.tx - r.R * Math.sin(th), y, z: r.tz - r.R * Math.cos(th), yaw: th, pitch: -Math.atan2(y - r.ty, r.R) * 0.6, focus: r.R };
  };
  const camSpeed = (frame: number) => {
    const a = camAt(frame - 1);
    const b = camAt(frame + 1);
    return Math.hypot((b.x - a.x) / 2, (b.z - a.z) / 2, (b.y - a.y) / 2);
  };
  return { rigAt, camAt, camSpeed };
};
