import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../OneInstagramAd";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry
  const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "ONE" number animation
  const oneScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 80 },
    durationInFrames: 35,
  });

  // Glow pulse
  const glowPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.5, 1]
  );

  // Text reveals
  const text1Opacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const text1Y = interpolate(frame, [25, 45], [40, 0], { extrapolateRight: "clamp" });

  const text2Opacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const text2Y = interpolate(frame, [40, 60], [40, 0], { extrapolateRight: "clamp" });

  // Circle expanding animation
  const circleScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 50 },
    durationInFrames: 40,
  });

  // Exit
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
  });

  const exitScale = interpolate(frame, [75, 90], [1, 1.1], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Expanding ring */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: `3px solid ${COLORS.green}`,
          opacity: 0.2 * circleScale,
          transform: `scale(${circleScale})`,
        }}
      />

      {/* Inner glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.greenGlow}20 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: glowPulse,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        {/* "Concentre-toi sur" */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: "0.05em",
            opacity: text1Opacity,
            transform: `translateY(${text1Y}px)`,
          }}
        >
          Concentre-toi sur
        </div>

        {/* The ONE */}
        <div
          style={{
            position: "relative",
            transform: `scale(${oneScale})`,
          }}
        >
          {/* Glow behind number */}
          <div
            style={{
              position: "absolute",
              inset: -60,
              background: `radial-gradient(circle, ${COLORS.greenGlow}40 0%, transparent 60%)`,
              filter: "blur(30px)",
              opacity: glowPulse,
            }}
          />

          {/* Number 1 */}
          <div
            style={{
              fontSize: 320,
              fontWeight: 900,
              color: COLORS.green,
              lineHeight: 0.85,
              textShadow: `0 0 60px ${COLORS.greenGlow}, 0 0 120px ${COLORS.green}50`,
            }}
          >
            1
          </div>
        </div>

        {/* "seule chose" */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.02em",
            opacity: text2Opacity,
            transform: `translateY(${text2Y}px)`,
          }}
        >
          seule chose.
        </div>

        {/* Underline accent */}
        <div
          style={{
            width: interpolate(frame, [55, 70], [0, 300], { extrapolateRight: "clamp" }),
            height: 4,
            backgroundColor: COLORS.green,
            borderRadius: 2,
            boxShadow: `0 0 20px ${COLORS.greenGlow}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
