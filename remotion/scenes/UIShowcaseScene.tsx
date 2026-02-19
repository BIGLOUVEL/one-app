import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../OneInstagramAd";

// Mock UI elements
const MockAppUI: React.FC<{ progress: number; frame: number }> = ({ progress, frame }) => {
  const typing = Math.floor(interpolate(frame, [30, 80], [0, 28], { extrapolateRight: "clamp" }));
  const objectiveText = "Lancer mon SaaS ce mois-ci";

  return (
    <div
      style={{
        width: 380,
        height: 720,
        background: COLORS.background,
        borderRadius: 40,
        border: `2px solid ${COLORS.green}30`,
        overflow: "hidden",
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 60px ${COLORS.green}15`,
        transform: `scale(${progress})`,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "16px 24px",
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.white,
        }}
      >
        <span>9:41</span>
        <span style={{ opacity: 0.7 }}>ONE</span>
        <span>100%</span>
      </div>

      {/* App content */}
      <div style={{ padding: "30px 24px" }}>
        {/* Header */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Ton objectif
        </div>

        {/* Main objective card */}
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.green}40`,
            borderRadius: 20,
            padding: 28,
            marginBottom: 30,
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${COLORS.green}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🔒
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.green,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Locked In
            </span>
          </div>

          {/* Objective text - typing animation */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.3,
              minHeight: 70,
            }}
          >
            {objectiveText.slice(0, typing)}
            <span
              style={{
                display: typing < objectiveText.length ? "inline" : "none",
                color: COLORS.green,
                animation: "blink 0.8s infinite",
              }}
            >
              |
            </span>
          </div>
        </div>

        {/* Progress section */}
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              fontSize: 14,
              color: COLORS.muted,
            }}
          >
            <span>Sessions Focus</span>
            <span style={{ color: COLORS.green, fontWeight: 600 }}>12/20</span>
          </div>
          <div
            style={{
              height: 8,
              background: COLORS.card,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${interpolate(frame, [50, 100], [0, 60], { extrapolateRight: "clamp" })}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.greenGlow})`,
                borderRadius: 4,
                boxShadow: `0 0 20px ${COLORS.greenGlow}`,
              }}
            />
          </div>
        </div>

        {/* Domino chain preview */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          {[...Array(7)].map((_, i) => {
            const isActive = i < Math.floor(interpolate(frame, [60, 110], [0, 5], { extrapolateRight: "clamp" }));
            return (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 48,
                  borderRadius: 6,
                  background: isActive ? COLORS.green : COLORS.card,
                  border: `1px solid ${isActive ? COLORS.green : COLORS.muted}40`,
                  transform: isActive ? "rotate(-15deg)" : "rotate(0deg)",
                  transition: "all 0.3s",
                  boxShadow: isActive ? `0 4px 12px ${COLORS.green}40` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Start Focus button */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenGlow})`,
            borderRadius: 16,
            padding: "20px 32px",
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.background,
            boxShadow: `0 8px 32px ${COLORS.green}40`,
          }}
        >
          Lancer Focus Session
        </div>
      </div>
    </div>
  );
};

export const UIShowcaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry
  const entryOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Phone animation
  const phoneProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 80 },
    durationInFrames: 40,
  });

  // Rotation for 3D effect
  const rotateY = interpolate(frame, [0, 40, 90], [20, 0, -5], {
    extrapolateRight: "clamp",
  });

  // Floating effect
  const floatY = Math.sin(frame * 0.05) * 10;

  // Feature badges
  const features = [
    { text: "Lock Principle", delay: 30, x: -380, y: -200 },
    { text: "Domino Chain", delay: 45, x: 380, y: -100 },
    { text: "Focus Sessions", delay: 60, x: -380, y: 100 },
    { text: "66 Days Challenge", delay: 75, x: 380, y: 200 },
  ];

  // Exit
  const exitOpacity = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        perspective: 1200,
      }}
    >
      {/* Background grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.green}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.green}08 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Feature badges */}
      {features.map((feature, i) => {
        const badgeProgress = spring({
          frame: frame - feature.delay,
          fps,
          config: { damping: 12, stiffness: 100 },
          durationInFrames: 25,
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${feature.x}px, ${feature.y}px) scale(${badgeProgress})`,
              background: COLORS.card,
              border: `1px solid ${COLORS.green}30`,
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.white,
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: badgeProgress,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.green,
                boxShadow: `0 0 10px ${COLORS.greenGlow}`,
              }}
            />
            {feature.text}
          </div>
        );
      })}

      {/* Phone mockup */}
      <div
        style={{
          transform: `rotateY(${rotateY}deg) translateY(${floatY}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        <MockAppUI progress={phoneProgress} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
