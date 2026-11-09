import React from "react";
import { LineArt } from "./Draw";
import { ICONS } from "./Products";
import { INK } from "../theme";

export const Icon: React.FC<{ name: keyof typeof ICONS; x: number; y: number; p: number; size?: number; color?: string; width?: number }> = ({
  name,
  x,
  y,
  p,
  size = 30,
  color = INK,
  width = 2.2,
}) => <LineArt parts={ICONS[name]} p={p} x={x} y={y} size={size} viewBox={24} width={width} color={color} spread={0.3} />;
