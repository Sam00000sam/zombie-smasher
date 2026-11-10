import { Part } from "../v2/components/Draw";
import { P as V5 } from "../v5/products";

/** Line art for "Real or Fake?" (200×200 boxes), on top of the product drawings from earlier videos. */
export const ART: Record<string, Part[]> = {
  ...V5,
  crown: [
    { t: "path", d: "M32 150 L40 68 L76 108 L100 46 L124 108 L160 68 L168 150 Z" },
    { t: "line", x1: 36, y1: 170, x2: 164, y2: 170 },
    { t: "circle", cx: 40, cy: 60, r: 7 },
    { t: "circle", cx: 100, cy: 38, r: 7 },
    { t: "circle", cx: 160, cy: 60, r: 7 },
    { t: "circle", cx: 100, cy: 128, r: 8 },
  ],
  lock: [
    { t: "rect", x: 58, y: 92, w: 84, h: 76, rx: 12 },
    { t: "path", d: "M74 92 V70 A26 26 0 0 1 126 70 V92" },
    { t: "circle", cx: 100, cy: 124, r: 8 },
    { t: "line", x1: 100, y1: 132, x2: 100, y2: 148 },
  ],
  note: [
    { t: "path", d: "M78 150 V58 L150 42 V132" },
    { t: "line", x1: 78, y1: 80, x2: 150, y2: 64 },
    { t: "circle", cx: 62, cy: 150, r: 17 },
    { t: "circle", cx: 134, cy: 132, r: 17 },
  ],
  plane: [
    { t: "path", d: "M100 22 C109 22 111 40 111 56 L111 86 L176 122 L176 138 L111 118 L111 150 L132 166 L132 177 L100 169 L68 177 L68 166 L89 150 L89 118 L24 138 L24 122 L89 86 L89 56 C89 40 91 22 100 22 Z" },
  ],
  cloud: [{ t: "path", d: "M52 128 A30 30 0 0 1 58 70 A40 40 0 0 1 134 60 A32 32 0 0 1 152 128 Z" }],
  suitcase: [
    { t: "rect", x: 38, y: 70, w: 124, h: 100, rx: 14 },
    { t: "path", d: "M76 70 V52 Q76 44 84 44 L116 44 Q124 44 124 52 V70" },
    { t: "line", x1: 70, y1: 70, x2: 70, y2: 170 },
    { t: "line", x1: 130, y1: 70, x2: 130, y2: 170 },
    { t: "circle", cx: 62, cy: 178, r: 5 },
    { t: "circle", cx: 138, cy: 178, r: 5 },
  ],
  eye: [
    { t: "path", d: "M18 100 Q100 28 182 100 Q100 172 18 100 Z" },
    { t: "circle", cx: 100, cy: 100, r: 28 },
    { t: "circle", cx: 100, cy: 100, r: 9 },
  ],
  slash: [{ t: "line", x1: 38, y1: 168, x2: 162, y2: 32 }],
};
