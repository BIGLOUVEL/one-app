import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../OneInstagramAd";

const DISTRACTIONS = [
  { icon: "📱", label: "Notifications", x: -280, y: -350, delay: 0 },
  { icon: "📧", label: "Emails", x: 250, y: -280, delay: 5 },
  { icon: "💬", label: "Messages", x: -200, y: 100, delay: 10 },
  { icon: "📊", label: "Reports", x: 280, y: 180, delay: 15 },
  { icon: "🔔", label: "Alerts", x: -300, y: 350, delay: 20 },
  { icon: "📋", label: "Tasks", x: 220, y: 400, delay: 25 },
  { icon: "🎯", label: "Goals", x: 0, y: -450, delay: 8 },
  { icon: "⏰", label: "Deadlines", x: -100, y: 480, delay: 18 },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Main question animation
  const questionScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 120 },
    durationInFrames: 25,
  });

  // Chaos intensity increases
  const chaosIntensity = interpolate(frame, [15, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Screen shake effect
  const shakeX = Math.sin(frame * 0.8) * 3 * chaosIntensity;
  const shakeY = Math.cos(frame * 0.6) * 2 * chaosIntensity;

  // Red warning pulse
  const warningPulse = interpolate(
    Math.sin(frame * 0.3),
    [-1, 1],
    [0.1, 0.3]
  ) * chaosIntensity;

  // Exit animation
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Red warning overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255, 50, 50, ${warningPulse}) 0%, transparent 70%)`,
        }}
      />

      {/* Floating distractions */}
      {DISTRACTIONS.map((item, i) => {
        const itemProgress = spring({
          frame: frame - item.delay,
          fps,
          config: { damping: 12, stiffness: 80 },
          durationInFrames: 30,
        });

        const floatY = Math.sin((frame + i * 20) * 0.1) * 10;
        const floatX = Math.cos((frame + i * 15) * 0.08) * 8;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${item.x + floatX}px, ${item.y + floatY}px) scale(${itemProgress})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: itemProgress * chaosIntensity,
            }}
          >
            <div
              style={{
                fontSize: 56,
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
              }}
            >
              {item.icon}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Central question */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          transform: `scale(${questionScale})`,
          zIndex: 10,
        }}
      >
        {/* Glassmorphism card */}
        <div
          style={{
            background: "rgba(15, 17, 21, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: "60px 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Tu bosses sur
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "#ff4444",
              textShadow: "0 0 40px rgba(255, 68, 68, 0.5)",
            }}
          >
            10 trucs
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.1,
              marginTop: 20,
            }}
          >
            à la fois ?
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
