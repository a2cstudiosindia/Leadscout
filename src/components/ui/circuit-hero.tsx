"use client";

import { Zap } from "lucide-react";

// Original circuit-board hero animation, extracted so it can be reused.
const PATHS = [
  "M 200 200 L 120 200 L 80 160 L 30 160",
  "M 200 200 L 150 200 L 100 150 L 100 80",
  "M 200 200 L 280 200 L 320 160 L 370 160",
  "M 200 200 L 250 200 L 300 150 L 300 80",
  "M 200 200 L 120 200 L 80 240 L 30 240",
  "M 200 200 L 150 200 L 100 250 L 100 320",
  "M 200 200 L 280 200 L 320 240 L 370 240",
  "M 200 200 L 250 200 L 300 250 L 300 320",
  "M 200 200 L 50 200",
  "M 200 200 L 350 200",
  "M 200 200 L 200 60",
  "M 200 200 L 200 340",
];

const nodes = [
  { top: "38%", left: "7%" }, { top: "38%", right: "7%" },
  { bottom: "38%", left: "7%" }, { bottom: "38%", right: "7%" },
];
const rings = [
  { top: "17%", left: "23%" }, { top: "17%", right: "23%" },
  { bottom: "17%", left: "23%" }, { bottom: "17%", right: "23%" },
  { top: "12%", left: "48%" }, { bottom: "12%", left: "48%" },
];
const particles = [
  { top: "25%", left: "15%" }, { top: "30%", right: "20%" },
  { bottom: "25%", left: "20%" }, { bottom: "30%", right: "15%" },
  { top: "45%", left: "10%" }, { top: "45%", right: "10%" },
];
const hexes = [
  { top: "8%", left: "8%" }, { top: "8%", right: "8%" },
  { bottom: "8%", left: "8%" }, { bottom: "8%", right: "8%" },
];

export function CircuitHero({ className = "" }: { className?: string }) {
  return (
    <div className={`circuit-board ${className}`} aria-hidden>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
        <defs>
          <linearGradient id="cPulse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {PATHS.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#fff" strokeWidth="2" opacity="0.12" />
            <path d={d} stroke="url(#cPulse)" strokeWidth="3" strokeLinecap="round">
              <animate attributeName="stroke-dasharray" values="0 300;300 0;0 300" dur={`${2 + (i % 3) * 0.5}s`} begin={`${(i * 0.25).toFixed(2)}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur={`${2 + (i % 3) * 0.5}s`} begin={`${(i * 0.25).toFixed(2)}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </svg>
      {nodes.map((s, i) => <div key={i} className="circuit-node" style={{ ...s, animationDelay: `${i * 0.5}s` }} />)}
      {rings.map((s, i) => <div key={i} className="circuit-ring" style={{ ...s, animationDelay: `${i * 0.4}s` }} />)}
      {particles.map((s, i) => <div key={i} className="tech-particle" style={{ ...s, animationDelay: `${i}s` }} />)}
      {hexes.map((s, i) => <div key={i} className="hex-shape" style={{ ...s, animationDelay: `${i * 2.5}s`, animationDirection: i % 2 ? "reverse" : "normal" }} />)}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="circuit-icon-container">
          <Zap size={56} className="text-zinc-950 fill-zinc-950 drop-shadow-xs" />
        </div>
      </div>
    </div>
  );
}
