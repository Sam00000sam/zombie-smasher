import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FONT } from "../v2/theme";
import { p01 } from "../v5/smooth";
import { Cam, INK, Item, V3 } from "../v6/engine";
import { slab } from "../v11/three";

/** Lens for TikTok: content above y ≈ 1330, captions in their own band below it (top 1400). */
export const SAFE_CX = 500;
export const VIEW_TT = { f: 1010, cx: SAFE_CX, cy: 720, billboard: true };
export const CAPTION_TOP = 1400;

export const inn = (fr: number, at: number, d = 12) => p01(fr, at, d);
/** Text slabs turn with the camera but trail it a little, so their thickness shows. */
export const Y = (c: Cam) => c.yaw - 0.22;

export const Face: React.FC<{ col: string; children: React.ReactNode; solid?: boolean }> = ({ col, children, solid }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 18,
      border: `4px solid ${col}`,
      background: solid ? col : "linear-gradient(180deg, rgba(30,30,40,0.95), rgba(6,6,10,0.95) 55%)",
      boxShadow: `0 0 26px ${col}, inset 0 2px 0 rgba(255,255,255,0.35), inset 0 0 18px ${col}55`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      fontFamily: FONT,
      color: solid ? "#000" : col,
      fontWeight: 900,
      textAlign: "center",
      lineHeight: 1.02,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
export const Small: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = INK }) => <div style={{ fontSize: 22, letterSpacing: "0.26em", paddingLeft: "0.26em", color: c, fontWeight: 800 }}>{children}</div>;
export const Big: React.FC<{ children: React.ReactNode; s?: number; c?: string }> = ({ children, s = 64, c }) => <div style={{ fontSize: s, letterSpacing: "0.02em", color: c, textShadow: c ? `0 0 18px ${c}` : undefined }}>{children}</div>;

export const tagSlab = (c: Cam, key: string, p: V3, w: number, h: number, op: number, col: string, small: string, big: string, s = 60): Item | null =>
  slab(c, key, { p, w, h, yaw: Y(c), opacity: op, depth: 20, layers: 8, children: <Face col={col}><Small>{small}</Small><Big s={s}>{big}</Big></Face> });
export const lineSlab = (c: Cam, key: string, p: V3, w: number, h: number, op: number, col: string, text: React.ReactNode, s = 48, solid = false): Item | null =>
  slab(c, key, { p, w, h, yaw: Y(c), opacity: op, depth: 20, layers: 8, children: <Face col={col} solid={solid}><Big s={s}>{text}</Big></Face> });

/** Sparse sound effects: each cue plays one file from public/sfx at a frame. */
export type Sfx = { at: number; file: "whoosh" | "pop" | "chime" | "shimmer" | "knock"; vol: number };
export const SfxTrack: React.FC<{ cues: Sfx[] }> = ({ cues }) => (
  <>
    {cues.map((s, i) => (
      <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={54} layout="none">
        <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.vol} />
      </Sequence>
    ))}
  </>
);
