import React from 'react';
import { X, Navigation, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { WorldZone } from '../types';
import { sound } from '../audio';

interface ZoneInformationPanelProps {
  zone: WorldZone | null;
  onClose: () => void;
  onEnter: (zone: WorldZone) => void;
  onSetWaypoint: (zone: WorldZone) => void;
  onFastTravel: (zone: WorldZone) => void;
}

export const ZoneInformationPanel: React.FC<ZoneInformationPanelProps> = ({
  zone,
  onClose,
  onEnter,
  onSetWaypoint,
  onFastTravel,
}) => {
  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 font-sans">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold">
                {zone.code}
              </span>
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
                {zone.tag}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
              {zone.name}
            </h2>
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

        {/* Tagline & Description */}
        <div className="mb-4">
          <div className="text-xs font-mono font-medium text-cyan-400 mb-1.5">
            "{zone.tagline}"
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {zone.description}
          </p>
        </div>

        {/* Key Highlights */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles size={11} className="text-cyan-400" />
            <span>DISCOVERY HIGHLIGHTS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 font-sans">
            {zone.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSetWaypoint(zone);
                onClose();
                sound.playChime(580);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors"
              title="Set active waypoint guide"
            >
              <Navigation size={13} className="text-cyan-400" />
              <span>SET WAYPOINT</span>
            </button>

            <button
              onClick={() => {
                onFastTravel(zone);
                onClose();
                sound.playChime(659);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors"
              title="Fast travel avatar to zone entrance"
            >
              <span>TELEPORT</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playChime(350);
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              CLOSE
            </button>

            <button
              onClick={() => {
                onEnter(zone);
                onClose();
                sound.playChime(880);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-98 transition-all"
            >
              <ExternalLink size={13} />
              <span>ENTER EXPERIENCE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
