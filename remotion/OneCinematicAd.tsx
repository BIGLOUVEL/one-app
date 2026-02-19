import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Img,
  staticFile,
  spring,
  random,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { noise2D } from "@remotion/noise";

// Load font
const { fontFamily: interFamily } = loadInter();

// Brand colors
export const BRAND = {
  bg: "#050608",
  bgElevated: "#0c0e12",
  bgCard: "#0a0c10",
  card: "#0a0c0f",
  cardBorder: "#1a1d21",
  green: "#00ff88",
  greenDim: "#00cc6a",
  greenBg: "rgba(0, 255, 136, 0.1)",
  white: "#ffffff",
  gray100: "#f4f4f5",
  gray200: "#e4e4e7",
  gray300: "#d4d4d8",
  gray400: "#a1a1aa",
  gray500: "#71717a",
  gray600: "#52525b",
  gray700: "#3f3f46",
  gray800: "#27272a",
};

interface OneCinematicAdProps {
  aspectRatio?: "9:16" | "1:1";
}

// ============================================
// ANIMATED GEOMETRIC SHAPES
// ============================================
const AnimatedShapes: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();

  const shapes = React.useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      x: random(`shape-x-${i}`) * 100,
      y: random(`shape-y-${i}`) * 100,
      size: 30 + random(`shape-size-${i}`) * 80,
      rotation: random(`shape-rot-${i}`) * 360,
      speed: 0.3 + random(`shape-speed-${i}`) * 0.5,
      type: i % 3,
    }));
  }, []);

  return (
    <>
      {shapes.map((shape, i) => {
        const noiseX = noise2D(`x-${i}`, frame * 0.006 * shape.speed, 0) * 40;
        const noiseY = noise2D(`y-${i}`, 0, frame * 0.006 * shape.speed) * 40;
        const noiseRot = noise2D(`rot-${i}`, frame * 0.008, i) * 30;
        const noiseScale = 1 + noise2D(`scale-${i}`, frame * 0.01, i) * 0.4;

        const opacity = interpolate(
          Math.sin(frame * 0.025 + i),
          [-1, 1],
          [0.015, 0.06]
        ) * intensity;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${shape.x + noiseX}%`,
              top: `${shape.y + noiseY}%`,
              width: shape.size,
              height: shape.size,
              transform: `rotate(${shape.rotation + noiseRot}deg) scale(${noiseScale})`,
              border: `1px solid ${BRAND.green}`,
              borderRadius: shape.type === 0 ? "50%" : shape.type === 1 ? "12px" : "0",
              opacity,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </>
  );
};

// ============================================
// GLITCH TEXT
// ============================================
const GlitchText: React.FC<{
  children: React.ReactNode;
  fontSize: number;
  glitchIntensity?: number;
}> = ({ children, fontSize, glitchIntensity = 0 }) => {
  const frame = useCurrentFrame();
  const glitchX = glitchIntensity > 0 ? noise2D("glitch-x", frame * 0.5, 0) * 6 * glitchIntensity : 0;

  return (
    <div style={{ position: "relative" }}>
      {glitchIntensity > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              fontSize,
              fontWeight: 800,
              color: "#ff0040",
              mixBlendMode: "screen",
              transform: `translateX(${glitchX * 2}px)`,
              opacity: 0.6,
            }}
          >
            {children}
          </div>
          <div
            style={{
              position: "absolute",
              fontSize,
              fontWeight: 800,
              color: "#00ffff",
              mixBlendMode: "screen",
              transform: `translateX(${-glitchX * 2}px)`,
              opacity: 0.6,
            }}
          >
            {children}
          </div>
        </>
      )}
      <div style={{ fontSize, fontWeight: 800, color: BRAND.white, position: "relative" }}>
        {children}
      </div>
    </div>
  );
};

// ============================================
// REVEAL LINE
// ============================================
const RevealLine: React.FC<{ progress: number; width: number }> = ({ progress, width }) => (
  <div
    style={{
      width: width * progress,
      height: 3,
      background: `linear-gradient(90deg, ${BRAND.green} 0%, ${BRAND.green}00 100%)`,
      borderRadius: 2,
      boxShadow: `0 0 25px ${BRAND.green}70`,
    }}
  />
);

// ============================================
// FLOATING PARTICLES
// ============================================
const FloatingParticles: React.FC<{ count?: number; color?: string }> = ({
  count = 20,
  color = BRAND.green,
}) => {
  const frame = useCurrentFrame();

  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: random(`p-x-${i}`) * 100,
      y: random(`p-y-${i}`) * 100,
      size: 2 + random(`p-size-${i}`) * 5,
      speed: 0.2 + random(`p-speed-${i}`) * 0.6,
      phase: random(`p-phase-${i}`) * Math.PI * 2,
    }));
  }, [count]);

  return (
    <>
      {particles.map((p, i) => {
        const noiseX = noise2D(`px-${i}`, frame * 0.008, 0) * 25;
        const noiseY = noise2D(`py-${i}`, 0, frame * 0.008) * 25;
        const y = (p.y + frame * p.speed * 0.35) % 120 - 10;
        const pulse = 1 + Math.sin(frame * 0.08 + p.phase) * 0.4;
        const opacity = interpolate(y, [0, 20, 80, 100], [0, 0.7, 0.7, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x + noiseX}%`,
              top: `${y + noiseY}%`,
              width: p.size * pulse,
              height: p.size * pulse,
              borderRadius: "50%",
              background: color,
              opacity: opacity * 0.5,
              boxShadow: `0 0 ${p.size * 4}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

// ============================================
// MACBOOK MOCKUP
// ============================================
const MacBookMockup: React.FC<{
  children: React.ReactNode;
  scale?: number;
  rotateY?: number;
  rotateX?: number;
  y?: number;
  opacity?: number;
  glowIntensity?: number;
}> = ({
  children,
  scale = 1,
  rotateY = 0,
  rotateX = 0,
  y = 0,
  opacity = 1,
  glowIntensity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const glowPulse = 1 + Math.sin(frame * 0.06) * 0.25;

  const screenWidth = 520;
  const screenHeight = 325;
  const bezelTop = 20;
  const bezelSide = 12;
  const bezelBottom = 20;
  const borderRadius = 14;
  const lidWidth = screenWidth + bezelSide * 2;
  const lidHeight = screenHeight + bezelTop + bezelBottom;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `
          translate(-50%, -50%)
          translateY(${y}px)
          perspective(2000px)
          rotateY(${rotateY}deg)
          rotateX(${rotateX}deg)
          scale(${scale})
        `,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: lidWidth * 1.3,
          height: lidHeight * 1.3,
          background: `radial-gradient(ellipse, ${BRAND.green}${Math.round(25 * glowIntensity * glowPulse).toString(16).padStart(2, '0')} 0%, transparent 55%)`,
          filter: "blur(50px)",
          zIndex: -1,
        }}
      />

      {/* Screen lid */}
      <div
        style={{
          width: lidWidth,
          height: lidHeight,
          borderRadius,
          background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
          padding: `${bezelTop}px ${bezelSide}px ${bezelBottom}px`,
          boxShadow: `
            0 40px 80px -20px rgba(0,0,0,0.9),
            0 0 ${100 * glowIntensity * glowPulse}px ${BRAND.green}20,
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          position: "relative",
        }}
      >
        {/* Camera */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1px solid #333",
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: screenWidth,
            height: screenHeight,
            borderRadius: 6,
            background: BRAND.bg,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>

      {/* Base */}
      <div
        style={{
          width: lidWidth + 40,
          height: 14,
          marginLeft: -20,
          marginTop: -2,
          borderRadius: "0 0 8px 8px",
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 4,
            borderRadius: "0 0 6px 6px",
            background: "#111",
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// DESKTOP DASHBOARD
// ============================================
const DesktopDashboard: React.FC<{ scrollY?: number; highlightCard?: number }> = ({
  scrollY = 0,
  highlightCard = 0
}) => {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", fontFamily: interFamily, background: BRAND.bg }}>
      {/* Sidebar */}
      <div
        style={{
          width: 60,
          background: BRAND.card,
          borderRight: `1px solid ${BRAND.cardBorder}`,
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDim} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: BRAND.bg,
            marginBottom: 8,
            boxShadow: `0 0 25px ${BRAND.green}50`,
          }}
        >
          O
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: i === 0 ? BRAND.greenBg : "transparent",
              border: i === 0 ? `1px solid ${BRAND.green}30` : "none",
              opacity: i === 0 ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 24, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scrollY}px)` }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: BRAND.gray500, letterSpacing: "0.15em", marginBottom: 2 }}>
              YOUR ONE THING
            </div>
            <div style={{ fontSize: 20, color: BRAND.white, fontWeight: 600 }}>
              Launch the MVP
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div
              style={{
                flex: 2,
                background: BRAND.card,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${highlightCard === 1 ? BRAND.green : BRAND.cardBorder}`,
                boxShadow: highlightCard === 1 ? `0 0 50px ${BRAND.green}30, inset 0 0 40px ${BRAND.green}10` : "none",
                transform: highlightCard === 1 ? "scale(1.03)" : "scale(1)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: BRAND.gray500, letterSpacing: "0.1em" }}>THIS WEEK</div>
                <div style={{ background: BRAND.greenBg, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, color: BRAND.green }}>
                  67%
                </div>
              </div>
              <div style={{ fontSize: 13, color: BRAND.white, fontWeight: 500, marginBottom: 10 }}>
                Complete user authentication flow
              </div>
              <div style={{ height: 5, background: BRAND.gray800, borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: "67%",
                    background: `linear-gradient(90deg, ${BRAND.green} 0%, ${BRAND.greenDim} 100%)`,
                    borderRadius: 3,
                    boxShadow: highlightCard === 1 ? `0 0 20px ${BRAND.green}80` : "none",
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ flex: 1, background: BRAND.card, borderRadius: 12, padding: 12, border: `1px solid ${BRAND.cardBorder}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.green }}>12</div>
                <div style={{ fontSize: 9, color: BRAND.gray500 }}>Day Streak</div>
              </div>
              <div style={{ flex: 1, background: BRAND.card, borderRadius: 12, padding: 12, border: `1px solid ${BRAND.cardBorder}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.white }}>4.2h</div>
                <div style={{ fontSize: 9, color: BRAND.gray500 }}>Focus Today</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: BRAND.card,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${highlightCard === 2 ? BRAND.green : BRAND.cardBorder}`,
              boxShadow: highlightCard === 2 ? `0 0 50px ${BRAND.green}30, inset 0 0 40px ${BRAND.green}10` : "none",
              transform: highlightCard === 2 ? "scale(1.03)" : "scale(1)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 9, color: BRAND.gray500, letterSpacing: "0.1em", marginBottom: 10 }}>TODAY'S FOCUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: BRAND.bg, fontWeight: 700 }}>✓</div>
              <span style={{ fontSize: 12, color: BRAND.gray400, textDecoration: "line-through" }}>Design login screen</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${BRAND.green}`, boxShadow: highlightCard === 2 ? `0 0 12px ${BRAND.green}70` : "none" }} />
              <span style={{ fontSize: 12, color: BRAND.white }}>Implement OAuth integration</span>
            </div>
          </div>

          <div style={{ background: BRAND.card, borderRadius: 12, padding: 16, border: `1px solid ${BRAND.cardBorder}` }}>
            <div style={{ fontSize: 9, color: BRAND.gray500, letterSpacing: "0.1em", marginBottom: 10 }}>MOMENTUM</div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 50 }}>
              {[0.3, 0.5, 0.7, 0.9, 1, 0.85, 0.6, 0.8, 0.95, 0.75, 0.5, 0.65].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: i < 8 ? BRAND.green : BRAND.gray700, borderRadius: 3, opacity: i < 8 ? 0.9 : 0.4 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DESKTOP FOCUS SESSION
// ============================================
const DesktopFocusSession: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const timerProgress = progress * 0.65;
  const minutes = Math.floor(25 * timerProgress);
  const seconds = Math.floor((25 * 60 * timerProgress) % 60);
  const circumference = 2 * Math.PI * 70;
  const glowPulse = 1 + Math.sin(frame * 0.08) * 0.35;

  return (
    <div style={{ position: "absolute", inset: 0, background: BRAND.bg, fontFamily: interFamily, display: "flex" }}>
      <div style={{ width: 60, background: BRAND.card, borderRight: `1px solid ${BRAND.cardBorder}` }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ position: "relative", width: 160, height: 160, marginBottom: 20 }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke={BRAND.gray800} strokeWidth="6" />
            <circle
              cx="80" cy="80" r="70"
              fill="none" stroke={BRAND.green} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - timerProgress)}
              transform="rotate(-90 80 80)"
              style={{ filter: `drop-shadow(0 0 ${15 * glowPulse}px ${BRAND.green}90)` }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: BRAND.white, fontVariantNumeric: "tabular-nums" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 9, color: BRAND.green, letterSpacing: "0.15em", marginTop: 2 }}>DEEP FOCUS</div>
          </div>
        </div>
        <div style={{ background: BRAND.greenBg, border: `1px solid ${BRAND.green}30`, borderRadius: 10, padding: "10px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: BRAND.gray400, letterSpacing: "0.1em", marginBottom: 2 }}>WORKING ON</div>
          <div style={{ fontSize: 13, color: BRAND.white, fontWeight: 500 }}>Implement OAuth integration</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Phone silent", "Notifications off", "Door closed"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: BRAND.bg, fontWeight: 700 }}>✓</div>
              <span style={{ fontSize: 11, color: BRAND.gray300 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// GRADIENT BACKGROUND
// ============================================
const GradientBg: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const x1 = 50 + noise2D("bg-x1", frame * 0.006, 0) * 35;
  const y1 = 40 + noise2D("bg-y1", 0, frame * 0.006) * 30;
  const x2 = 50 + noise2D("bg-x2", frame * 0.005, 100) * 30;
  const y2 = 60 + noise2D("bg-y2", 100, frame * 0.005) * 25;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: BRAND.bg }} />
      <div
        style={{
          position: "absolute",
          left: `${x1}%`,
          top: `${y1}%`,
          width: 1000,
          height: 1000,
          background: `radial-gradient(circle, ${BRAND.green}22 0%, transparent 45%)`,
          filter: "blur(130px)",
          transform: "translate(-50%, -50%)",
          opacity: intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${x2}%`,
          top: `${y2}%`,
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${BRAND.green}15 0%, transparent 40%)`,
          filter: "blur(110px)",
          transform: "translate(-50%, -50%)",
          opacity: intensity * 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// FLOATING LOGOS BACKGROUND
// ============================================
const FloatingLogos: React.FC<{ count?: number; opacity?: number }> = ({ count = 5, opacity = 0.08 }) => {
  const frame = useCurrentFrame();

  const logos = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: 10 + random(`logo-x-${i}`) * 80,
      y: 10 + random(`logo-y-${i}`) * 80,
      size: 40 + random(`logo-size-${i}`) * 60,
      speed: 0.1 + random(`logo-speed-${i}`) * 0.3,
      phase: random(`logo-phase-${i}`) * Math.PI * 2,
    }));
  }, [count]);

  return (
    <>
      {logos.map((logo, i) => {
        const floatY = Math.sin(frame * 0.02 + logo.phase) * 15;
        const floatX = Math.cos(frame * 0.015 + logo.phase) * 10;
        const rotate = Math.sin(frame * 0.01 + logo.phase) * 8;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${logo.x + floatX}%`,
              top: `${logo.y + floatY}%`,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
              opacity,
              filter: "blur(2px)",
            }}
          >
            <Img src={staticFile("LOGO.png")} style={{ width: logo.size, height: logo.size }} />
          </div>
        );
      })}
    </>
  );
};

// ============================================
// BPM SYNC: 117 BPM = ~15.4 frames per beat at 30fps
// ============================================
const BEAT = 15; // frames per beat at 117 BPM

// ============================================
// SCENE 1: HOOK
// ============================================
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat-synced animations (117 BPM)
  const logoScale = spring({ frame: frame - 0, fps, config: { damping: 6, stiffness: 280, mass: 0.25 } }); // Beat 1
  const logoRotate = interpolate(frame, [0, BEAT], [20, 0], { extrapolateRight: "clamp" });
  const textProgress = spring({ frame: frame - BEAT, fps, config: { damping: 7, stiffness: 220, mass: 0.3 } }); // Beat 2
  const lineProgress = interpolate(frame, [BEAT * 2, BEAT * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // Beat 3
  const subtitleProgress = spring({ frame: frame - BEAT * 3, fps, config: { damping: 8, stiffness: 180, mass: 0.35 } }); // Beat 4
  const glitchIntensity = frame > BEAT * 3 && frame < BEAT * 4 ? interpolate(frame, [BEAT * 3, BEAT * 3.5, BEAT * 4], [0, 1, 0]) : 0;
  const exitOpacity = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // Exit on beat 5-6
  const exitScale = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoPulse = 1 + Math.sin(frame * 0.12) * 0.06;

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, transform: `scale(${exitScale})` }}>
      <GradientBg intensity={1.2} />
      <FloatingLogos count={6} opacity={0.06} />
      <AnimatedShapes intensity={1} />
      <FloatingParticles count={35} />

      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ transform: `scale(${logoScale * logoPulse}) rotate(${logoRotate}deg)`, opacity: logoScale, filter: `drop-shadow(0 0 80px ${BRAND.green}90)` }}>
          <Img src={staticFile("LOGO.png")} style={{ width: 160, height: 160 }} />
        </div>

        <div style={{ marginTop: 4 }}>
          <GlitchText fontSize={100} glitchIntensity={glitchIntensity}>
            <span style={{ opacity: textProgress, transform: `translateY(${(1 - textProgress) * 60}px)`, display: "inline-block", fontFamily: interFamily, letterSpacing: "-0.02em" }}>
              ONE
            </span>
          </GlitchText>
        </div>

        <div style={{ marginTop: 0, display: "flex", justifyContent: "center" }}>
          <RevealLine progress={lineProgress} width={280} />
        </div>

        <div style={{
          fontFamily: interFamily,
          fontSize: 14,
          color: BRAND.gray400,
          letterSpacing: "0.4em",
          opacity: subtitleProgress,
          transform: `translateY(${(1 - subtitleProgress) * 30}px)`,
          marginTop: 10,
          fontWeight: 500,
        }}>
          FOCUS OPERATING SYSTEM
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// CHAOTIC TASK CARD
// ============================================
const ChaoticCard: React.FC<{
  text: string;
  index: number;
  frame: number;
  total: number;
}> = ({ text, index, frame, total }) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 280 + (index % 3) * 60;

  // Cards explode on beat 1-2, synced to 117 BPM
  const explodeProgress = interpolate(frame, [0, BEAT * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const fadeOut = interpolate(frame, [BEAT * 3, BEAT * 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const x = Math.cos(angle + index * 0.3) * radius * explodeProgress;
  const y = Math.sin(angle + index * 0.3) * radius * explodeProgress;
  const rotation = (index * 25 - 50) * explodeProgress + noise2D(`card-rot-${index}`, frame * 0.02, 0) * 15;
  const scale = interpolate(explodeProgress, [0, 0.3, 1], [0.4, 1.1, 0.85]);

  // Noise-based floating
  const floatX = noise2D(`float-x-${index}`, frame * 0.015, index) * 20 * explodeProgress;
  const floatY = noise2D(`float-y-${index}`, index, frame * 0.015) * 15 * explodeProgress;

  return (
    <div style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: `translate(-50%, -50%) translate(${x + floatX}px, ${y + floatY}px) rotate(${rotation}deg) scale(${scale})`,
      background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,0.9) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "14px 20px",
      fontFamily: interFamily,
      fontSize: 13,
      color: BRAND.gray400,
      whiteSpace: "nowrap",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      opacity: fadeOut,
      backdropFilter: "blur(10px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          border: `1.5px solid ${BRAND.gray600}`,
        }} />
        <span style={{ textDecoration: index % 4 === 0 ? "line-through" : "none", opacity: index % 4 === 0 ? 0.5 : 1 }}>
          {text}
        </span>
      </div>
    </div>
  );
};

// ============================================
// SCENE 2: PROBLEM - Premium chaos visualization (117 BPM synced)
// ============================================
const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tasks = [
    "Learn Spanish", "Hit the gym", "Read 50 books", "Start podcast",
    "Launch startup", "Meditate daily", "Wake up at 5am", "Build app",
    "Network more", "Save $10k", "Write book", "Get promoted"
  ];

  // Beat-synced text animations (117 BPM)
  const text1Blur = interpolate(frame, [0, BEAT], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // Beat 1
  const text1Opacity = interpolate(frame, [0, BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text1Y = interpolate(frame, [0, BEAT], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const text2Blur = interpolate(frame, [BEAT, BEAT * 2], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // Beat 2
  const text2Opacity = interpolate(frame, [BEAT, BEAT * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text2Y = interpolate(frame, [BEAT, BEAT * 2], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Strike through on beat 3
  const strikeProgress = interpolate(frame, [BEAT * 2.5, BEAT * 3.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const strikeGlow = interpolate(frame, [BEAT * 2.5, BEAT * 3, BEAT * 4], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Exit on beat 5
  const exitOpacity = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitScale = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cards explode on beat 1, shake hits on the beat
  const chaosShake = interpolate(frame, [0, BEAT * 0.5, BEAT * 1.5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shakeX = noise2D("chaos-x", frame * 0.8, 0) * 10 * chaosShake;
  const shakeY = noise2D("chaos-y", 0, frame * 0.8) * 6 * chaosShake;

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, transform: `scale(${exitScale}) translate(${shakeX}px, ${shakeY}px)` }}>
      <GradientBg intensity={0.5} />

      {/* Subtle red tint for tension */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(255,50,80,0.06) 0%, transparent 60%)",
      }} />

      {/* Chaotic floating task cards */}
      {tasks.map((task, i) => (
        <ChaoticCard key={i} text={task} index={i} frame={frame} total={tasks.length} />
      ))}

      {/* Central text */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        fontFamily: interFamily,
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 82,
          fontWeight: 800,
          color: BRAND.white,
          opacity: text1Opacity,
          transform: `translateY(${text1Y}px)`,
          filter: `blur(${text1Blur}px)`,
          marginBottom: 8,
          textShadow: "0 4px 40px rgba(0,0,0,0.8)",
          letterSpacing: "-0.03em",
        }}>
          Too many goals.
        </div>
        <div style={{
          fontSize: 82,
          fontWeight: 800,
          color: BRAND.gray400,
          opacity: text2Opacity,
          transform: `translateY(${text2Y}px)`,
          filter: `blur(${text2Blur}px)`,
          position: "relative",
          textShadow: "0 4px 40px rgba(0,0,0,0.8)",
          letterSpacing: "-0.03em",
        }}>
          Zero progress.
          {/* Animated strike-through */}
          <div style={{
            position: "absolute",
            left: 0,
            top: "50%",
            width: `${strikeProgress * 100}%`,
            height: 4,
            background: `linear-gradient(90deg, ${BRAND.green}00 0%, ${BRAND.green} 20%, ${BRAND.green} 100%)`,
            transform: "translateY(-50%)",
            boxShadow: `0 0 ${60 * strikeGlow}px ${BRAND.green}, 0 0 ${120 * strikeGlow}px ${BRAND.green}60`,
            borderRadius: 2,
          }} />
        </div>
      </div>

      {/* Premium vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 0%, rgba(0,0,0,0.45) 100%)",
        pointerEvents: "none",
      }} />

      <CinematicScanLines opacity={0.02} />
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 3: SOLUTION (117 BPM synced)
// ============================================
const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat-synced MacBook entrance
  const laptopEnter = spring({ frame: frame - 0, fps, config: { damping: 8, stiffness: 100, mass: 0.5 } }); // Beat 1
  const scrollY = interpolate(frame, [BEAT * 2, BEAT * 6], [0, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Highlights on beats
  const highlightCard = frame > BEAT * 3 && frame < BEAT * 5 ? 1 : frame > BEAT * 5 && frame < BEAT * 7 ? 2 : 0;
  const showFocus = frame > BEAT * 8;
  const focusTransition = interpolate(frame, [BEAT * 8, BEAT * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

  // Rotation swings on beats - more dynamic
  const baseRotateY = interpolate(frame, [0, BEAT * 3, BEAT * 6, BEAT * 9, BEAT * 12, BEAT * 15], [25, 8, -10, 6, -6, 4], { extrapolateRight: "extend" });
  const baseRotateX = interpolate(frame, [0, BEAT * 4, BEAT * 8, BEAT * 12, BEAT * 16], [18, 10, 14, 8, 11], { extrapolateRight: "extend" });

  // Continuous noise-based subtle movement - always active
  const noiseRotateY = noise2D("rot-y", frame * 0.015, 0) * 5;
  const noiseRotateX = noise2D("rot-x", 0, frame * 0.015) * 3;
  const noiseTranslateY = noise2D("trans-y", frame * 0.01, 100) * 6;
  const noiseScale = 1 + noise2D("scale", frame * 0.008, 200) * 0.025;

  // Exit synced to beats
  const exitOpacity = interpolate(frame, [BEAT * 14, BEAT * 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitScale = interpolate(frame, [BEAT * 14, BEAT * 16], [1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const focusProgress = interpolate(frame, [BEAT * 10, BEAT * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulses on beats
  const glowBase = showFocus ? 1.2 : 0.8;
  const glowPulse = glowBase + Math.sin(frame * (Math.PI * 2 / BEAT)) * 0.25; // Pulse synced to beat

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, transform: `scale(${exitScale})` }}>
      <GradientBg intensity={showFocus ? 1.1 : 0.9} />
      <FloatingParticles count={showFocus ? 30 : 18} />
      <AnimatedShapes intensity={0.25} />

      {/* Premium label with animated underline */}
      <div style={{ position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", opacity: laptopEnter, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{
          fontFamily: interFamily,
          fontSize: 12,
          color: BRAND.gray400,
          letterSpacing: "0.35em",
          fontWeight: 500,
          textTransform: "uppercase",
        }}>
          {showFocus ? "Deep Focus Mode" : "Your Command Center"}
        </span>
        <div style={{
          marginTop: 6,
          width: showFocus ? 100 : 140,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND.green}60, transparent)`,
        }} />
      </div>

      <MacBookMockup
        scale={interpolate(laptopEnter, [0, 1], [0.55, 1]) * noiseScale}
        y={interpolate(laptopEnter, [0, 1], [180, 0]) + noiseTranslateY}
        rotateY={baseRotateY + noiseRotateY}
        rotateX={baseRotateX + noiseRotateX}
        opacity={laptopEnter}
        glowIntensity={glowPulse}
      >
        <div style={{ opacity: 1 - focusTransition }}>
          <DesktopDashboard scrollY={scrollY} highlightCard={highlightCard} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: focusTransition }}>
          <DesktopFocusSession progress={focusProgress} />
        </div>
      </MacBookMockup>

      <CinematicScanLines opacity={0.018} />
    </AbsoluteFill>
  );
};

