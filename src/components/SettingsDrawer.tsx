import React from 'react';
import { X, Camera, Sun, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';
import { GameSettings, TimeOfDay } from '../types';
import { sound } from '../audio';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const setTime = (time: TimeOfDay) => {
    onUpdateSettings((prev) => ({ ...prev, timeOfDay: time }));
    sound.playChime(700);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-md h-full bg-slate-950/95 border-l border-cyan-500/30 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto font-mono text-slate-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                EVAN.OS CONTROL PANEL
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">ENVIRONMENT & SIMULATION</p>
            </div>
            <button
              id="btn-close-settings"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section: Environment Lighting */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <Sun size={14} />
              <span>TIME OF DAY & CELESTIAL LIGHTING</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['day', 'sunset', 'twilight', 'night'] as TimeOfDay[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    settings.timeOfDay === t
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Audio Synthesizer */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <Volume2 size={14} />
              <span>WEB AUDIO ENGINE</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white font-sans">Procedural Audio</div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Ocean surf, footsteps & holographic chimes
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !settings.soundEnabled;
                  sound.setEnabled(next);
                  onUpdateSettings((prev) => ({ ...prev, soundEnabled: next }));
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  settings.soundEnabled
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Section: Camera & Viewport */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <Camera size={14} />
              <span>CAMERA CONTROLLER</span>
            </div>
            <div className="space-y-3 p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                • <strong>Mouse Drag</strong>: Free orbit around avatar
                <br />
                • <strong>Mouse Wheel</strong>: Smooth zoom in/out (3m – 22m)
                <br />
                • <strong>[C] Key</strong>: Quick cycle camera distance
                <br />
                • <strong>Smooth Follow</strong>: Dual-axis spring lerp with automatic terrain collision avoidance
              </div>
            </div>
          </div>

          {/* Section: Developer HUD Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>DIAGNOSTICS & TELEMETRY</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/70 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white font-sans">Developer HUD</div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Coordinate telemetry, raw FPS &amp; physics metrics
                </div>
              </div>
              <button
                onClick={() => {
                  onUpdateSettings((prev) => ({ ...prev, developerHud: !prev.developerHud }));
                  sound.playChime(600);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  settings.developerHud
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.developerHud ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Section: Collision & Physics */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>COLLISION MATRIX</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-sans text-slate-400 space-y-1">
              <div>✔ Low-poly pine & deciduous tree bounding colliders</div>
              <div>✔ Low-poly boulders & rock outcrop physics</div>
              <div>✔ Lighthouse base & Data monolith perimeter</div>
              <div>✔ Wooden pier dock edges & shoreline bounds</div>
            </div>
          </div>

          {/* Section: Quick Controls Reference */}
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              <HelpCircle size={14} />
              <span>CONTROLS CHEATSHEET</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">WASD / ARROWS</span>
                <span>Camera-Relative Movement</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHIFT</span>
                <span>Sprint (1.8x Velocity)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SPACE</span>
                <span>Jump with Gravity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">E</span>
                <span>Inspect Nearby POI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">R</span>
                <span>Reset Avatar Position</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>EVAN.OS ARCHIPELAGO</span>
          <span>THREE.JS + REACT</span>
        </div>
      </div>
    </div>
  );
};
