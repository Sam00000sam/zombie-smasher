import { Part } from "../v2/components/Draw";
import { PRODUCTS as BASE } from "../v2/components/Products";

const sneaker = BASE.sneaker;

/** Line-art products for this video (200×200 boxes), building on the shared set. */
export const P: Record<string, Part[]> = {
  ...BASE,
  // brand emblem on the side of the "genuine" shoe
  sneakerGenuine: [...sneaker, { t: "circle", cx: 128, cy: 112, r: 7 }, { t: "path", d: "M124 112 L127 115 L132 109" }],
  // the copy: same silhouette, emblem slightly off
  sneakerFake: [...sneaker, { t: "circle", cx: 128, cy: 112, r: 7 }, { t: "path", d: "M124 110 L128 115 L131 109" }],
  sneakerStripes: [
    ...sneaker,
    { t: "line", x1: 118, y1: 103, x2: 130, y2: 124 },
    { t: "line", x1: 130, y1: 105, x2: 142, y2: 124 },
    { t: "line", x1: 142, y1: 107, x2: 154, y2: 124 },
  ],
  sneakerHigh: [
    sneaker[0],
    { t: "path", d: "M20 128 C18 100 22 62 40 54 L70 50 C80 50 84 56 86 62 L112 94 C132 98 162 104 178 112 C186 116 188 122 186 128" },
    { t: "line", x1: 60, y1: 62, x2: 74, y2: 66 },
    { t: "line", x1: 62, y1: 74, x2: 80, y2: 78 },
    { t: "line", x1: 66, y1: 86, x2: 90, y2: 88 },
    { t: "path", d: "M150 108 C166 112 176 118 182 126" },
  ],
  handbag: [
    { t: "path", d: "M40 82 L160 82 L172 168 Q173 178 163 178 L37 178 Q27 178 28 168 Z" },
    { t: "path", d: "M70 82 C70 38 130 38 130 82" },
    { t: "path", d: "M40 82 L100 120 L160 82" },
    { t: "circle", cx: 100, cy: 120, r: 6 },
  ],
  sunglasses: [
    { t: "path", d: "M22 86 L92 86 Q97 86 96 92 L91 122 Q89 134 76 134 L42 134 Q29 134 28 122 Z" },
    { t: "path", d: "M178 86 L108 86 Q103 86 104 92 L109 122 Q111 134 124 134 L158 134 Q171 134 172 122 Z" },
    { t: "path", d: "M96 94 Q100 88 104 94" },
    { t: "line", x1: 22, y1: 88, x2: 8, y2: 82 },
    { t: "line", x1: 178, y1: 88, x2: 192, y2: 82 },
    { t: "line", x1: 40, y1: 100, x2: 52, y2: 92 },
    { t: "line", x1: 120, y1: 100, x2: 132, y2: 92 },
  ],
  cap: [
    { t: "path", d: "M42 132 C42 76 140 70 152 124 L152 132 Z" },
    { t: "path", d: "M152 126 Q184 128 194 138 L118 138 Q112 132 120 130" },
    { t: "circle", cx: 96, cy: 76, r: 5 },
    { t: "path", d: "M96 81 C88 98 88 114 92 132" },
    { t: "path", d: "M70 88 C64 104 62 118 64 132" },
  ],
};
