import { CAMERA_MOVES } from "./timing";
import { prog } from "./anim";

export const cameraAt = (frame: number) => {
  let x = 0;
  let y = 0;
  for (const m of CAMERA_MOVES) {
    const p = prog(frame, m.at, m.dur);
    x += m.dx * p;
    y += m.dy * p;
  }
  return { x, y };
};
