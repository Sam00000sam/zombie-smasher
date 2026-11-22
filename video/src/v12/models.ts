import { arcPts, boxS, combine, cylS, decalS, extrudeS, latheS, roundRect, SMesh, thicken } from "./solid";

type P2 = [number, number];
/** Structured top-handle handbag (~230 wide, ~240 tall with handle), base at y = 0. */
export const BAG_S: SMesh = (() => {
  const D = 92;
  const body: P2[] = [
    ...arcPts(-100, 12, 12, 12, Math.PI, 1.5 * Math.PI, 4).slice(0, 4),
    ...arcPts(100, 12, 12, 12, 1.5 * Math.PI, 2 * Math.PI, 4).slice(0, 4),
    [104, 140],
    ...arcPts(90, 146, 12, 12, 0, 0.5 * Math.PI, 4).slice(0, 4),
    ...arcPts(-90, 146, 12, 12, 0.5 * Math.PI, Math.PI, 4).slice(0, 4),
    [-104, 140],
  ];
  const b = decalS(
    extrudeS(body, D, 40),
    [
      [[-96, 150], [-64, 110], [0, 96], [64, 110], [96, 150]],
      [[-84, 140], [-58, 114], [0, 104], [58, 114], [84, 140]],
      [[-15, 110], [15, 110], [15, 90], [-15, 90], [-15, 110]],
      [[-92, 18], [92, 18]],
    ],
    D,
  );
  const handle = extrudeS(thicken(arcPts(0, 154, 56, 76, Math.PI, 0, 20), 12), 14, 50);
  return combine(b, handle);
})();

/** A pawn figure turned on a lathe: base, body, head. Base at y = 0, ~230 tall. */
export const PAWN_S: SMesh = combine(
  latheS([[0, 0], [62, 0], [64, 12], [52, 24], [40, 60], [33, 120], [38, 150], [30, 166], [0, 168]], 30, [1, 2, 6]),
  latheS(arcPts(0, 196, 30, 30, -Math.PI / 2, Math.PI / 2, 10).map(([x, y]) => [Math.max(0, x), y] as P2), 30),
);
export const pedestalS = (r = 135, h = 50) => cylS(r, h, 0, 40);
/** A thin ring (magnifier) of radius r, band t, depth d, facing -z. */
export const ringS = (r: number, t = 10, d = 10) => extrudeS(thicken(arcPts(0, 0, r, r, -Math.PI / 2, 1.5 * Math.PI - 0.05, 40), t), d, 60);
/** Open shelving unit: cols × rows cubbies of size s, board thickness b, depth d; base at y = 0. */
export const shelfS = (cols: number, rows: number, s: number, b = 10, d = 90): SMesh => {
  const W = cols * s + b;
  const Hh = rows * s + b;
  const parts: SMesh[] = [];
  const shift = (m: SMesh, dx: number, dy: number): SMesh => ({ faces: m.faces.map((f) => ({ ...f, pts: f.pts.map((p) => [p[0] + dx, p[1] + dy, p[2]]) })), decals: [] });
  for (let r = 0; r <= rows; r++) parts.push(shift(boxS(W, b, d), 0, r * s));
  for (let k = 0; k <= cols; k++) parts.push(shift(boxS(b, Hh, d), -W / 2 + b / 2 + k * s, 0));
  return combine(...parts);
};
/** Phone, standing (for later use). */
export const PHONE_S: SMesh = decalS(extrudeS(roundRect(120, 230, 20, 0), 14, 40), [[[-40, 214], [40, 214]]], 14);
