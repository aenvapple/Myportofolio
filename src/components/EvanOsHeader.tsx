import React from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  SlidersHorizontal,
  Map,
  Layers,
  Terminal,
} from 'lucide-react';
import { GameSettings, PlayerStats, TimeOfDay } from '../types';
import { sound } from '../audio';

interface EvanOsHeaderProps {
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
  stats: PlayerStats;
  fps: number;
  onToggleSettings: () => void;
  onOpenMap: () => void;
  onOpenQuickView: (tab?: string) => void;
}

export const EvanOsHeader: React.FC<EvanOsHeaderProps> = ({
  settings,
  onUpdateSettings,
  stats,
  fps,
  onToggleSettings,
  onOpenMap,
  onOpenQuickView,
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    onUpdateSettings((prev) => ({ ...prev, soundEnabled: next }));
    if (next) sound.playChime(659);
  };

  const setTime = (time: TimeOfDay) => {
    onUpdateSettings((prev) => ({ ...prev, timeOfDay: time }));
    sound.playChime(784);
  };

  const toggleDevHud = () => {
    onUpdateSettings((prev) => ({ ...prev, developerHud: !prev.developerHud }));
    sound.playChime(600);
  };

  return (
    <header
      id="evan-os-header"
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 md:px-6 py-2 bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/20 text-slate-100 select-none shadow-xl"
    >
      {/* Left: Brand Identity & Kernel Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/40 text-slate-950 font-mono font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            E
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-mono font-bold text-base tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                EVAN.OS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                PORTFOLIO HUB
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider">
              ISLE-07 // EVAN CHANDRA MAULANA
            </div>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          id="btn-sound-toggle"
          onClick={toggleSound}
          className={`p-1.5 rounded-lg border transition-colors ${
            settings.soundEnabled
              ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/40'
              : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
          }`}
          title={settings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

      {/* Center: Lighting & Time-of-Day Modes */}
      <div className="hidden md:flex items-center p-1 rounded-lg bg-slate-900/80 border border-slate-800">
        <button
          id="time-btn-day"
          onClick={() => setTime('day')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
            settings.timeOfDay === 'day'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun size={13} />
          <span>DAY</span>
        </button>

        <button
          id="time-btn-sunset"
          onClick={() => setTime('sunset')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
            settings.timeOfDay === 'sunset'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sunset size={13} />
          <span>SUNSET</span>
        </button>

        <button
          id="time-btn-twilight"
          onClick={() => setTime('twilight')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
            settings.timeOfDay === 'twilight'
              ? 'bg-indigo-500 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={13} />
          <span>TWILIGHT</span>
        </button>

        <button
          id="time-btn-night"
          onClick={() => setTime('night')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
            settings.timeOfDay === 'night'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Moon size={13} />
          <span>NIGHT</span>
        </button>
      </div>

      {/* Right: Portfolio Actions & Config (MAP, QUICK VIEW, SOUND, SETTINGS) */}
      <div className="flex items-center gap-2">
        {/* MAP Button */}
        <button
          id="btn-header-map"
          onClick={() => {
            sound.playChime(784);
            onOpenMap();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 hover:text-white font-mono text-xs font-semibold shadow-sm transition-all"
          title="Open Holographic World Map [M]"
        >
          <Map size={13} className="text-cyan-400" />
          <span className="hidden sm:inline">MAP</span>
        </button>

        {/* QUICK VIEW Button */}
        <button
          id="btn-header-quickview"
          onClick={() => {
            sound.playChime(880);
            onOpenQuickView('about');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:brightness-110 active:scale-95 transition-all"
          title="Open Recruiter Quick View [Q]"
        >
          <Layers size={13} />
          <span>QUICK VIEW</span>
        </button>

        {/* Developer HUD Telemetry (Rendered ONLY when developerHud is true) */}
        {settings.developerHud && (
          <div className="hidden xl:flex items-center gap-2 font-mono text-[10px] px-2 py-1 rounded bg-slate-900/90 border border-cyan-500/30 text-slate-300">
            <Terminal size={12} className="text-cyan-400" />
            <span>X:{stats.x.toFixed(1)}</span>
            <span>Z:{stats.z.toFixed(1)}</span>
            <span className="text-emerald-400 font-bold">{fps}FPS</span>
          </div>
        )}

        {/* Dev HUD Toggle Pill */}
        <button
          onClick={toggleDevHud}
          className={`hidden 2xl:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
            settings.developerHud
              ? 'border-cyan-500/50 bg-cyan-950/80 text-cyan-300'
              : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Developer HUD Telemetry"
        >
          <span>DEV HUD: {settings.developerHud ? 'ON' : 'OFF'}</span>
        </button>

        {/* Settings button */}
        <button
          id="btn-settings"
          onClick={onToggleSettings}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          title="Open Settings"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>
    </header>
  );
};
