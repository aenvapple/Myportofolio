import React, { useEffect, useState } from 'react';
import { Compass, FileText, Sparkles, X } from 'lucide-react';
import { sound } from '../audio';

interface CentralHubIntroProps {
  onExplore: () => void;
  onViewResume: () => void;
}

export const CentralHubIntro: React.FC<CentralHubIntroProps> = ({
  onExplore,
  onViewResume,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('evan_os_hub_intro_seen');
    if (!hasSeen) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => {
        setIsOpen(true);
        sound.playChime(659.25);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('evan_os_hub_intro_seen', 'true');
    setIsOpen(false);
    onExplore();
    sound.playChime(523.25);
  };

  const handleResume = () => {
    sessionStorage.setItem('evan_os_hub_intro_seen', 'true');
    setIsOpen(false);
    onViewResume();
    sound.playChime(784);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-400/40 p-7 shadow-[0_0_60px_rgba(6,182,212,0.3)] text-slate-100 font-sans">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono font-semibold text-cyan-300 mb-4 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Sparkles size={12} className="animate-spin-slow text-cyan-400" />
          <span>EVAN.OS WORLD HUB // SECTOR 07</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-white">
          HELLO, I'M EVAN.
        </h1>
        <h2 className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
          EVAN CHANDRA MAULANA
        </h2>
        <div className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase mt-1">
          Informatics • Creative • Digital
        </div>

        {/* Body */}
        <p className="text-sm text-slate-300 leading-relaxed mt-4 font-normal">
          Welcome to <strong className="text-cyan-300">EVAN.OS</strong> — a small digital world where my projects, skills, experience and ideas come together.
        </p>

        <p className="text-xs text-slate-400 leading-relaxed mt-2">
          Walk freely using <strong>WASD / Arrow keys</strong> or use the top <strong>MAP</strong> &amp; <strong>QUICK VIEW</strong> shortcuts to jump straight to specific portfolio sections.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={handleDismiss}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-98 transition-all"
          >
            <Compass size={15} />
            <span>EXPLORE WORLD</span>
          </button>

          <button
            onClick={handleResume}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 hover:text-white hover:border-cyan-400/50 font-medium text-xs tracking-wider transition-all"
          >
            <FileText size={15} className="text-cyan-400" />
            <span>VIEW RESUME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
