import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BRAND } from "../OneCinematicAd";

// Animated connecting line
const TimelineLine: React.FC<{ progress: number }> = ({ progress }) => {
  const totalWidth = 280;
  const lineWidth = totalWidth * progress;

  return (
    <div
      style={{
        position: "relative",
        width: totalWidth,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Background line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: "100%",
          height: 2,
          background: BRAND.gray700,
          opacity: 0.3,
          transform: "translateY(-50%)",
        }}
      />

      {/* Animated progress line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, ${BRAND.gray500} 0%, ${BRAND.green} 100%)`,
          transform: "translateY(-50%)",
          boxShadow: `0 0 10px ${BRAND.green}40`,
        }}
      />

      {/* Past node */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: progress > 0 ? BRAND.gray500 : BRAND.gray700,
          border: `2px solid ${progress > 0 ? BRAND.gray500 : BRAND.gray700}`,
          zIndex: 1,
          transition: "all 0.3s ease",
        }}
      />

      {/* Present node */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: progress > 0.5 ? BRAND.green : BRAND.gray700,
          border: `2px solid ${progress > 0.5 ? BRAND.green : BRAND.gray700}`,
          boxShadow: progress > 0.5 ? `0 0 20px ${BRAND.green}60` : "none",
          zIndex: 1,
        }}
      />

      {/* Future node */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: progress > 0.95 ? BRAND.green : BRAND.gray700,
          border: `2px solid ${progress > 0.95 ? BRAND.green : BRAND.gray700}`,
          zIndex: 1,
        }}
      />

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: progress > 0 ? BRAND.gray300 : BRAND.gray700,
            letterSpacing: "0.1em",
            transform: "translateX(-50%)",
            marginLeft: 6,
          }}
        >
          PAST
        </span>
        <span
          style={{
            fontSize: 11,
            color: progress > 0.5 ? BRAND.green : BRAND.gray700,
            letterSpacing: "0.1em",
            fontWeight: progress > 0.5 ? 600 : 400,
          }}
        >
          NOW
        </span>
        <span
          style={{
            fontSize: 11,
            color: progress > 0.95 ? BRAND.gray300 : BRAND.gray700,
            letterSpacing: "0.1em",
            transform: "translateX(50%)",
            marginRight: 6,
          }}
        >
          FUTURE
        </span>
      </div>
    </div>
  );
};

export const CinematicPromise: React.FC = () => {
  const frame = useCurrentFrame();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Word animations - staggered reveal
  const word1Opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const word1Y = interpolate(frame, [10, 35], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const word2Opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const word2Y = interpolate(frame, [30, 55], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const word3Opacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const word3Y = interpolate(frame, [50, 75], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Timeline animation
  const timelineProgress = interpolate(frame, [70, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const timelineOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  // Subtle glow pulse
  const glowPulse = interpolate(
    frame,
    [70, 90, 110, 130],
    [0, 1, 0.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity * exitOpacity,
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.green}08 0%, transparent 60%)`,
          filter: "blur(40px)",
          opacity: glowPulse * 0.7,
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        {/* Three words */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Clarity */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 500,
              color: BRAND.white,
              letterSpacing: "-0.02em",
              opacity: word1Opacity,
              transform: `translateY(${word1Y}px)`,
            }}
          >
            Clarity.
          </div>

          {/* Trajectory */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 500,
              color: BRAND.green,
              letterSpacing: "-0.02em",
              opacity: word2Opacity,
              transform: `translateY(${word2Y}px)`,
              textShadow: `0 0 30px ${BRAND.green}40`,
            }}
          >
            Trajectory.
          </div>

          {/* Execution */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 500,
              color: BRAND.white,
              letterSpacing: "-0.02em",
              opacity: word3Opacity,
              transform: `translateY(${word3Y}px)`,
            }}
          >
            Execution.
          </div>
        </div>

        {/* Animated timeline */}
        <div
          style={{
            opacity: timelineOpacity,
            marginTop: 20,
          }}
        >
          <TimelineLine progress={timelineProgress} />
        </div>
      </div>

      {/* Decorative lines */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "10%",
          width: 80,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          right: "10%",
          width: 80,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND.gray700}40, transparent)`,
          opacity: entryOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
