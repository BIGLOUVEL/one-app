import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BRAND } from "../OneCinematicAd";

// Glassmorphism card component
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${BRAND.bgElevated}ee 0%, ${BRAND.bgCard}dd 100%)`,
      backdropFilter: "blur(20px)",
      borderRadius: 24,
      border: `1px solid ${BRAND.gray700}40`,
      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${BRAND.gray700}30`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

// Trajectory chart component
const TrajectoryChart: React.FC<{ progress: number }> = ({ progress }) => {
  const pathLength = 400;
  const drawLength = pathLength * progress;

  // Generate smooth curve points
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 100; i++) {
    const x = i * 3.2;
    // S-curve trajectory going up
    const y = 180 - (Math.pow(i / 100, 0.7) * 140 + Math.sin(i / 15) * 10);
    points.push({ x, y });
  }

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <div style={{ width: "100%", height: 200, position: "relative" }}>
      {/* Grid lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        style={{ position: "absolute" }}
      >
        {/* Horizontal grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={40 + i * 35}
            x2="320"
            y2={40 + i * 35}
            stroke={BRAND.gray700}
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        {/* Vertical grid */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`v-${i}`}
            x1={i * 53}
            y1="40"
            x2={i * 53}
            y2="180"
            stroke={BRAND.gray700}
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
      </svg>

      {/* Trajectory line */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        style={{ position: "absolute" }}
      >
        {/* Glow effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={BRAND.green}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - drawLength}
          filter="url(#glow)"
          opacity="0.8"
        />
        <path
          d={pathD}
          fill="none"
          stroke={BRAND.green}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - drawLength}
        />

        {/* Current point indicator */}
        {progress > 0.1 && (
          <circle
            cx={points[Math.floor(progress * 100)]?.x || 0}
            cy={points[Math.floor(progress * 100)]?.y || 0}
            r={6}
            fill={BRAND.green}
            opacity={progress}
            style={{
              filter: `drop-shadow(0 0 8px ${BRAND.green})`,
            }}
          />
        )}
      </svg>

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "0 10px",
          fontSize: 11,
          color: BRAND.gray500,
          fontWeight: 500,
        }}
      >
        <span>JAN</span>
        <span>MAR</span>
        <span>JUN</span>
        <span>SEP</span>
        <span>DEC</span>
      </div>
    </div>
  );
};

// Focus mode screen
const FocusModeScreen: React.FC<{ progress: number }> = ({ progress }) => {
  const timerProgress = progress * 0.75; // 45 min out of 60
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - timerProgress);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        gap: 30,
      }}
    >
      {/* Timer ring */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={BRAND.gray700}
            strokeWidth="4"
            opacity="0.3"
          />
          {/* Progress ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={BRAND.green}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            style={{
              filter: `drop-shadow(0 0 10px ${BRAND.green}60)`,
            }}
          />
        </svg>
        {/* Time display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: BRAND.white,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.floor(45 * progress)}:
            {String(Math.floor((progress * 45 * 60) % 60)).padStart(2, "0")}
          </div>
          <div
            style={{
              fontSize: 14,
              color: BRAND.gray500,
              marginTop: 4,
            }}
          >
            DEEP FOCUS
          </div>
        </div>
      </div>

      {/* Current task */}
      <div
        style={{
          background: BRAND.bgCard,
          borderRadius: 12,
          padding: "16px 24px",
          border: `1px solid ${BRAND.gray700}40`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, color: BRAND.gray500, marginBottom: 6 }}>
          WORKING ON
        </div>
        <div style={{ fontSize: 18, color: BRAND.white, fontWeight: 500 }}>
          Write Q1 strategy document
        </div>
      </div>
    </div>
  );
};

// Task flow component
const TaskFlow: React.FC<{ progress: number }> = ({ progress }) => {
  const tasks = [
    { label: "COMPLETED", title: "Define annual goals", done: true },
    { label: "NOW", title: "Create action plan", current: true },
    { label: "NEXT", title: "Schedule first sprint", done: false },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 30,
      }}
    >
      {tasks.map((task, i) => {
        const itemProgress = interpolate(
          progress,
          [i * 0.2, i * 0.2 + 0.3],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: itemProgress,
              transform: `translateX(${(1 - itemProgress) * 30}px)`,
            }}
          >
            {/* Status indicator */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: task.current
                  ? BRAND.green
                  : task.done
                    ? BRAND.bgElevated
                    : BRAND.bgCard,
                border: `2px solid ${task.current ? BRAND.green : task.done ? BRAND.green : BRAND.gray700}`,
                boxShadow: task.current
                  ? `0 0 20px ${BRAND.green}50`
                  : "none",
              }}
            >
              {task.done && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={BRAND.green}
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {task.current && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: BRAND.bg,
                  }}
                />
              )}
            </div>

            {/* Task content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: task.current ? BRAND.green : BRAND.gray500,
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                }}
              >
                {task.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: task.current ? BRAND.white : BRAND.gray300,
                  fontWeight: task.current ? 500 : 400,
                }}
              >
                {task.title}
              </div>
            </div>
          </div>
        );
      })}

      {/* Connecting line */}
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 70,
          width: 2,
          height: 100,
          background: `linear-gradient(180deg, ${BRAND.green}60 0%, ${BRAND.gray700}40 100%)`,
          opacity: progress,
        }}
      />
    </div>
  );
};

