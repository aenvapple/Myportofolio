import React from 'react';
import {
  Map,
  Layers,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Terminal,
  Compass,
} from 'lucide-react';
import { GameSettings, PlayerStats, WorldZone } from '../types';
import { WORLD_ZONES } from '../data/worldZones';
import { sound } from '../audio';

interface PortfolioHUDProps {
  settings: GameSettings;
  onUpdateSettings: (updater: (prev: GameSettings) => GameSettings) => void;
  stats: PlayerStats;
  fps: number;
  onOpenMap: () => void;
  onOpenQuickView: (tab?: string) => void;
  onOpenSettings: () => void;
  onSelectZone: (zone: WorldZone) => void;
}

export const PortfolioHUD: React.FC<PortfolioHUDProps> = ({
  settings,
  onUpdateSettings,
  stats,
  fps,
  onOpenMap,
  onOpenQuickView,
  onOpenSettings,
  onSelectZone,
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    onUpdateSettings((prev) => ({ ...prev, soundEnabled: next }));
    if (next) sound.playChime(659);
  };

  const toggleDevHud = () => {
    onUpdateSettings((prev) => ({ ...prev, developerHud: !prev.developerHud }));
    sound.playChime(700);
  };

  const handleQuickLink = (key: string) => {
    sound.playChime(580);
    switch (key) {
      case 'HOME': {
        const hub = WORLD_ZONES.find((z) => z.id === 'central-hub');
        if (hub) onSelectZone(hub);
        break;
      }
      case 'ABOUT':
        onOpenQuickView('about');
        break;
      case 'PROJECTS': {
        const arcade = WORLD_ZONES.find((z) => z.id === 'project-arcade');
        if (arcade) onSelectZone(arcade);
        break;
      }
      case 'SKILLS': {
        const lab = WORLD_ZONES.find((z) => z.id === 'skill-lab');
        if (lab) onSelectZone(lab);
        break;
      }
      case 'EXPERIENCE': {
        const work = WORLD_ZONES.find((z) => z.id === 'workspace');
        if (work) onSelectZone(work);
        break;
      }
      case 'CREATIVE': {
        const park = WORLD_ZONES.find((z) => z.id === 'creative-park');
        if (park) onSelectZone(park);
        break;
      }
      case 'RESUME': {
        const resume = WORLD_ZONES.find((z) => z.id === 'resume-portal');
        if (resume) onSelectZone(resume);
        break;
      }
      case 'CONTACT': {
        const contact = WORLD_ZONES.find((z) => z.id === 'contact-station');
        if (contact) onSelectZone(contact);
        break;
      }
    }
  };

  return (
    <>
      {/* Top-Right Portfolio Controls */}
      <div className="pointer-events-auto fixed top-3 right-3 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2 select-none">
        {/* MAP Button */}
        <button
          id="btn-hud-map"
          onClick={() => {
            sound.playChime(784);
            onOpenMap();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/90 hover:text-white font-mono text-xs font-semibold shadow-md transition-all active:scale-95"
          title="Open Holographic World Map [M]"
        >
          <Map size={13} className="text-cyan-400" />
          <span>MAP</span>
        </button>

        {/* QUICK VIEW Button */}
        <button
          id="btn-hud-quickview"
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

        {/* SOUND Toggle */}
        <button
          id="btn-hud-sound"
          onClick={toggleSound}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
            settings.soundEnabled
              ? 'border-cyan-500/40 bg-slate-900/90 text-cyan-400 hover:text-white'
              : 'border-slate-800 bg-slate-900/80 text-slate-500'
          }`}
          title="Toggle Audio"
        >
          {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span className="hidden sm:inline">
            {settings.soundEnabled ? 'SOUND' : 'MUTED'}
          </span>
        </button>

        {/* SETTINGS Button */}
        <button
          id="btn-hud-settings"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          title="Open Settings"
        >
          <SlidersHorizontal size={15} />
        </button>

        {/* DEV HUD Toggle Pill */}
        <button
          onClick={toggleDevHud}
          className={`hidden xl:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
            settings.developerHud
              ? 'border-cyan-500/50 bg-cyan-950/80 text-cyan-300'
              : 'border-slate-800/80 bg-slate-900/50 text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Developer HUD Telemetry"
        >
          <Terminal size={11} />
          <span>DEV HUD: {settings.developerHud ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Bottom-Left Portfolio Quick Links Bar */}
      <div className="pointer-events-auto fixed bottom-3 left-3 sm:left-4 z-30 flex items-center select-none max-w-[calc(100vw-24px)]">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-slate-100 font-mono text-[11px] overflow-x-auto scrollbar-none">
          {/* Logo Brand Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold tracking-wider shrink-0">
            <Compass size={12} className="text-cyan-400 animate-spin-slow" />
            <span>EVAN.OS</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 shrink-0 mx-0.5" />

          {/* Quick links */}
          {[
            { label: 'HOME', key: 'HOME' },
            { label: 'ABOUT', key: 'ABOUT' },
            { label: 'PROJECTS', key: 'PROJECTS' },
            { label: 'SKILLS', key: 'SKILLS' },
            { label: 'EXPERIENCE', key: 'EXPERIENCE' },
            { label: 'CREATIVE', key: 'CREATIVE' },
            { label: 'RESUME', key: 'RESUME' },
            { label: 'CONTACT', key: 'CONTACT' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleQuickLink(item.key)}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0 text-[10px] sm:text-[11px] font-semibold tracking-wide"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Developer HUD Telemetry (Rendered ONLY when Developer HUD is ON) */}
      {settings.developerHud && (
        <div className="pointer-events-auto fixed top-16 right-4 z-30 p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 shadow-2xl font-mono text-[11px] text-slate-300 space-y-1.5 animate-fade-in select-none min-w-[210px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-cyan-400 font-bold text-[10px]">
            <span>ENGINE TELEMETRY</span>
            <span className="text-emerald-400">{fps} FPS</span>
          </div>
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-500">POSITION:</span>
              <span className="text-slate-200">
                X:{stats.x.toFixed(1)} Y:{stats.y.toFixed(1)} Z:{stats.z.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">VELOCITY:</span>
              <span className="text-cyan-400">{stats.speed.toFixed(2)} u/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GROUNDED:</span>
              <span className={stats.isGrounded ? 'text-emerald-400' : 'text-amber-400'}>
                {stats.isGrounded ? 'TRUE' : 'AIRBORNE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">HEADING:</span>
              <span>{stats.headingDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RENDER LOOP:</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
