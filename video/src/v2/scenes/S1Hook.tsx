import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";
import { DrawLine, LineArt } from "../components/Draw";
import { PRODUCTS } from "../components/Products";
import { PriceTag } from "../components/PriceTag";
import { At, GlowText } from "../components/Text";
import { Kicker, SceneLayer } from "../components/SceneLayer";
import { CUE, f, ORIGIN, SCENES } from "../timing";

/** Hero product position at the hand-off to scene 2 (must match S2's start). */
export const HERO = { x: 960, y: 430, size: 340 };

export const S1Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const hook = f(CUE.hook);
  const when = f(CUE.when);
  const end = SCENES.hook.to;
  const draw = prog(fr, hook, 48);
  const base = prog(fr, hook + 20, 30);
  const leave = 1 - prog(fr, end - 16, 14);

  return (
    <SceneLayer
      win={SCENES.hook}
      origin={ORIGIN.hook}
      world={
        <>
          <LineArt parts={PRODUCTS.headphones} p={draw} x={HERO.x} y={HERO.y} size={HERO.size} width={2.6} />
          <DrawLine x1={960} y1={598} x2={740} y2={598} p={base} opacity={0.3 * leave} width={1.2} />
          <DrawLine x1={960} y1={598} x2={1180} y2={598} p={base} opacity={0.3 * leave} width={1.2} />
          <PriceTag x={1235} y={318} start={f(CUE.hundreds)} value={349} opacity={leave} />
        </>
      }
      screen={
        <>
          <Kicker n="01" title="The hook" start={hook} out={end - 14} />
          <At x={960} y={680} w={1600}>
            <GlowText text="WHY PAY MORE?" start={hook + 2} size={64} out={when - 6} />
          </At>
          <At x={960} y={690} w={1700}>
            <GlowText text="WHEN YOU CAN GET THE SAME VALUE FOR LESS?" start={when + 2} size={42} stagger={0.7} out={end - 16} />
          </At>
        </>
      }
    />
  );
};
