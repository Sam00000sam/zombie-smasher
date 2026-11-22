import React from "react";
import { useCurrentFrame } from "remotion";
import { easeOutExpo, prog } from "../lib/anim";
import { C, FONT } from "../lib/theme";

export type IconName = "tag" | "megaphone" | "crown" | "check" | "cross" | "shield" | "warn" | "dot";

export const Icon: React.FC<{ name: IconName; size?: number; color?: string; stroke?: number }> = ({
  name,
  size = 32,
  color = "#fff",
  stroke = 2,
}) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {name === "tag" && (
        <>
          <path {...common} d="M3 12 L12 3 H21 V12 L12 21 Z" />
          <circle cx="16.5" cy="7.5" r="1.4" fill={color} />
        </>
      )}
      {name === "megaphone" && (
        <>
          <path {...common} d="M3 10 v4 h4 l8 5 V5 l-8 5 H3 z" />
          <path {...common} d="M18 9 q3 3 0 6" />
        </>
      )}
      {name === "crown" && <path {...common} d="M3 18 L2 6 L8 11 L12 4 L16 11 L22 6 L21 18 Z" />}
      {name === "check" && <path {...common} d="M4 12.5 L10 18 L20 6" />}
      {name === "cross" && <path {...common} d="M6 6 L18 18 M18 6 L6 18" />}
      {name === "shield" && (
        <>
          <path {...common} d="M12 2.5 L20 5.5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5.5 Z" />
          <path {...common} d="M8 12 L11 15 L16 9" />
        </>
      )}
      {name === "warn" && (
        <>
          <path {...common} d="M12 3 L22 20.5 H2 Z" />
          <path {...common} d="M12 9.5 V14.5" />
          <circle cx="12" cy="17.4" r="1.1" fill={color} />
        </>
      )}
      {name === "dot" && <circle cx="12" cy="12" r="4" fill={color} />}
    </svg>
  );
};

/** Glass pill with icon + label. */
export const Chip: React.FC<{
  icon: IconName;
  label: string;
  start: number;
  color?: string;
  fontSize?: number;
  fromX?: number;
}> = ({ icon, label, start, color = C.gold, fontSize = 40, fromX = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 26, easeOutExpo);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "20px 34px",
        borderRadius: 999,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize,
        letterSpacing: "0.12em",
        color: C.text,
        background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
        border: `1.5px solid ${color}88`,
        boxShadow: `0 0 50px ${color}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
        backdropFilter: "blur(12px)",
        opacity: p,
        transform: `translateX(${(1 - p) * fromX}px) scale(${0.85 + 0.15 * p})`,
        filter: `blur(${(1 - p) * 10}px)`,
        whiteSpace: "nowrap",
      }}
    >
      <Icon name={icon} size={fontSize * 0.95} color={color} stroke={1.8} />
      {label}
    </div>
  );
};
