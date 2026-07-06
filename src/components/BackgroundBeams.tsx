"use client";

import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -3,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Animated Beams SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.15,
        }}
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f0ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Static Grid */}
        <g stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="1000" />
          ))}
        </g>

        {/* Moving Beams */}
        <motion.path
          d="M 100 0 L 100 1000 M 400 0 L 400 1000 M 700 0 L 700 1000"
          stroke="url(#beamGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        />
        
        <motion.path
          d="M 0 300 L 1000 300 M 0 600 L 1000 600 M 0 850 L 1000 850"
          stroke="url(#beamGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
            delay: 2,
          }}
        />
      </svg>
    </div>
  );
};
