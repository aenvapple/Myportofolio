import React from 'react';
import { X, Radio, Cpu, Sun, Flame, Anchor, Navigation, Terminal, CheckCircle2 } from 'lucide-react';
import { PointOfInterest } from '../types';
import { sound } from '../audio';

interface PoiModalProps {
  poi: PointOfInterest | null;
  onClose: () => void;
  onTeleport: (poi: PointOfInterest) => void;
}

export const PoiModal: React.FC<PoiModalProps> = ({ poi, onClose, onTeleport }) => {
  if (!poi) return null;

  const renderIcon = () => {
    switch (poi.icon) {
      case 'Radio':
        return <Radio size={22} className="text-sky-400" />;
      case 'Cpu':
        return <Cpu size={22} className="text-purple-400" />;
      case 'Sun':
        return <Sun size={22} className="text-amber-400" />;
      case 'Flame':
        return <Flame size={22} className="text-orange-400" />;
      case 'Anchor':
        return <Anchor size={22} className="text-emerald-400" />;
      default:
        return <Terminal size={22} className="text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 text-slate-100 font-mono select-none">
        {/* Top bar */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border border-cyan-500/30"
              style={{ backgroundColor: `${poi.color}18` }}
            >
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {poi.code}
                </span>
                <span className="text-xs text-cyan-400 tracking-wider uppercase font-bold">
                  {poi.tag}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 font-sans">
                {poi.title}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-poi-modal"
            onClick={() => {
              sound.playChime(350);
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <div className="text-sm font-sans text-slate-300 leading-relaxed mb-4">
          {poi.description}
        </div>

        {/* Diagnostics & Coords */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase">COORDINATES</div>
            <div className="text-slate-200 mt-1 font-semibold">
              X: {poi.coords[0].toFixed(1)} | Y: {poi.coords[1].toFixed(1)} | Z: {poi.coords[2].toFixed(1)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-slate-500 text-[10px] uppercase">SUBSYSTEM STATUS</div>
            <div className="flex items-center gap-1.5 text-emerald-400 mt-1 font-semibold">
              <CheckCircle2 size={13} />
              <span>{poi.status}</span>
            </div>
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs mb-5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2 font-bold tracking-wider">
            <Terminal size={12} className="text-cyan-400" />
            <span>EVAN.OS TELEMETRY LOGS</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-300">
            {poi.logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-cyan-500 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              sound.playChime(350);
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 text-xs font-sans font-medium hover:bg-slate-900 transition-colors"
          >
            Dismiss [ESC]
          </button>

          <button
            id="btn-teleport-to-poi"
            onClick={() => {
              onTeleport(poi);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-sans font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Navigation size={14} />
            <span>Teleport Avatar Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};
