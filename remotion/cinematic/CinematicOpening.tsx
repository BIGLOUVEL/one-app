import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BRAND } from "../OneCinematicAd";

export const CinematicOpening: React.FC = () => {
  const frame = useCurrentFrame();

  // Light beam reveal animation
  const lightReveal = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Logo fade in
  const logoOpacity = interpolate(frame, [25, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Logo subtle scale
  const logoScale = interpolate(frame, [25, 60], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Glow intensity pulse
  const glowIntensity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Horizontal light sweep */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${BRAND.green}60 50%, transparent 100%)`,
          transform: `translateX(${interpolate(lightReveal, [0, 1], [-100, 100])}%)`,
          opacity: interpolate(lightReveal, [0, 0.5, 1], [0, 1, 0]),
          filter: "blur(1px)",
        }}
      />

      {/* Soft glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.green}15 0%, transparent 60%)`,
          filter: "blur(60px)",
          opacity: glowIntensity * 0.8,
          transform: `scale(${1 + glowIntensity * 0.2})`,
        }}
      />

      {/* Main logo container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        {/* Logo mark - minimalist circle with line */}
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            marginBottom: 20,
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${BRAND.gray700}`,
              opacity: 0.6,
            }}
          />
          {/* Inner filled circle */}
          <div
            style={{
              position: "absolute",
              inset: 20,
              borderRadius: "50%",
              background: BRAND.green,
              boxShadow: `0 0 30px ${BRAND.green}50`,
            }}
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: BRAND.bg,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* ONE wordmark */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: BRAND.white,
            textShadow: `0 0 ${40 * glowIntensity}px ${BRAND.green}30`,
          }}
        >
          ONE
        </div>

        {/* Subtle underline */}
        <div
          style={{
            width: interpolate(frame, [50, 70], [0, 120], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            height: 1,
            background: `linear-gradient(90deg, transparent, ${BRAND.gray500}, transparent)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
