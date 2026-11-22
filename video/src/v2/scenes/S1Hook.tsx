import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { PriceCard } from "../components/Card";
import { Floor, Halo } from "../components/Glow";
import { At, GlowText } from "../components/Text";
import { SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES } from "../timing";

/** Hero product position at the hand-off to scene 2 (must match S2's start). */
export const HERO = { x: 820, y: 430, size: 330 };

export const S1Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const hook = f(CUE.hook);
  const when = f(CUE.when);
  const end = SCENES.hook.to;
  const leave = 1 - prog(fr, end - 14, 12);

  return (
    <SceneLayer
      win={SCENES.hook}
      origin={ORIGIN.hook}
      push={0}
      world={
        <>
          <Halo x={HERO.x} y={HERO.y + 10} r={300} o={prog(fr, hook, 40)} />
          <LineArt parts={PRODUCTS.headphones} p={prog(fr, hook, 46)} x={HERO.x} y={HERO.y} size={HERO.size} width={2.6} />
          <Floor x={HERO.x} y={HERO.y + 150} w={420} p={prog(fr, hook + 18, 26)} o={0.45 * leave} />
          <PriceCard x={1250} y={380} start={f(CUE.hundreds) - 4} label="Brand name" value={349} opacity={leave} />
        </>
      }
      screen={
        <>
          <At x={960} y={700} w={1700}>
            <GlowText text="WHY PAY MORE?" start={hook + 4} size={52} out={when - 6} />
          </At>
          <At x={960} y={712} w={1700}>
            <GlowText text="WHEN YOU CAN GET THE SAME VALUE FOR LESS?" start={when + 2} size={30} stagger={0.6} out={end - 14} />
          </At>
        </>
      }
    />
  );
};