interface CinematicSolutionProps {
  aspectRatio?: "9:16" | "1:1";
}

export const CinematicSolution: React.FC<CinematicSolutionProps> = ({
  aspectRatio = "9:16",
}) => {
  const frame = useCurrentFrame();

  // Entry animation
  const entryOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Screen transitions (3 screens over 300 frames)
  // Dashboard: 0-100, Focus: 80-200, TaskFlow: 180-280
  const dashboardProgress = interpolate(frame, [0, 100], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const dashboardOpacity = interpolate(frame, [0, 30, 80, 110], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const focusProgress = interpolate(frame, [80, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const focusOpacity = interpolate(frame, [80, 110, 180, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taskFlowProgress = interpolate(frame, [180, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const taskFlowOpacity = interpolate(frame, [180, 210, 280, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera movement (subtle zoom and pan)
  const cameraZoom = interpolate(frame, [0, 300], [1, 1.08], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const cameraPanX = interpolate(frame, [0, 150, 300], [0, -2, 2], {
    extrapolateRight: "clamp",
  });

  const cameraPanY = interpolate(frame, [0, 150, 300], [0, -3, 1], {
    extrapolateRight: "clamp",
  });

  // Light sweep effect
  const lightSweepX = interpolate(frame, [20, 280], [-100, 200], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: entryOpacity,
        transform: `scale(${cameraZoom}) translate(${cameraPanX}%, ${cameraPanY}%)`,
      }}
    >
      {/* Light sweep */}
      <div
        style={{
          position: "absolute",
          width: "30%",
          height: "150%",
          background: `linear-gradient(90deg, transparent 0%, ${BRAND.green}08 50%, transparent 100%)`,
          transform: `translateX(${lightSweepX}%) rotate(15deg)`,
          pointerEvents: "none",
        }}
      />

      {/* Dashboard Screen */}
      <div
        style={{
          position: "absolute",
          opacity: dashboardOpacity,
          transform: `scale(${0.9 + dashboardProgress * 0.1}) translateY(${(1 - dashboardProgress) * 20}px)`,
        }}
      >
        <GlassCard
          style={{
            width: aspectRatio === "9:16" ? 340 : 400,
            padding: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: BRAND.gray500, marginBottom: 4 }}>
                YOUR TRAJECTORY
              </div>
              <div style={{ fontSize: 22, color: BRAND.white, fontWeight: 600 }}>
                Annual Goal Progress
              </div>
            </div>
            <div
              style={{
                background: `${BRAND.green}20`,
                color: BRAND.green,
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              +23%
            </div>
          </div>

          {/* Chart */}
          <TrajectoryChart progress={dashboardProgress} />

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${BRAND.gray700}30`,
            }}
          >
            {[
              { label: "Focus Hours", value: "127" },
              { label: "Tasks Done", value: "48" },
              { label: "Streak", value: "12d" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, color: BRAND.white, fontWeight: 600 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: BRAND.gray500, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Focus Mode Screen */}
      <div
        style={{
          position: "absolute",
          opacity: focusOpacity,
          transform: `scale(${0.9 + focusProgress * 0.1})`,
        }}
      >
        <GlassCard
          style={{
            width: aspectRatio === "9:16" ? 340 : 400,
          }}
        >
          <FocusModeScreen progress={focusProgress} />
        </GlassCard>
      </div>

      {/* Task Flow Screen */}
      <div
        style={{
          position: "absolute",
          opacity: taskFlowOpacity,
          transform: `scale(${0.9 + taskFlowProgress * 0.1}) translateY(${(1 - taskFlowProgress) * -20}px)`,
        }}
      >
        <GlassCard
          style={{
            width: aspectRatio === "9:16" ? 340 : 400,
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 30px 0 30px",
            }}
          >
            <div style={{ fontSize: 13, color: BRAND.gray500, marginBottom: 4 }}>
              YOUR PATH
            </div>
            <div style={{ fontSize: 22, color: BRAND.white, fontWeight: 600 }}>
              Task Flow
            </div>
          </div>
          <TaskFlow progress={taskFlowProgress} />
        </GlassCard>
      </div>

      {/* Floating accent elements */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "10%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.green}15 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "8%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.green}10 0%, transparent 70%)`,
          filter: "blur(30px)",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
