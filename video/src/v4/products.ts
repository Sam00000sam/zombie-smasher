import { Part } from "../v2/components/Draw";
import { P as V3 } from "../v3/products";

/** Extra line art for the "label" video (200×200 boxes). */
export const P: Record<string, Part[]> = {
  ...V3,
  tote: [
    { t: "path", d: "M50 82 L150 82 L162 178 L38 178 Z" },
    { t: "path", d: "M72 82 C72 34 94 34 94 82" },
    { t: "path", d: "M106 82 C106 34 128 34 128 82" },
    { t: "line", x1: 44, y1: 124, x2: 156, y2: 124 },
  ],
  clutch: [
    { t: "path", d: "M30 90 L170 90 Q178 90 178 98 L178 150 Q178 158 170 158 L30 158 Q22 158 22 150 L22 98 Q22 90 30 90 Z" },
    { t: "path", d: "M22 98 L100 132 L178 98" },
    { t: "circle", cx: 100, cy: 132, r: 5 },
  ],
  crossbody: [
    { t: "rect", x: 50, y: 100, w: 100, h: 80, rx: 18 },
    { t: "path", d: "M58 104 C40 22 160 22 142 104" },
    { t: "line", x1: 50, y1: 122, x2: 150, y2: 122 },
    { t: "circle", cx: 100, cy: 134, r: 5 },
  ],
  backpack: [
    { t: "path", d: "M60 150 Q60 66 100 66 Q140 66 140 150 L146 172 Q148 182 136 182 L64 182 Q52 182 54 172 Z" },
    { t: "rect", x: 74, y: 128, w: 52, h: 40, rx: 10 },
    { t: "line", x1: 74, y1: 140, x2: 126, y2: 140 },
    { t: "path", d: "M88 66 Q100 44 112 66" },
  ],
  crest: [
    { t: "circle", cx: 100, cy: 100, r: 60 },
    { t: "circle", cx: 100, cy: 100, r: 48 },
    { t: "path", d: "M78 126 L100 72 L122 126 M86 106 H114" },
  ],
  megaphone: [
    { t: "path", d: "M44 86 L44 116 L76 116 L140 150 L140 52 L76 86 Z" },
    { t: "path", d: "M76 116 L86 152 L100 152 L92 118" },
    { t: "path", d: "M156 82 Q168 101 156 120" },
    { t: "path", d: "M168 70 Q186 101 168 132" },
  ],
  store: [
    { t: "path", d: "M38 72 L162 72 L172 98 L28 98 Z" },
    { t: "line", x1: 64, y1: 72, x2: 58, y2: 98 },
    { t: "line", x1: 100, y1: 72, x2: 100, y2: 98 },
    { t: "line", x1: 136, y1: 72, x2: 142, y2: 98 },
    { t: "rect", x: 40, y: 98, w: 120, h: 82 },
    { t: "rect", x: 58, y: 124, w: 30, h: 56 },
    { t: "rect", x: 104, y: 118, w: 40, h: 30 },
  ],
  house: [
    { t: "path", d: "M36 102 L100 48 L164 102" },
    { t: "path", d: "M54 92 L54 170 L146 170 L146 92" },
    { t: "rect", x: 88, y: 124, w: 26, h: 46 },
    { t: "rect", x: 116, y: 108, w: 22, h: 20 },
  ],
};
