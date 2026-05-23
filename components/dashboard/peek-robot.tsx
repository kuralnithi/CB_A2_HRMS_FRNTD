"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Inject keyframes once globally
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes robot-rise {
      0% { transform: translateY(115px); opacity: 0; }
      40% { opacity: 1; }
      65% { transform: translateY(-6px); }
      80% { transform: translateY(3px); }
      100% { transform: translateY(0); }
    }
    @keyframes robot-hide {
      0% { transform: translateY(0); opacity: 1; }
      20% { transform: translateY(-8px); }
      100% { transform: translateY(115px); opacity: 0; }
    }
    @keyframes robot-idle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes robot-blink {
      0%, 88%, 100% { transform: scaleY(1); }
      94% { transform: scaleY(0.08); }
    }
    @keyframes robot-wave-hand {
      0%   { transform: rotate(0deg); }
      10%  { transform: rotate(20deg); }
      20%  { transform: rotate(-12deg); }
      30%  { transform: rotate(20deg); }
      40%  { transform: rotate(-8deg); }
      50%  { transform: rotate(16deg); }
      60%  { transform: rotate(-4deg); }
      70%  { transform: rotate(12deg); }
      80%  { transform: rotate(0deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes speech-pop-in {
      0% { opacity: 0; transform: scale(0.5) translateY(8px); }
      50% { transform: scale(1.06) translateY(-2px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes sparkle-float {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
      50% { transform: translateY(-6px) scale(1.2); opacity: 1; }
    }
    .peek-robot-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      pointer-events: none;
    }
    .peek-robot-main {
      pointer-events: auto;
      cursor: pointer;
      transition: filter 0.3s ease;
      transform-origin: bottom center;
    }
    .peek-robot-main.robot-rising {
      animation: robot-rise 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .peek-robot-main.robot-hiding {
      animation: robot-hide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both !important;
    }
    .peek-robot-main:hover {
      filter: drop-shadow(0 16px 36px rgba(99,102,241,0.4));
    }
    .peek-robot-svg-wrapper {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .peek-robot-main:hover .peek-robot-svg-wrapper {
      transform: translateY(-8px) scale(1.04);
    }
    .peek-robot-main:active .peek-robot-svg-wrapper {
      transform: translateY(2px) scale(0.98);
    }
  `;
  document.head.appendChild(style);
}

export default function PeekRobot() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    injectStyles();
  }, []);

  if (!mounted) return null;

  // Hide the robot on the Chat UI page
  if (pathname && pathname.includes("/dashboard/ai-copilot")) {
    return null;
  }

  const robotUI = (
    <div className="peek-robot-container">
      <div
        className="peek-robot-main robot-rising"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          router.push("/dashboard/ai-copilot");
        }}
        title="Chat with NovaWorks AI ✨"
      >
        {/* Speech Bubble */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              right: -12,
              animation: "speech-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
              pointerEvents: "none",
              zIndex: 60,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                color: "#18181b",
                border: "1.5px solid #e2e8f0",
                borderRadius: 16,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: "0 10px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Hi! Need help? Let's chat</span>
              <span style={{ fontSize: 18 }}>💬</span>
            </div>
            {/* Bubble tail */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid #f0f0f3",
                marginLeft: "auto",
                marginRight: 24,
                marginTop: -1.5,
              }}
            />
          </div>
        )}

        {/* Robot SVG Wrapper for Hover translation */}
        <div className="peek-robot-svg-wrapper">
          <svg
            width={100}
            height={112}
            viewBox="0 0 100 110"
            fill="none"
            style={{
              animation: "robot-idle 3.5s 1.5s ease-in-out infinite",
              filter: "drop-shadow(0 8px 20px rgba(99,102,241,0.25))",
            }}
          >
            {/* ===== ANTENNA ===== */}
            <line x1="50" y1="18" x2="50" y2="4" stroke="url(#antennaGrad)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="50" cy="3" r="6" fill="#818cf8">
              <animate attributeName="r" values="5.5;7;5.5" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="3" r="10" fill="none" stroke="#818cf8" strokeWidth="1.5">
              <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="3" r="12" fill="none" stroke="#a5b4fc" strokeWidth="1">
              <animate attributeName="r" values="10;22;10" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.25;0;0.25" dur="3s" begin="0.5s" repeatCount="indefinite" />
            </circle>

            <defs>
              <linearGradient id="antennaGrad" x1="50" y1="18" x2="50" y2="3" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a5b4fc" />
              </linearGradient>
              <linearGradient id="bodyGrad" x1="22" y1="18" x2="78" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="faceGrad" x1="27" y1="24" x2="73" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="torsoGrad" x1="30" y1="72" x2="70" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#3730a3" />
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* ===== EARS ===== */}
            <rect x="8" y="34" width="10" height="20" rx="5" fill="url(#bodyGrad)" opacity="0.85" filter="url(#softShadow)" />
            <rect x="82" y="34" width="10" height="20" rx="5" fill="url(#bodyGrad)" opacity="0.85" filter="url(#softShadow)" />
            <rect x="11" y="39" width="4" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="85" y="39" width="4" height="10" rx="2" fill="white" opacity="0.2" />

            {/* ===== HEAD ===== */}
            <rect x="18" y="18" width="64" height="52" rx="20" fill="url(#bodyGrad)" filter="url(#softShadow)" />
            <rect x="23" y="20" width="28" height="10" rx="5" fill="white" opacity="0.08" />

            {/* ===== FACE PLATE ===== */}
            <rect x="24" y="25" width="52" height="40" rx="16" fill="url(#faceGrad)" />
            <rect x="24" y="25" width="52" height="40" rx="16" fill="none" stroke="#e2e8f0" strokeWidth="1" />

            {/* ===== EYES ===== */}
            <g style={{ animation: "robot-blink 4s 1.2s ease-in-out infinite", transformOrigin: "50px 42px" }}>
              {hovered ? (
                <>
                  <text x="38" y="48" textAnchor="middle" fontSize="20" fill="#ef4444" fontWeight="bold">♥</text>
                  <text x="62" y="48" textAnchor="middle" fontSize="20" fill="#ef4444" fontWeight="bold">♥</text>
                </>
              ) : (
                <>
                  <circle cx="38" cy="42" r="6" fill="#4f46e5" />
                  <circle cx="62" cy="42" r="6" fill="#4f46e5" />
                  <circle cx="40.5" cy="40" r="2.5" fill="white" opacity="0.95" />
                  <circle cx="64.5" cy="40" r="2.5" fill="white" opacity="0.95" />
                  <circle cx="36" cy="44" r="1.5" fill="white" opacity="0.6" />
                  <circle cx="60" cy="44" r="1.5" fill="white" opacity="0.6" />
                </>
              )}
            </g>

            {/* ===== CHEEKS ===== */}
            <circle cx="28" cy="52" r={hovered ? "6.5" : "4.5"} fill="#fda4af" opacity={hovered ? "0.4" : "0.2"} style={{ transition: "all 0.4s ease" }} />
            <circle cx="72" cy="52" r={hovered ? "6.5" : "4.5"} fill="#fda4af" opacity={hovered ? "0.4" : "0.2"} style={{ transition: "all 0.4s ease" }} />

            {/* ===== MOUTH ===== */}
            <path
              d={hovered ? "M38 56 Q50 66 62 56" : "M41 56 Q50 62 59 56"}
              stroke={hovered ? "#4f46e5" : "#6366f1"}
              strokeWidth={hovered ? "3" : "2.5"}
              strokeLinecap="round"
              fill="none"
              style={{ transition: "all 0.3s ease" }}
            />

            {/* ===== WAVING HAND ===== */}
            <g style={{
              transformOrigin: "86px 74px",
              animation: hovered ? "robot-wave-hand 1.2s ease-in-out infinite" : "none",
            }}>
              <rect x="78" y="70" width="16" height="12" rx="6" fill="url(#bodyGrad)" />
              <rect x="85" y="64" width="4.5" height="9" rx="2.25" fill="url(#bodyGrad)" />
              <rect x="90" y="66" width="4" height="7" rx="2" fill="url(#bodyGrad)" />
              <rect x="80" y="66" width="4" height="7" rx="2" fill="url(#bodyGrad)" />
              <rect x="81" y="73" width="10" height="3" rx="1.5" fill="white" opacity="0.15" />
            </g>

            {/* ===== TORSO ===== */}
            <rect x="28" y="70" width="44" height="22" rx="11" fill="url(#torsoGrad)" filter="url(#softShadow)" />
            <rect x="34" y="78" width="32" height="4" rx="2" fill="white" opacity="0.15" />
            <circle cx="50" cy="81" r="4" fill="white" opacity="0.15" />
            <circle cx="50" cy="81" r="2.5" fill="#c7d2fe" opacity="0.8">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* ===== FEET ===== */}
            <rect x="30" y="88" width="16" height="10" rx="5" fill="url(#bodyGrad)" opacity="0.95" />
            <rect x="54" y="88" width="16" height="10" rx="5" fill="url(#bodyGrad)" opacity="0.95" />
            <rect x="33" y="90" width="7" height="3" rx="1.5" fill="white" opacity="0.15" />
            <rect x="57" y="90" width="7" height="3" rx="1.5" fill="white" opacity="0.15" />

            {/* ===== SPARKLES ===== */}
            {hovered && (
              <>
                <text x="10" y="20" fontSize="14" style={{ animation: "sparkle-float 0.8s ease-in-out infinite" }}>✨</text>
                <text x="82" y="14" fontSize="10" style={{ animation: "sparkle-float 1s 0.2s ease-in-out infinite" }}>✨</text>
                <text x="4" y="62" fontSize="9" style={{ animation: "sparkle-float 0.9s 0.4s ease-in-out infinite" }}>⭐</text>
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );

  return createPortal(robotUI, document.body);
}
