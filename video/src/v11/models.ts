import { circle, decal, extrude, merge, Mesh } from "./three";

type P2 = [number, number];
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
  });
const roundRect = (w: number, h: number, r: number, y0 = 0): P2[] => {
  const x = w / 2;
  return [
    ...arc(x - r, y0 + r, r, r, -Math.PI / 2, 0, 4),
    ...arc(x - r, y0 + h - r, r, r, 0, Math.PI / 2, 4),
    ...arc(-x + r, y0 + h - r, r, r, Math.PI / 2, Math.PI, 4),
    ...arc(-x + r, y0 + r, r, r, Math.PI, (3 * Math.PI) / 2, 4),
  ];
};

/** Structured top-handle handbag (~240 wide, ~250 tall incl. handle), base at y = 0. */
export const BAG: Mesh = (() => {
  const D = 90;
  const body: P2[] = [[-112, 6], [-106, 0], [106, 0], [112, 6], [100, 150], [92, 158], [-92, 158], [-100, 150]];
  const handle = extrude([{ pts: [...arc(0, 158, 58, 78, Math.PI, 0, 18)] }], 14, 2);
  return merge(
    extrude([{ pts: body, closed: true }], D, 2),
    handle,
    decal(
      [
        [[-98, 152], [-70, 112], [0, 98], [70, 112], [98, 152]],
        [[-86, 140], [-62, 116], [0, 106], [62, 116], [86, 140]],
        [[-14, 112], [14, 112], [14, 92], [-14, 92], [-14, 112]],
        [[-94, 16], [94, 16]],
      ],
      D,
    ),
  );
})();

/** Rolling suitcase (~210 × 230), base at y = 0. */
export const SUITCASE: Mesh = merge(
  extrude([{ pts: roundRect(200, 190, 18, 20), closed: true }], 80, 3),
  extrude([{ pts: [[-40, 210], [-40, 250], [40, 250], [40, 210]] }], 12, 1),
  decal([[[-55, 30], [-55, 200]], [[55, 30], [55, 200]], [[-80, 10], [-80, 20]], [[80, 10], [80, 20]]], 80),
);

/** Phone (~120 × 230) standing on its edge, base at y = 0. */
export const PHONE: Mesh = merge(
  extrude([{ pts: roundRect(120, 230, 20, 0), closed: true }], 14, 3),
  decal([roundRect(100, 190, 12, 22).concat([roundRect(100, 190, 12, 22)[0]]), [[-18, 220], [18, 220]]], 14),
);

/** Safe (~200 cube) with a dial and handle, base at y = 0. */
export const SAFE: Mesh = merge(
  extrude([{ pts: roundRect(200, 200, 14, 0), closed: true }], 170, 3),
  decal([circle(34, 24).map(([x, y]) => [x - 20, y + 100] as P2).concat([[14, 100]]), [[-20, 100], [-20, 124]], [[50, 70], [50, 130]], [[-80, 20], [80, 20], [80, 180], [-80, 180], [-80, 20]]], 170),
);

/** Wall clock disc (radius 110) with tick marks; hands are added per frame. */
export const clockFace = (hourA: number, minA: number): Mesh => {
  const ticks: P2[][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [[Math.sin(a) * 88, Math.cos(a) * 88], [Math.sin(a) * 100, Math.cos(a) * 100]];
  });
  return merge(
    extrude([{ pts: circle(110, 40), closed: true }], 26, 4),
    decal([...ticks, [[0, 0], [Math.sin(hourA) * 52, Math.cos(hourA) * 52]], [[0, 0], [Math.sin(minA) * 82, Math.cos(minA) * 82]]], 26),
  );
};
