import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export type SfxName = "whoosh" | "impact" | "tick" | "chime" | "riser" | "swell";

/** Plays a one-shot sound effect starting at an absolute frame. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume = 0.7,
}) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`audio/${name}.mp3`)} volume={volume} />
  </Sequence>
);
