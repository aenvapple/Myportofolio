import React, { useEffect } from 'react';
import { Navigation, X, Check } from 'lucide-react';
import { PlayerStats, Waypoint } from '../types';
import { sound } from '../audio';

interface WaypointBannerProps {
  waypoint: Waypoint | null;
  stats: PlayerStats;
  onClear: () => void;
}

export const WaypointBanner: React.FC<WaypointBannerProps> = ({
  waypoint,
  stats,
  onClear,
}) => {
  if (!waypoint) return null;

  const dx = waypoint.coords[0] - stats.x;
  const dz = waypoint.coords[2] - stats.z;
  const distance = Math.hypot(dx, dz);

  // Target angle in world space
  const targetAngleDeg = ((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360;
  // Relative angle to player's current heading
  const relativeAngle = (targetAngleDeg - stats.headingDeg + 360) % 360;

  // Auto clear when reached
  useEffect(() => {
    if (distance < 4.2) {
      sound.playChime(880);
      const timer = setTimeout(() => {
        onClear();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [distance, onClear]);

  const hasArrived = distance < 4.2;

  return (
    <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-40 animate-fade-in select-none">
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.3)] text-slate-100 font-mono text-xs">
        {hasArrived ? (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Check size={14} className="text-emerald-400" />
            <span>ARRIVED AT {waypoint.name.toUpperCase()}</span>
          </div>
        ) : (
          <>
            {/* Direction pointer arrow */}
            <div
              className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 transition-transform"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
              <Navigation size={12} className="fill-current" />
            </div>

            <div className="flex items-center gap-2 font-sans font-medium">
              <span className="text-slate-400 font-mono text-[10px] uppercase">WAYPOINT:</span>
              <span className="font-bold text-white text-xs">{waypoint.name}</span>
              <span className="text-cyan-400 font-mono text-xs font-bold">
                {distance.toFixed(0)}m
              </span>
            </div>
          </>
        )}

        <button
          onClick={onClear}
          className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss Waypoint"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
