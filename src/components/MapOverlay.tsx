import React, { useState } from 'react';
import { X, Navigation, Compass, MapPin, Sparkles } from 'lucide-react';
import { PlayerStats, WorldZone } from '../types';
import { WORLD_ZONES } from '../data/worldZones';
import { sound } from '../audio';

interface MapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onSetWaypoint: (zone: WorldZone) => void;
  onFastTravel: (zone: WorldZone) => void;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  isOpen,
  onClose,
  stats,
  onSetWaypoint,
  onFastTravel,
}) => {
  const [selectedZone, setSelectedZone] = useState<WorldZone | null>(WORLD_ZONES[0]);

  if (!isOpen) return null;

  // Map coordinate translation
  // World bounds: X: [-24, 24], Z: [-30, 34]
  // Blueprint canvas width/height: 600 x 540
  const mapWidth = 560;
  const mapHeight = 520;
  const centerX = mapWidth / 2;
  const centerY = mapHeight * 0.42;
  const scale = 7.6; // pixels per world unit

  const toMapCoords = (x: number, z: number) => {
    return {
      mx: centerX + x * scale,
      my: centerY + z * scale,
    };
  };

  const playerMap = toMapCoords(stats.x, stats.z);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-2xl bg-slate-950/95 border border-cyan-500/35 p-4 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col justify-between text-slate-100 font-sans overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Compass size={18} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono tracking-wider text-white">
                  EVAN.OS CARTOGRAPHY BLUEPRINT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  SECTOR: ISLE-07
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                TOPOLOGICAL OVERVIEW &amp; WAYPOINT DISPATCH
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChime(350);
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Blueprint Map Area & Inspector Pane */}
        <div className="flex-1 my-3 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Schematic SVG Map Viewport */}
          <div className="flex-1 relative rounded-xl bg-slate-900/90 border border-cyan-500/25 overflow-hidden flex items-center justify-center p-2 shadow-inner">
            {/* Blueprint Grid Lines Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

            {/* SVG Interactive Blueprint */}
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full max-h-[460px] relative z-10"
            >
              {/* Island Boundary Rings */}
              <circle
                cx={centerX}
                cy={centerY}
                r={245}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.35"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={210}
                fill="#0f172a"
                fillOpacity="0.5"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Connecting Pathway Lines from Central Hub to Zones */}
              {WORLD_ZONES.map((zone) => {
                if (zone.id === 'central-hub') return null;
                const { mx, my } = toMapCoords(zone.coords[0], zone.coords[2]);
                const hub = toMapCoords(0, 0);
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <line
                    key={`line-${zone.id}`}
                    x1={hub.mx}
                    y1={hub.my}
                    x2={mx}
                    y2={my}
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? '2' : '1'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                    opacity={isSelected ? '0.9' : '0.45'}
                  />
                );
              })}

              {/* Central Hub Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={44}
                fill="#0369a1"
                fillOpacity="0.25"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Zone Pins */}
              {WORLD_ZONES.map((zone) => {
                const { mx, my } = toMapCoords(zone.coords[0], zone.coords[2]);
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <g
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      sound.playChime(600);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        cx={mx}
                        cy={my}
                        r={18}
                        fill="none"
                        stroke={zone.color}
                        strokeWidth="1.8"
                        className="animate-ping origin-center"
                        opacity="0.6"
                      />
                    )}

                    {/* Zone Node Circle */}
                    <circle
                      cx={mx}
                      cy={my}
                      r={isSelected ? 14 : 11}
                      fill={isSelected ? zone.color : '#0f172a'}
                      stroke={zone.color}
                      strokeWidth="2"
                      className="transition-all group-hover:scale-125"
                    />

                    {/* Zone Symbol Label */}
                    <text
                      x={mx}
                      y={my + 4}
                      textAnchor="middle"
                      fill={isSelected ? '#020617' : '#f8fafc'}
                      fontSize={isSelected ? '11px' : '9px'}
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {zone.radarSymbol}
                    </text>

                    {/* Zone Name Tag */}
                    <text
                      x={mx}
                      y={my + 24}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="9px"
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none select-none"
                    >
                      {zone.name}
                    </text>
                  </g>
                );
              })}

              {/* Current Player Avatar Blip */}
              <g>
                <circle
                  cx={playerMap.mx}
                  cy={playerMap.my}
                  r={8}
                  fill="#22d3ee"
                  className="animate-pulse"
                />
                <circle
                  cx={playerMap.mx}
                  cy={playerMap.my}
                  r={14}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <text
                  x={playerMap.mx}
                  y={playerMap.my - 12}
                  textAnchor="middle"
                  fill="#22d3ee"
                  fontSize="8px"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  YOU
                </text>
              </g>
            </svg>

            {/* Compass Rose */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded border border-cyan-500/20">
              NORTH ▲ [0°]
            </div>
          </div>

          {/* Selected Zone Inspector Card */}
          <div className="w-full lg:w-72 rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between shadow-xl">
            {selectedZone ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-bold">
                    {selectedZone.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {selectedZone.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedZone.color }} />
                  {selectedZone.name}
                </h3>

                <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                  {selectedZone.description}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>COORDINATES:</span>
                    <span className="text-slate-200">
                      X: {selectedZone.coords[0]} | Z: {selectedZone.coords[2]}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>DISTANCE:</span>
                    <span className="text-cyan-400 font-bold">
                      {Math.hypot(
                        selectedZone.coords[0] - stats.x,
                        selectedZone.coords[2] - stats.z
                      ).toFixed(0)}m
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-400" />
                    <span>FEATURES:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-0.5">
                    {selectedZone.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-cyan-400 text-[10px]">•</span>
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-8 font-mono">
                Click any zone marker on the blueprint map to view details.
              </div>
            )}

            {/* Actions for Selected Zone */}
            {selectedZone && (
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSetWaypoint(selectedZone);
                    onClose();
                    sound.playChime(659);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-98"
                >
                  <Navigation size={13} />
                  <span>SET WAYPOINT [NAVIGATE]</span>
                </button>

                <button
                  onClick={() => {
                    onFastTravel(selectedZone);
                    onClose();
                    sound.playChime(784);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                >
                  <MapPin size={12} className="text-cyan-400" />
                  <span>FAST TRAVEL (TELEPORT)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Click any landmark node to set active navigation trajectory.</span>
          <span>PRESS [M] OR ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
