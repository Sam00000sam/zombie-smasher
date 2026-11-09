import { Part } from "./Draw";

/** Original minimalist line-art products, each in a 200×200 box. */
export const PRODUCTS: Record<string, Part[]> = {
  headphones: [
    { t: "path", d: "M40 120 C40 44 160 44 160 120" },
    { t: "path", d: "M53 117 C53 62 147 62 147 117" },
    { t: "rect", x: 26, y: 108, w: 36, h: 64, rx: 15 },
    { t: "rect", x: 138, y: 108, w: 36, h: 64, rx: 15 },
    { t: "rect", x: 62, y: 116, w: 11, h: 48, rx: 5 },
    { t: "rect", x: 127, y: 116, w: 11, h: 48, rx: 5 },
    { t: "circle", cx: 44, cy: 140, r: 6 },
    { t: "circle", cx: 156, cy: 140, r: 6 },
  ],
  sneaker: [
    { t: "path", d: "M18 128 L182 128 Q190 128 190 136 Q190 144 182 144 L22 144 Q12 144 12 136 Q12 128 18 128 Z" },
    { t: "path", d: "M20 128 C18 108 26 96 46 92 L78 70 C86 64 96 66 100 74 L112 94 C132 98 162 104 178 112 C186 116 188 122 186 128" },
    { t: "path", d: "M46 92 C50 82 60 76 72 72" },
    { t: "line", x1: 82, y1: 80, x2: 94, y2: 92 },
    { t: "line", x1: 90, y1: 74, x2: 102, y2: 86 },
    { t: "line", x1: 97, y1: 70, x2: 108, y2: 82 },
    { t: "path", d: "M58 116 Q104 100 150 114" },
    { t: "path", d: "M150 108 C166 112 176 118 182 126" },
  ],
  phone: [
    { t: "rect", x: 62, y: 24, w: 76, h: 152, rx: 15 },
    { t: "rect", x: 70, y: 40, w: 60, h: 118, rx: 6 },
    { t: "line", x1: 90, y1: 32, x2: 110, y2: 32 },
    { t: "line", x1: 78, y1: 58, x2: 118, y2: 58 },
    { t: "line", x1: 78, y1: 70, x2: 104, y2: 70 },
    { t: "rect", x: 78, y: 84, w: 44, h: 32, rx: 4 },
    { t: "line", x1: 92, y1: 168, x2: 108, y2: 168 },
  ],
  watch: [
    { t: "path", d: "M82 20 L118 20 L122 60 L78 60 Z" },
    { t: "path", d: "M78 140 L122 140 L118 180 L82 180 Z" },
    { t: "circle", cx: 100, cy: 100, r: 44 },
    { t: "circle", cx: 100, cy: 100, r: 35 },
    { t: "rect", x: 144, y: 94, w: 8, h: 12, rx: 2 },
    { t: "line", x1: 100, y1: 70, x2: 100, y2: 76 },
    { t: "line", x1: 130, y1: 100, x2: 124, y2: 100 },
    { t: "line", x1: 100, y1: 130, x2: 100, y2: 124 },
    { t: "line", x1: 70, y1: 100, x2: 76, y2: 100 },
    { t: "line", x1: 100, y1: 100, x2: 100, y2: 80 },
    { t: "line", x1: 100, y1: 100, x2: 115, y2: 108 },
  ],
  earbuds: [
    { t: "rect", x: 56, y: 100, w: 88, h: 64, rx: 28 },
    { t: "line", x1: 58, y1: 122, x2: 142, y2: 122 },
    { t: "circle", cx: 100, cy: 142, r: 3 },
    { t: "path", d: "M70 38 C58 38 54 54 64 60 L68 84 Q70 90 76 88 L78 62 C86 56 84 38 70 38 Z" },
    { t: "path", d: "M130 38 C142 38 146 54 136 60 L132 84 Q130 90 124 88 L122 62 C114 56 116 38 130 38 Z" },
  ],
};

/** 24×24 line icons. */
export const ICONS: Record<string, Part[]> = {
  check: [{ t: "path", d: "M5 12.5 L10 17.5 L19.5 7" }],
  warn: [
    { t: "path", d: "M12 3.5 L21.5 20 L2.5 20 Z" },
    { t: "line", x1: 12, y1: 9.5, x2: 12, y2: 14 },
    { t: "line", x1: 12, y1: 16.8, x2: 12, y2: 17 },
  ],
  varies: [{ t: "path", d: "M4 12 Q8 7.5 12 12 T20 12" }],
  ring: [{ t: "circle", cx: 12, cy: 12, r: 10 }],
};