// ============================================
// CINEMATIC SCAN LINES
// ============================================
const CinematicScanLines: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.5) % 4;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `repeating-linear-gradient(
        0deg,
        transparent ${offset}px,
        rgba(0,0,0,${opacity}) ${offset + 1}px,
        transparent ${offset + 2}px,
        transparent ${offset + 4}px
      )`,
      pointerEvents: "none",
    }} />
  );
};

// ============================================
// SCENE 4: VALUE PROPS - Beat-synced reveals (117 BPM)
// ============================================
const SceneValue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each word reveals on consecutive beats
  const props = [
    { word: "goal", delay: 0 },           // Beat 1
    { word: "priority", delay: BEAT },    // Beat 2
    { word: "action", delay: BEAT * 2 },  // Beat 3
  ];

  // Exit on beat 5-6
  const exitOpacity = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitScale = interpolate(frame, [BEAT * 5, BEAT * 6], [1, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Ambient glow movement
  const ambientX = 50 + noise2D("amb-x", frame * 0.01, 0) * 20;
  const ambientY = 50 + noise2D("amb-y", 0, frame * 0.01) * 20;

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, transform: `scale(${exitScale})` }}>
      <GradientBg intensity={1.4} />
      <AnimatedShapes intensity={0.35} />
      <FloatingParticles count={55} />

      {/* Ambient spotlight */}
      <div style={{
        position: "absolute",
        left: `${ambientX}%`,
        top: `${ambientY}%`,
        width: 600,
        height: 600,
        background: `radial-gradient(circle, ${BRAND.green}12 0%, transparent 50%)`,
        transform: "translate(-50%, -50%)",
        filter: "blur(80px)",
      }} />

      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, fontFamily: interFamily }}>
        {props.map((prop, i) => {
          // Snappy spring that hits on the beat
          const progress = spring({ frame: frame - prop.delay, fps, config: { damping: 5, stiffness: 300, mass: 0.18 } });
          const glowIntensity = interpolate(frame, [prop.delay, prop.delay + BEAT * 0.5, prop.delay + BEAT * 1.5], [0, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          // Quick horizontal reveal
          const revealX = interpolate(frame, [prop.delay, prop.delay + BEAT * 0.8], [-80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

          // Underline on beat 4
          const lineWidth = i === 2 ? interpolate(frame, [BEAT * 3, BEAT * 4], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }) : 0;

          return (
            <div key={i} style={{ position: "relative", marginBottom: i < 2 ? -4 : 0, overflow: "hidden" }}>
              <div style={{
                fontSize: 92,
                fontWeight: 800,
                color: BRAND.white,
                opacity: progress,
                transform: `translateX(${revealX}px) scale(${0.85 + progress * 0.15})`,
                textShadow: `0 0 ${80 * glowIntensity}px ${BRAND.green}80, 0 10px 50px rgba(0,0,0,0.5)`,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}>
                <span style={{
                  color: BRAND.green,
                  textShadow: `0 0 ${60 * glowIntensity}px ${BRAND.green}, 0 0 120px ${BRAND.green}40`,
                  fontWeight: 900,
                }}>ONE</span>
                <span style={{ color: BRAND.gray200, fontWeight: 500 }}> {prop.word}</span>
              </div>

              {/* Underline accent for last item */}
              {i === props.length - 1 && (
                <div style={{
                  position: "absolute",
                  bottom: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: `${lineWidth}%`,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${BRAND.green}, transparent)`,
                  borderRadius: 2,
                  boxShadow: `0 0 40px ${BRAND.green}90`,
                }} />
              )}
            </div>
          );
        })}
      </div>

      <CinematicScanLines opacity={0.025} />
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 5: CTA - Premium finale (117 BPM synced)
// ============================================
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat-synced entrances
  const logoEnter = spring({ frame: frame - 0, fps, config: { damping: 6, stiffness: 250, mass: 0.25 } }); // Beat 1
  const taglineEnter = spring({ frame: frame - BEAT, fps, config: { damping: 8, stiffness: 200, mass: 0.3 } }); // Beat 2
  const ctaEnter = spring({ frame: frame - BEAT * 2, fps, config: { damping: 5, stiffness: 280, mass: 0.2 } }); // Beat 3

  // Pulse synced to beat
  const glowPulse = 1 + Math.sin(frame * (Math.PI * 2 / BEAT)) * 0.3;
  const ctaBounce = Math.sin(frame * (Math.PI * 2 / BEAT)) * 5;
  const logoPulse = 1 + Math.sin(frame * (Math.PI * 2 / BEAT)) * 0.08;
  const logoRotate = Math.sin(frame * 0.03) * 3;

  // Light rays rotate faster
  const rayRotation = frame * 0.2;

  return (
    <AbsoluteFill>
      <GradientBg intensity={1.6} />
      <FloatingLogos count={10} opacity={0.04} />
      <AnimatedShapes intensity={0.6} />
      <FloatingParticles count={60} color={BRAND.green} />

      {/* Cinematic light rays */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${rayRotation}deg)`,
        width: 1200,
        height: 1200,
        background: `conic-gradient(from 0deg, transparent 0deg, ${BRAND.green}08 10deg, transparent 20deg, transparent 90deg, ${BRAND.green}05 100deg, transparent 110deg, transparent 180deg, ${BRAND.green}08 190deg, transparent 200deg, transparent 270deg, ${BRAND.green}05 280deg, transparent 290deg)`,
        opacity: 0.6,
      }} />

      {/* Radial logo burst */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", opacity: 0.02 }}>
        <Img src={staticFile("LOGO.png")} style={{ width: 800, height: 800, filter: "blur(2px)" }} />
      </div>

      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: interFamily }}>
        <div style={{
          transform: `scale(${logoEnter * logoPulse}) rotate(${logoRotate}deg)`,
          opacity: logoEnter,
          filter: `drop-shadow(0 0 120px ${BRAND.green})`,
        }}>
          <Img src={staticFile("LOGO.png")} style={{ width: 140, height: 140 }} />
        </div>

        <div style={{
          fontSize: 115,
          fontWeight: 900,
          color: BRAND.white,
          letterSpacing: "-0.03em",
          opacity: logoEnter,
          transform: `scale(${logoEnter})`,
          textShadow: `0 0 150px ${BRAND.green}70, 0 6px 40px rgba(0,0,0,0.5)`,
        }}>
          ONE
        </div>

        <div style={{
          textAlign: "center",
          opacity: taglineEnter,
          transform: `translateY(${(1 - taglineEnter) * 50}px)`,
          marginTop: 4,
        }}>
          <div style={{
            fontSize: 28,
            color: BRAND.gray400,
            marginBottom: 8,
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}>
            Focus on what matters.
          </div>
          <div style={{
            fontSize: 32,
            color: BRAND.white,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}>
            Achieve the extraordinary.
          </div>
        </div>

        <div style={{ marginTop: 20, opacity: ctaEnter, transform: `scale(${ctaEnter}) translateY(${ctaBounce}px)` }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDim} 100%)`,
              color: BRAND.bg,
              padding: "22px 64px",
              borderRadius: 20,
              fontSize: 26,
              fontWeight: 800,
              boxShadow: `0 0 ${100 * glowPulse}px ${BRAND.green}70, 0 20px 70px -20px ${BRAND.green}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              letterSpacing: "0.01em",
            }}
          >
            <Img src={staticFile("LOGO.png")} style={{ width: 26, height: 26 }} />
            Start Free →
          </div>
        </div>
      </div>

      <CinematicScanLines opacity={0.02} />
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const OneCinematicAd: React.FC<OneCinematicAdProps> = ({ aspectRatio = "9:16" }) => {
  // Scene timing synced to 117 BPM (15 frames per beat)
  // Scene 1: 6 beats, Scene 2: 6 beats, Scene 3: 16 beats, Scene 4: 7 beats, Scene 5: 13 beats = 48 beats total = 720 frames

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg, fontFamily: interFamily, overflow: "hidden" }}>
      {/* Scene 1: Hook - Logo intro (0 to beat 6) */}
      <Sequence from={0} durationInFrames={BEAT * 7}><SceneHook /></Sequence>

      {/* Scene 2: Problem - Pain point (beat 6 to 12) - overlaps for smooth transition */}
      <Sequence from={BEAT * 6} durationInFrames={BEAT * 7}><SceneProblem /></Sequence>

      {/* Scene 3: Solution - App demo (beat 12 to 28) */}
      <Sequence from={BEAT * 12} durationInFrames={BEAT * 17}><SceneSolution /></Sequence>

      {/* Scene 4: Value Props - ONE x3 (beat 28 to 35) */}
      <Sequence from={BEAT * 28} durationInFrames={BEAT * 8}><SceneValue /></Sequence>

      {/* Scene 5: CTA - Final push (beat 35 to 48) */}
      <Sequence from={BEAT * 35} durationInFrames={BEAT * 13}><SceneCTA /></Sequence>

      {/* Cinematic vignette overlay */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 0%, rgba(0,0,0,0.35) 100%)",
        pointerEvents: "none",
      }} />

      {/* Global subtle scan lines */}
      <CinematicScanLines opacity={0.015} />
    </AbsoluteFill>
  );
};
