import React, { useState } from 'react';
import { Compass, Eye, MapPin, Footprints, MousePointer } from 'lucide-react';
import { PlayerStats, PointOfInterest, WorldZone } from '../types';
import { WORLD_ZONES } from '../data/worldZones';

interface ControlsOverlayProps {
  stats: PlayerStats;
  nearbyPoi: PointOfInterest | null;
  nearbyZone: WorldZone | null;
  onInspectPoi: (poi: PointOfInterest) => void;
  onInspectZone: (zone: WorldZone) => void;
  onTeleportToZone: (zone: WorldZone) => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  stats,
  nearbyPoi,
  nearbyZone,
  onInspectPoi,
  onInspectZone,
  onTeleportToZone,
}) => {
  const [radarExpanded, setRadarExpanded] = useState<boolean>(false);

  // Radar coordinate translation
  // Island radius is ~36, radar canvas is 130x130 pixels, center is (65, 65)
  const radarRadius = 52;
  const islandMax = 36;
  const toRadar = (x: number, z: number) => {
    return {
      rx: 65 + (x / islandMax) * radarRadius,
      rz: 65 + (z / islandMax) * radarRadius,
    };
  };

  const playerRadar = toRadar(stats.x, stats.z);

  // Virtual input trigger helpers for touch / mobile
  const triggerKeyEvent = (code: string, type: 'keydown' | 'keyup') => {
    window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
      {/* Top-Left: Holographic Island Radar */}
      <div className="pointer-events-auto absolute top-16 left-3 sm:left-4 z-20 flex flex-col gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 shadow-2xl text-slate-100">
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold tracking-wider">
              <Compass size={13} className="text-cyan-400 animate-spin-slow" />
              <span>RADAR // ZONES</span>
            </div>
            <button
              onClick={() => setRadarExpanded(!radarExpanded)}
              className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {radarExpanded ? 'COMPACT' : 'EXPAND'}
            </button>
          </div>

          {/* Stylized Circular Radar Display */}
          <div className="relative w-[130px] h-[130px] rounded-full bg-slate-900/90 border border-cyan-500/40 overflow-hidden flex items-center justify-center mx-auto shadow-inner">
            {/* Grid concentric rings */}
            <div className="absolute inset-2 rounded-full border border-cyan-500/15" />
            <div className="absolute inset-6 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-10 rounded-full border border-cyan-500/25" />
            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

            {/* Island outline */}
            <div className="absolute w-[104px] h-[104px] rounded-full border border-emerald-500/30 bg-emerald-950/15" />

            {/* WORLD ZONE MARKERS WITH SYMBOLS */}
            {WORLD_ZONES.map((zone) => {
              const { rx, rz } = toRadar(zone.coords[0], zone.coords[2]);
              const dist = Math.hypot(zone.coords[0] - stats.x, zone.coords[2] - stats.z);
              const isNearby = dist < 7.5;
              const isClosest = nearbyZone?.id === zone.id;

              return (
                <button
                  key={zone.id}
                  onClick={() => onInspectZone(zone)}
                  title={`${zone.name} [${zone.radarSymbol}] - Click to inspect`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-mono text-[9px] font-bold transition-all hover:scale-150 ${
                    isClosest
                      ? 'w-4 h-4 ring-2 ring-cyan-300 scale-125 z-20 shadow-[0_0_10px_#38bdf8]'
                      : isNearby
                      ? 'w-3.5 h-3.5 ring-1 ring-white/60 z-10'
                      : 'w-3 h-3 opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    left: `${rx}px`,
                    top: `${rz}px`,
                    backgroundColor: isClosest || isNearby ? zone.color : '#1e293b',
                    color: isClosest || isNearby ? '#020617' : zone.color,
                    border: `1px solid ${zone.color}`,
                  }}
                >
                  {zone.radarSymbol}
                </button>
              );
            })}

            {/* Player Blip with Directional Cone */}
            <div
              className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              style={{
                left: `${playerRadar.rx}px`,
                top: `${playerRadar.rz}px`,
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-transform"
                style={{ transform: `rotate(${stats.headingDeg}deg)` }}
              >
                {/* Heading needle */}
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[8px] border-b-cyan-300" />
              </div>
              <div className="absolute inset-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>

          {/* Heading & Speed Readout */}
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>HDG: {stats.headingDeg}°</span>
            <span>SPD: {stats.speed.toFixed(1)} u/s</span>
          </div>

          {/* Expanded Zone Directory for Quick Navigation */}
          {radarExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1 max-h-48 overflow-y-auto">
              <div className="text-[10px] font-mono text-slate-400 uppercase">ZONE DIRECTORY:</div>
              {WORLD_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => onInspectZone(zone)}
                  className="flex items-center justify-between text-left px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold text-slate-950 shrink-0"
                      style={{ backgroundColor: zone.color }}
                    >
                      {zone.radarSymbol}
                    </span>
                    <span className="text-slate-200 truncate">{zone.name}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">
                    {Math.hypot(zone.coords[0] - stats.x, zone.coords[2] - stats.z).toFixed(0)}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Center: Interactive Proximity Prompt for World Zone */}
      {nearbyZone && (
        <div className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            id="btn-inspect-zone-prompt"
            onClick={() => onInspectZone(nearbyZone)}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-950/95 border border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.5)] backdrop-blur-md text-slate-100 hover:bg-cyan-950/90 transition-all cursor-pointer"
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full font-mono font-bold text-xs shadow"
              style={{ backgroundColor: nearbyZone.color, color: '#020617' }}
            >
              {nearbyZone.radarSymbol}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 leading-none">
                ZONE DISCOVERED // PRESS [E]
              </div>
              <div className="text-xs font-bold text-white">
                Enter {nearbyZone.name}
              </div>
            </div>
            <Eye size={16} className="text-cyan-400" />
          </button>
        </div>
      )}

      {/* Bottom-Left: Desktop WASD Keyboard & Mouse HUD */}
      <div className="pointer-events-auto hidden md:flex absolute bottom-4 left-4 z-20 items-end gap-4">
        {/* WASD Visual Key Matrix */}
        <div className="p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 text-slate-300 font-mono text-xs shadow-xl flex flex-col gap-1.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            NAVIGATION MATRIX
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex justify-center">
              <kbd className="w-8 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-200 font-bold shadow">
                W
              </kbd>
            </div>
            <div className="flex gap-1">
              <kbd className="w-8 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-200 font-bold shadow">
                A
              </kbd>
              <kbd className="w-8 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-200 font-bold shadow">
                S
              </kbd>
              <kbd className="w-8 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-200 font-bold shadow">
                D
              </kbd>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>[SHIFT] Sprint</span>
            <span>[SPACE] Jump</span>
          </div>
        </div>

        {/* Mouse Orbit Guide */}
        <div className="p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 text-slate-300 font-mono text-xs shadow-xl flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
            <MousePointer size={12} />
            <span>CAMERA CONTROL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            • <strong className="text-slate-200">Drag Mouse</strong>: Orbit third-person view
          </div>
          <div className="text-[11px] text-slate-400">
            • <strong className="text-slate-200">Scroll Wheel</strong>: Zoom distance
          </div>
          <div className="text-[11px] text-slate-400">
            • <strong className="text-slate-200">[C] Key</strong>: Cycle camera view
          </div>
        </div>
      </div>

      {/* Mobile / Touch On-Screen Controls */}
      <div className="pointer-events-auto md:hidden absolute bottom-4 left-4 z-20 flex flex-col gap-1">
        <div className="flex justify-center">
          <button
            onPointerDown={() => triggerKeyEvent('KeyW', 'keydown')}
            onPointerUp={() => triggerKeyEvent('KeyW', 'keyup')}
            onPointerLeave={() => triggerKeyEvent('KeyW', 'keyup')}
            className="w-11 h-11 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-bold flex items-center justify-center active:bg-cyan-600 shadow-lg text-sm"
          >
            ▲
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onPointerDown={() => triggerKeyEvent('KeyA', 'keydown')}
            onPointerUp={() => triggerKeyEvent('KeyA', 'keyup')}
            onPointerLeave={() => triggerKeyEvent('KeyA', 'keyup')}
            className="w-11 h-11 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-bold flex items-center justify-center active:bg-cyan-600 shadow-lg text-sm"
          >
            ◀
          </button>
          <button
            onPointerDown={() => triggerKeyEvent('KeyS', 'keydown')}
            onPointerUp={() => triggerKeyEvent('KeyS', 'keyup')}
            onPointerLeave={() => triggerKeyEvent('KeyS', 'keyup')}
            className="w-11 h-11 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-bold flex items-center justify-center active:bg-cyan-600 shadow-lg text-sm"
          >
            ▼
          </button>
          <button
            onPointerDown={() => triggerKeyEvent('KeyD', 'keydown')}
            onPointerUp={() => triggerKeyEvent('KeyD', 'keyup')}
            onPointerLeave={() => triggerKeyEvent('KeyD', 'keyup')}
            className="w-11 h-11 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-bold flex items-center justify-center active:bg-cyan-600 shadow-lg text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Mobile Jump & Sprint Action Buttons */}
      <div className="pointer-events-auto md:hidden absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          onPointerDown={() => triggerKeyEvent('ShiftLeft', 'keydown')}
          onPointerUp={() => triggerKeyEvent('ShiftLeft', 'keyup')}
          onPointerLeave={() => triggerKeyEvent('ShiftLeft', 'keyup')}
          className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700 text-cyan-400 font-mono text-[11px] font-bold flex flex-col items-center justify-center active:bg-cyan-600 active:text-white shadow-lg"
        >
          <Footprints size={14} />
          RUN
        </button>

        <button
          onPointerDown={() => triggerKeyEvent('Space', 'keydown')}
          onPointerUp={() => triggerKeyEvent('Space', 'keyup')}
          onPointerLeave={() => triggerKeyEvent('Space', 'keyup')}
          className="w-14 h-14 rounded-full bg-cyan-600 border border-cyan-400 text-white font-mono font-bold flex items-center justify-center active:bg-cyan-400 active:text-slate-950 shadow-xl"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
