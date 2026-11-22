import { V3 } from "../v6/engine";
import { arcPts, boxS, combine, cylS, decalS, extrudeS, roundRect, SMesh, thicken } from "../v12/solid";

type P2 = [number, number];
/** Apply a rigid map (rotation and/or translation) to a mesh; `rot` must be the rotation part alone. */
export const mapMesh = (m: SMesh, pt: (p: V3) => V3, rot: (n: V3) => V3): SMesh => ({
  faces: m.faces.map((f) => ({ ...f, pts: f.pts.map(pt), n: rot(f.n) })),
  decals: m.decals.map((d) => ({ ...d, pts: d.pts.map(pt) })),
});
const shift = (m: SMesh, dx: number, dy: number, dz: number) => mapMesh(m, (p) => [p[0] + dx, p[1] + dy, p[2] + dz], (n) => n);
/** turn a y-axis shape so its axis lies along x */
const yToX = (m: SMesh) => mapMesh(m, (p) => [p[1], -p[0], p[2]], (n) => [n[1], -n[0], n[2]]);
/** turn a z-depth shape (extruded) so its depth lies along x (a side profile seen from the front becomes side-on) */
const zToX = (m: SMesh) => mapMesh(m, (p) => [p[2], p[1], -p[0]], (n) => [n[2], n[1], -n[0]]);

/** Low-top sneaker (~280 long, ~110 tall), toe pointing +x, base at y = 0. */
export const SNEAKER: SMesh = (() => {
  const D = 96;
  const prof: P2[] = [[-132, 0], [112, 0], [136, 8], [142, 24], [122, 44], [66, 62], [24, 78], [-36, 104], [-92, 108], [-124, 96], [-134, 60], [-138, 22]];
  return decalS(
    extrudeS(prof, D, 34),
    [
      [[-136, 20], [140, 20]],
      [[-4, 74], [40, 60]],
      [[-22, 84], [24, 70]],
      [[-40, 94], [6, 80]],
      [[-112, 40], [-30, 40], [30, 30]],
    ],
    D,
  );
})();

/** Wristwatch standing upright: round case on a strap, face toward -z. Centre ~ y 150. */
export const WATCH: SMesh = (() => {
  const C = 150;
  const caseM = decalS(
    extrudeS(arcPts(0, C, 62, 62, 0, Math.PI * 2 - 0.2, 40), 26, 60),
    [
      ...Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return [[Math.sin(a) * 46, C + Math.cos(a) * 46], [Math.sin(a) * 54, C + Math.cos(a) * 54]] as P2[];
      }),
      [[0, C], [0, C + 38]],
      [[0, C], [26, C - 12]],
    ],
    26,
  );
  const crown = shift(boxS(14, 16, 14), 70, C - 8, 0);
  const strapTop = extrudeS(roundRect(44, 92, 10, C + 56), 12);
  const strapBot = extrudeS(roundRect(44, 92, 10, C - 148), 12);
  return combine(caseM, crown, strapTop, strapBot);
})();

/** Sunglasses facing -z (lenses ~ 120 wide each), arms folding back along +z. Centre ~ y 120. */
export const SHADES: SMesh = (() => {
  const Y = 120;
  const lens = (cx: number): P2[] => roundRect(118, 78, 26, Y - 40, 5).map(([x, y]) => [x + cx, y] as P2);
  const l = extrudeS(lens(-70), 10, 50);
  const r = extrudeS(lens(70), 10, 50);
  const bridge = extrudeS(thicken(arcPts(0, Y + 18, 14, 10, Math.PI, 0, 8), 7), 10, 60);
  const arm = (x: number) => shift(boxS(7, 7, 150), x, Y + 26, 78);
  return combine(l, r, bridge, arm(-128), arm(128));
})();

/** Judge's bench (720 wide, 270 tall, 170 deep), centred on x, front face at z = -85. */
export const BENCH: SMesh = combine(boxS(720, 250, 170), shift(boxS(760, 22, 190), 0, 250, 0));
/** A column (radius 38, 640 tall) with a cap and base. */
export const COLUMN: SMesh = combine(cylS(46, 26, 0, 28), cylS(36, 600, 26, 28), cylS(48, 24, 626, 28));
/** Jury-box rail. */
export const RAIL: SMesh = combine(boxS(420, 120, 26), shift(boxS(440, 14, 40), 0, 120, 0));

/**
 * Gavel pivoting at its handle end (the origin): handle runs back along +z, head across x at z ≈ 150.
 * Rotate with xf.tilt < 0 to lift the head.
 */
export const GAVEL: SMesh = (() => {
  const handle = shift(boxS(14, 14, 160), 0, 0, 80);
  const head = shift(yToX(cylS(30, 116, -58, 24)), 0, 0, 160);
  return combine(handle, head);
})();
/** Sound block the gavel strikes. */
export const BLOCK: SMesh = cylS(46, 14, 0, 28);
export { zToX };
