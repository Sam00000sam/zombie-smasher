import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { OVERLAP, S, TOTAL } from "./lib/theme";
import { SceneFade } from "./components/SceneFade";
import { Sfx } from "./components/Sfx";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Price } from "./scenes/Scene2Price";
import { CARD_FOCUS, Scene3Function } from "./scenes/Scene3Function";
import { LOOK_AT, Scene4Choice } from "./scenes/Scene4Choice";
import { ROW_START, ROW_STEP, Scene5Reality } from "./scenes/Scene5Reality";
import { Scene6End } from "./scenes/Scene6End";

const scenes = [
  { from: S.hook, to: S.price, C: Scene1Hook, name: "1 · The Hook" },
  { from: S.price, to: S.func, C: Scene2Price, name: "2 · The Price Difference" },
  { from: S.func, to: S.choice, C: Scene3Function, name: "3 · The Functionality" },
  { from: S.choice, to: S.reality, C: Scene4Choice, name: "4 · The Freedom of Choice" },
  { from: S.reality, to: S.end, C: Scene5Reality, name: "5 · The Reality Check" },
  { from: S.end, to: TOTAL, C: Scene6End, name: "6 · The Conclusion" },
];

/** Sound-effect cues, all expressed against the same scene timings as the visuals. */
const Cues: React.FC = () => (
  <>
    {/* scene 1 */}
    <Sfx name="swell" at={0} volume={0.55} />
    <Sfx name="impact" at={S.hook + 92} volume={0.85} />
    <Sfx name="whoosh" at={S.hook + 168} volume={0.55} />

    {/* scene 2 */}
    <Sfx name="whoosh" at={S.price - 6} volume={0.6} />
    <Sfx name="whoosh" at={S.price + 22} volume={0.35} />
    <Sfx name="whoosh" at={S.price + 50} volume={0.35} />
    <Sfx name="impact" at={S.price + 96} volume={0.7} />
    <Sfx name="impact" at={S.price + 138} volume={0.55} />
    <Sfx name="chime" at={S.price + 176} volume={0.5} />
    <Sfx name="whoosh" at={S.price + 206} volume={0.5} />
    {[26, 44, 62].map((d) => (
      <Sfx key={d} name="tick" at={S.price + 212 + d} volume={0.5} />
    ))}

    {/* scene 3 */}
    <Sfx name="whoosh" at={S.func - 6} volume={0.6} />
    {CARD_FOCUS.slice(1).map((f) => (
      <Sfx key={f} name="whoosh" at={S.func + f - 22} volume={0.45} />
    ))}
    {CARD_FOCUS.flatMap((f) =>
      [0, 1, 2].map((k) => <Sfx key={`${f}-${k}`} name="tick" at={S.func + f + 14 + k * 12} volume={0.35} />),
    )}

    {/* scene 4 */}
    <Sfx name="whoosh" at={S.choice - 6} volume={0.6} />
    {LOOK_AT.map((k) => (
      <Sfx key={k.f} name="whoosh" at={S.choice + k.f - 14} volume={0.22} />
    ))}
    <Sfx name="impact" at={S.choice + 334} volume={0.7} />

    {/* scene 5 */}
    <Sfx name="whoosh" at={S.reality - 6} volume={0.6} />
    {[0, 1, 2, 3].map((r) => (
      <Sfx key={r} name="chime" at={S.reality + ROW_START + r * ROW_STEP} volume={0.28} />
    ))}
    <Sfx name="impact" at={S.reality + 238} volume={0.75} />
    <Sfx name="chime" at={S.reality + 300} volume={0.4} />

    {/* scene 6 */}
    <Sfx name="whoosh" at={S.end - 6} volume={0.6} />
    <Sfx name="impact" at={S.end + 26} volume={0.5} />
    <Sfx name="whoosh" at={S.end + 172} volume={0.5} />
    <Sfx name="riser" at={S.end + 188} volume={0.7} />
    <Sfx name="impact" at={S.end + 308} volume={1} />
    <Sfx name="chime" at={S.end + 330} volume={0.45} />
  </>
);

export const WhyFakeProducts: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map(({ from, to, C, name }, i) => {
        const last = i === scenes.length - 1;
        return (
          <Sequence key={name} from={from} durationInFrames={to - from + (last ? 0 : OVERLAP)} name={name}>
            <SceneFade fadeIn={i > 0} fadeOut={!last}>
              <C />
            </SceneFade>
          </Sequence>
        );
      })}

      <Audio
        src={staticFile("audio/music.mp3")}
        volume={(f) => 0.62 * interpolate(f, [0, 45, TOTAL - 60, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Cues />
    </AbsoluteFill>
  );
};
