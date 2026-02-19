import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BRAND } from "../OneCinematicAd";

export const CinematicCTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Logo animations
  const logoOpacity = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const logoScale = interpolate(frame, [5, 35], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Tagline animations
  const line1Opacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line1Y = interpolate(frame, [25, 50], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line2Y = interpolate(frame, [35, 60], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // CTA button animation
  const ctaOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const ctaScale = interpolate(frame, [50, 75], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Glow intensity
  const glowIntensity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Subtle pulse on CTA
  const ctaPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.02, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.green}12 0%, transparent 60%)`,
          filter: "blur(50px)",
          opacity: glowIntensity * 0.8,
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              position: "relative",
              width: 70,
              height: 70,
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
                inset: 18,
                borderRadius: "50%",
                background: BRAND.green,
                boxShadow: `0 0 ${25 * glowIntensity}px ${BRAND.green}50`,
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: BRAND.bg,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* ONE wordmark */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: BRAND.white,
              textShadow: `0 0 ${30 * glowIntensity}px ${BRAND.green}25`,
            }}
          >
            ONE
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: BRAND.gray100,
              letterSpacing: "-0.01em",
              opacity: line1Opacity,
              transform: `translateY(${line1Y}px)`,
            }}
          >
            Reach your goal.
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: BRAND.white,
              letterSpacing: "-0.01em",
              opacity: line2Opacity,
              transform: `translateY(${line2Y}px)`,
            }}
          >
            Make it real.
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale * ctaPulse})`,
            marginTop: 20,
          }}
        >
          <div
            style={{
              background: BRAND.green,
              color: BRAND.bg,
              padding: "18px 48px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: `0 0 30px ${BRAND.green}40, 0 4px 20px rgba(0,0,0,0.3)`,
            }}
          >
            Join ONE
          </div>
        </div>

        {/* Subtle underline */}
        <div
          style={{
            width: interpolate(frame, [70, 90], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            height: 1,
            background: `linear-gradient(90deg, transparent, ${BRAND.gray500}60, transparent)`,
            marginTop: 10,
          }}
        />
      </div>

      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "8%",
          width: 40,
          height: 1,
          background: `linear-gradient(90deg, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "8%",
          width: 1,
          height: 40,
          background: `linear-gradient(180deg, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "8%",
          width: 40,
          height: 1,
          background: `linear-gradient(270deg, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "8%",
          width: 1,
          height: 40,
          background: `linear-gradient(0deg, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
