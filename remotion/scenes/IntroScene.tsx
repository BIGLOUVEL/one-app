import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../OneInstagramAd";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "ONE" logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: 30,
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow intensity
  const glowIntensity = interpolate(
    frame,
    [20, 40, 60, 80],
    [0, 1, 0.6, 0],
    { extrapolateRight: "clamp" }
  );

  // Tagline animation
  const taglineOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [35, 55], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Exit animation
  const exitOpacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
  });

  const exitScale = interpolate(frame, [70, 90], [1, 0.9], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.greenGlow}${Math.round(glowIntensity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* ONE Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Main Logo Text */}
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: COLORS.white,
            textShadow: `0 0 ${80 * glowIntensity}px ${COLORS.greenGlow}, 0 0 ${160 * glowIntensity}px ${COLORS.green}`,
          }}
        >
          ONE
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          Focus Operating System
        </div>
      </div>

      {/* Animated line accent */}
      <div
        style={{
          position: "absolute",
          bottom: 400,
          width: interpolate(frame, [50, 70], [0, 200], { extrapolateRight: "clamp" }),
          height: 2,
          backgroundColor: COLORS.green,
          boxShadow: `0 0 20px ${COLORS.greenGlow}`,
        }}
      />
    </AbsoluteFill>
  );
};
