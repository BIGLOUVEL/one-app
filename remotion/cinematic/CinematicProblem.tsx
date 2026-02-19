import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BRAND } from "../OneCinematicAd";

// Blurred UI fragment component
const BlurredFragment: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  frame: number;
}> = ({ x, y, width, height, delay, frame }) => {
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 20, 60, 80], [0, 0.3, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  const blur = interpolate(localFrame, [0, 30], [20, 12], {
    extrapolateRight: "clamp",
  });

  const drift = interpolate(localFrame, [0, 100], [0, -10], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width,
        height,
        background: `linear-gradient(135deg, ${BRAND.bgElevated} 0%, ${BRAND.bgCard} 100%)`,
        borderRadius: 12,
        border: `1px solid ${BRAND.gray700}40`,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${drift}px)`,
      }}
    >
      {/* Fake UI lines */}
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            width: "60%",
            height: 8,
            background: BRAND.gray700,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: "80%",
            height: 6,
            background: BRAND.gray700,
            borderRadius: 3,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            width: "40%",
            height: 6,
            background: BRAND.gray700,
            borderRadius: 3,
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
};

export const CinematicProblem: React.FC = () => {
  const frame = useCurrentFrame();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Text animations - line by line
  const line1Opacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line1Y = interpolate(frame, [15, 40], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line2Y = interpolate(frame, [35, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Exit
  const exitOpacity = interpolate(frame, [115, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  // UI fragments data
  const fragments = [
    { x: 5, y: 15, width: 180, height: 100, delay: 20 },
    { x: 70, y: 10, width: 200, height: 120, delay: 30 },
    { x: 15, y: 70, width: 160, height: 90, delay: 40 },
    { x: 60, y: 65, width: 220, height: 110, delay: 25 },
    { x: 35, y: 40, width: 140, height: 80, delay: 45 },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      {/* Blurred UI fragments in background */}
      {fragments.map((f, i) => (
        <BlurredFragment key={i} {...f} frame={frame} />
      ))}

      {/* Central text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          zIndex: 10,
          padding: "0 60px",
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 500,
            color: BRAND.white,
            letterSpacing: "-0.02em",
            textAlign: "center",
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          Ambitious goals.
        </div>

        {/* Line 2 */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 500,
            color: BRAND.gray500,
            letterSpacing: "-0.02em",
            textAlign: "center",
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
          }}
        >
          No clear path.
        </div>
      </div>

      {/* Subtle gradient overlay for depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, ${BRAND.bg}90 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
