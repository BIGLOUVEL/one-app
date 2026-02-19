import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { UIShowcaseScene } from "./scenes/UIShowcaseScene";
import { CTAScene } from "./scenes/CTAScene";

// Brand colors
export const COLORS = {
  background: "#090b0d",
  green: "#00d97a",
  greenGlow: "#00ff88",
  white: "#f0fff4",
  muted: "#6b7280",
  card: "#0f1115",
};

export const OneInstagramAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Global background pulse effect
  const bgPulse = interpolate(
    frame,
    [0, 225, 450],
    [0, 0.3, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Subtle animated gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${COLORS.green}${Math.round(bgPulse * 15).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
        }}
      />

      {/* Scene 1: Hook/Intro - 0 to 90 frames (3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: Problem - 75 to 165 frames (3 seconds, with overlap) */}
      <Sequence from={75} durationInFrames={90}>
        <ProblemScene />
      </Sequence>

      {/* Scene 3: Solution - 150 to 240 frames (3 seconds) */}
      <Sequence from={150} durationInFrames={90}>
        <SolutionScene />
      </Sequence>

      {/* Scene 4: UI Showcase - 225 to 360 frames (4.5 seconds) */}
      <Sequence from={225} durationInFrames={135}>
        <UIShowcaseScene />
      </Sequence>

      {/* Scene 5: CTA - 345 to 450 frames (3.5 seconds) */}
      <Sequence from={345} durationInFrames={105}>
        <CTAScene />
      </Sequence>

      {/* Noise overlay for texture */}
      <AbsoluteFill
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
