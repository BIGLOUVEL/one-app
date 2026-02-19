import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../OneInstagramAd";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Logo animation
  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: 30,
  });

  // CTA button animation
  const buttonScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, stiffness: 80 },
    durationInFrames: 35,
  });

  // Button pulse
  const buttonPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.98, 1.02]
  );

  // Glow intensity
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.4, 1]
  );

  // Tagline reveal
  const taglineOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [40, 60], [30, 0], {
    extrapolateRight: "clamp",
  });

  // URL reveal
  const urlOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Particles effect
  const particles = [...Array(20)].map((_, i) => ({
    x: Math.sin(i * 0.8) * 400 + Math.sin(frame * 0.02 + i) * 30,
    y: Math.cos(i * 0.6) * 600 + Math.cos(frame * 0.015 + i * 0.5) * 40,
    size: 4 + Math.sin(i) * 2,
    opacity: 0.3 + Math.sin(frame * 0.05 + i) * 0.2,
  }));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity,
      }}
    >
      {/* Radial gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${COLORS.green}15 0%, transparent 60%)`,
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: COLORS.green,
            opacity: p.opacity * glowIntensity,
            boxShadow: `0 0 ${p.size * 3}px ${COLORS.greenGlow}`,
          }}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              inset: -100,
              background: `radial-gradient(circle, ${COLORS.greenGlow}30 0%, transparent 60%)`,
              filter: "blur(40px)",
              opacity: glowIntensity,
            }}
          />

          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: COLORS.white,
              textShadow: `0 0 80px ${COLORS.greenGlow}`,
            }}
          >
            ONE
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 700,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          Finis ce qui compte.
          <br />
          <span style={{ color: COLORS.green }}>Vraiment.</span>
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${buttonScale * buttonPulse})`,
            opacity: buttonScale,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenGlow})`,
              borderRadius: 100,
              padding: "28px 80px",
              fontSize: 32,
              fontWeight: 800,
              color: COLORS.background,
              boxShadow: `0 10px 50px ${COLORS.green}50, 0 0 100px ${COLORS.greenGlow}30`,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Essayer Gratuit
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: "0.05em",
            opacity: urlOpacity,
          }}
        >
          <span style={{ color: COLORS.green }}>one</span>focus.app
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [70, 90], [0, 400], { extrapolateRight: "clamp" }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.green}, transparent)`,
        }}
      />

      {/* "Swipe up" indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: interpolate(frame, [80, 95], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            width: 30,
            height: 50,
            border: `2px solid ${COLORS.muted}`,
            borderRadius: 15,
            display: "flex",
            justifyContent: "center",
            paddingTop: 8,
          }}
        >
          <div
            style={{
              width: 4,
              height: 12,
              background: COLORS.green,
              borderRadius: 2,
              transform: `translateY(${Math.sin(frame * 0.2) * 8}px)`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
