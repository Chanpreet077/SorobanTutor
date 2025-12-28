import React from "react";
import type { SorobanState } from "../soroban";

const RODS = 15;
const ONES_INDEX = 7;

type Props = {
  state: SorobanState;
  onChange: (next: SorobanState, meta: { rodIndex: number; beadType: "heaven" | "earth" }) => void;
  width?: number;
  height?: number;
};

export default function SorobanSvg({
  state,
  onChange,
  width = 980,
  height = 420,
}: Props) {
  // --- layout constants ---
  const padX = 40;
 // const topPad = 30;
  //const bottomPad = 28;

  const frameRx = 22;

   // bead geometry (diamond-ish)
  const beadW = 44;
  const beadH = 26;

  const beamY = 165; // middle bar
  const heavenRestY = 92; // heaven bead "up" (away from beam)
  const heavenActiveY = beamY - 30; // heaven bead "down" (touching beam)

  // Earth beads: 4 beads per rod
  const earthRowTop = beamY + 48; // starting row (closest to beam)
  const earthRowGap = 37; // distance between earth beads rows
  const earthRestOffset = 22; // extra push downward for "rest" beads

  const rodCap = 18; // visible rod above/below beads

  const lowestEarthRestY =
  earthRowTop + (4 - 1) * earthRowGap + earthRestOffset;


  const rodTop = heavenRestY - beadH / 2 - rodCap;
  const rodBottom = lowestEarthRestY + beadH / 2 + rodCap;


  const trackWidth = width - padX * 2;
  const spacing = trackWidth / (RODS - 1);

 

  function cloneState(s: SorobanState): SorobanState {
    return { heaven: [...s.heaven], earth: [...s.earth] };
  }

  function setHeaven(rodIndex: number) {
    const next = cloneState(state);
    next.heaven[rodIndex] = !next.heaven[rodIndex];
    onChange(next, { rodIndex, beadType: "heaven" });
  }

  // Clicking an earth bead sets the count (0..4) by choosing how many are "up" near beam.
  // We map click on bead #k (1..4 from top to bottom) to set earth= k if currently <k else set to k-1 (toggle feel).
  function setEarth(rodIndex: number, beadNumber: number) {
    const next = cloneState(state);
    const cur = next.earth[rodIndex];
    const k = beadNumber; // 1..4
    next.earth[rodIndex] = cur >= k ? k - 1 : k;
    onChange(next, { rodIndex, beadType: "earth" });
  }

  // Compute where each earth bead sits based on count.
  // If earthCount >= beadNumber => that bead is "active" (up, touching beam stack)
  function earthBeadY(earthCount: number, beadNumber: number) {
    const active = earthCount >= beadNumber;
    const base = earthRowTop + (beadNumber - 1) * earthRowGap;
    // Active beads move upward toward beam, rest beads sit a bit lower
    return active ? base - earthRestOffset : base + earthRestOffset;
  }

  // Diamond / double-cone bead path centered at (0,0)
  function beadPath(w: number, h: number) {
    const rx = w * 0.52;
    const ry = h * 0.52;
    const tip = w * 0.10;
    // A rounded “diamond”: left-mid -> top -> right-mid -> bottom -> back
    return `
      M ${-rx} 0
      Q ${-rx + tip} ${-ry} 0 ${-ry}
      Q ${rx - tip} ${-ry} ${rx} 0
      Q ${rx - tip} ${ry} 0 ${ry}
      Q ${-rx + tip} ${ry} ${-rx} 0
      Z
    `;
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        {/* subtle shadow */}
        <filter id="beadShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.28" />
        </filter>






        {/* soft outer shadow for the whole abacus */}
        <filter id="frameShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodOpacity="0.35" />
        </filter>

        {/* inner glow / bevel look */}
        <linearGradient id="frameStrokeLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(71, 62, 65, 1)" />
          <stop offset="35%" stopColor="rgba(18, 17, 17, 0.53)" />
          <stop offset="100%" stopColor="rgba(5, 5, 5, 1)" />
        </linearGradient>

        <linearGradient id="frameStrokeDark" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
          <stop offset="55%" stopColor="rgba(0,0,0,0.16)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </linearGradient>


        {/* orange bead body: glossy */}
        <radialGradient id="beadBody" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#fff2dd" stopOpacity="1" />
          <stop offset="28%" stopColor="#e44525ff" stopOpacity="1" />
          <stop offset="62%" stopColor="#a53513ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#72240fff" stopOpacity="1" />
        </radialGradient>

        {/* edge tint for depth */}
        <linearGradient id="beadEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>

        {/* highlight sheen */}
        <radialGradient id="beadShine" cx="28%" cy="22%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* frame gradient */}
        <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#121212" />
          <stop offset="100%" stopColor="#0b0b0b" />
        </linearGradient>

        <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf7f0" />
          <stop offset="100%" stopColor="#e8e1d6" />
        </linearGradient>
      </defs>

      {/* outer frame */}
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        rx={frameRx}
        fill="url(#frameGrad)"
        filter="url(#frameShadow)"
      />

      {/* 3D bevel strokes */}
      <rect
        x={12}
        y={12}
        width={width - 24}
        height={height - 24}
        rx={frameRx - 2}
        fill="none"
        stroke="url(#frameStrokeLight)"
        strokeWidth={3}
        opacity={0.9}
      />

      <rect
        x={14}
        y={14}
        width={width - 28}
        height={height - 28}
        rx={frameRx - 4}
        fill="none"
        stroke="url(#frameStrokeDark)"
        strokeWidth={3}
        opacity={0.9}
      />



      {/* inner bed */}
      <rect
        x={24}
        y={24}
        width={width - 48}
        height={height - 48}
        rx={18}
        fill="#1a1a1a"
        opacity={0.55}
      />

      {/* middle beam */}
      <rect
        x={24}
        y={beamY - 10}
        width={width - 48}
        height={20}
        rx={10}
        fill="#2a2a2a"
        opacity={0.9}
      />
      <rect
        x={34}
        y={beamY - 6}
        width={width - 68}
        height={12}
        rx={8}
        fill="#faf7f0"
        opacity={0.55}
      />

      {/* rods + beads */}
      {Array.from({ length: RODS }).map((_, i) => {
        const x = padX + i * spacing;

        // visual emphasis for ones rod
        const isOnes = i === ONES_INDEX;

        const heavenY = state.heaven[i] ? heavenActiveY : heavenRestY;
        const earthCount = state.earth[i];

        return (
          <g key={i}>
            {/* rod */}
            <rect
              x={x - 5}
              y={rodTop}
              width={15}
              height={rodBottom - rodTop}
              rx={5}
              fill="url(#railGrad)"
              opacity={isOnes ? 1 : 0.92}
            />
            {/* ones marker */}
            {isOnes && (
              <rect
                x={x - 14}
                y={rodTop + 6}
                width={28}
                height={10}
                rx={6}
                fill="#f6f7fb"
                opacity={0.75}
              />
            )}

            {/* heaven bead (click to toggle) */}
            <g
              transform={`translate(${x}, ${heavenY})`}
              style={{ transition: "transform 180ms ease" }}
              onClick={() => setHeaven(i)}
              cursor="pointer"
            >
              <g filter="url(#beadShadow)">
                <path d={beadPath(beadW, beadH)} fill="url(#beadBody)" />
                <path d={beadPath(beadW, beadH)} fill="url(#beadEdge)" opacity={0.55} />
                {/* sheen */}
                <ellipse
                  cx={-beadW * 0.18}
                  cy={-beadH * 0.20}
                  rx={beadW * 0.30}
                  ry={beadH * 0.26}
                  fill="url(#beadShine)"
                />
                {/* outline */}
                <path
                  d={beadPath(beadW, beadH)}
                  fill="none"
                  stroke="rgba(0,0,0,0.28)"
                  strokeWidth={1}
                />
              </g>
            </g>

            {/* earth beads (4) */}
            {Array.from({ length: 4 }).map((__, j) => {
              const beadNumber = j + 1; // 1..4 (top to bottom)
              const y = earthBeadY(earthCount, beadNumber);

              return (
                <g
                  key={j}
                  transform={`translate(${x}, ${y})`}
                  style={{ transition: "transform 180ms ease" }}
                  onClick={() => setEarth(i, beadNumber)}
                  cursor="pointer"
                >
                  <g filter="url(#beadShadow)">
                    <path d={beadPath(beadW, beadH)} fill="url(#beadBody)" />
                    <path d={beadPath(beadW, beadH)} fill="url(#beadEdge)" opacity={0.55} />
                    <ellipse
                      cx={-beadW * 0.18}
                      cy={-beadH * 0.20}
                      rx={beadW * 0.30}
                      ry={beadH * 0.26}
                      fill="url(#beadShine)"
                    />
                    <path
                      d={beadPath(beadW, beadH)}
                      fill="none"
                      stroke="rgba(0,0,0,0.28)"
                      strokeWidth={1}
                    />
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
