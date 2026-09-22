import React, { useState } from 'react';
import {
  X,
  Compass,
  User,
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  ExternalLink,
  Github,
  Linkedin,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  PORTFOLIO_PROFILE,
  PORTFOLIO_PROJECTS,
  PORTFOLIO_SKILLS,
  PORTFOLIO_EXPERIENCE,
  PORTFOLIO_EDUCATION,
} from '../data/portfolioData';
import { sound } from '../audio';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const QuickView: React.FC<QuickViewProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'ABOUT', icon: User },
    { id: 'projects', label: 'PROJECTS', icon: FolderGit2 },
    { id: 'skills', label: 'SKILLS', icon: Cpu },
    { id: 'experience', label: 'EXPERIENCE', icon: Briefcase },
    { id: 'education', label: 'EDUCATION', icon: GraduationCap },
    { id: 'resume', label: 'RESUME', icon: FileText },
    { id: 'contact', label: 'CONTACT', icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[760px] rounded-2xl bg-slate-950/95 border border-cyan-500/35 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-mono font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-wide">
                  {PORTFOLIO_PROFILE.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  RECRUITER QUICK VIEW
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {PORTFOLIO_PROFILE.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playChime(523);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              <Compass size={14} />
              <span>RETURN TO WORLD</span>
            </button>

            <button
              onClick={() => {
                sound.playChime(350);
                onClose();
              }}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  sound.playChime(650);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto font-sans">
          {/* 1. ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-400 mb-2">
                  <Sparkles size={12} />
                  <span>BIOGRAPHY &amp; VISION</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Crafting interactive digital worlds &amp; robust software systems.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mt-3">
                  {PORTFOLIO_PROFILE.bio}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mt-2">
                  {PORTFOLIO_PROFILE.tagline}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">LOCATION &amp; AVAILABILITY</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-cyan-400" />
                    <span>{PORTFOLIO_PROFILE.location}</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>{PORTFOLIO_PROFILE.status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">DIRECT DISPATCH</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1">
                    {PORTFOLIO_PROFILE.email}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Open for engineering roles &amp; contract collaborations.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Featured Project Portfolio</h3>
                <p className="text-xs text-slate-400">Interactive systems, full-stack architectures, and graphical experiments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PORTFOLIO_PROJECTS.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {proj.category}
                        </span>
                        <ExternalLink size={14} className="text-slate-500 hover:text-cyan-400 cursor-pointer" />
                      </div>
                      <h4 className="text-base font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
                      {proj.tech.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Technical Arsenal &amp; Capabilities</h3>
                <p className="text-xs text-slate-400">Tools, languages, and technologies utilized across client and personal software.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PORTFOLIO_SKILLS.map((grp, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {grp.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {grp.skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/60 text-xs font-mono text-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-4 max-w-3xl">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Career Trajectory &amp; Experience</h3>
                <p className="text-xs text-slate-400">Chronological track record of engineering impact and contributions.</p>
              </div>

              <div className="space-y-4">
                {PORTFOLIO_EXPERIENCE.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {exp.period}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {exp.company}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{exp.role}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 font-normal">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-4 max-w-3xl">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Academic Credentials &amp; Studies</h3>
                <p className="text-xs text-slate-400">Foundational informatics theory and dedicated domain specialization.</p>
              </div>

              <div className="space-y-4">
                {PORTFOLIO_EDUCATION.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <div className="text-xs font-mono font-bold text-cyan-400 mb-1">
                      {edu.period}
                    </div>
                    <h4 className="text-base font-bold text-white">{edu.degree}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">{edu.institution}</div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {edu.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. RESUME TAB */}
          {activeTab === 'resume' && (
            <div className="max-w-3xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Curriculum Vitae</h3>
                  <p className="text-xs text-slate-400">Verified qualifications, technical proficiency, and career chronology.</p>
                </div>
                <button
                  onClick={() => sound.playChime(880)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <FileText size={14} />
                  <span>DOWNLOAD PDF</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-4 text-slate-300">
                <div>
                  <div className="text-white font-bold text-base">{PORTFOLIO_PROFILE.name}</div>
                  <div className="text-cyan-400">{PORTFOLIO_PROFILE.role}</div>
                  <div className="text-slate-500 text-[11px] mt-1">{PORTFOLIO_PROFILE.email} • {PORTFOLIO_PROFILE.location}</div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">EXECUTIVE SUMMARY</div>
                  <p className="text-slate-400 font-sans text-xs leading-relaxed">
                    {PORTFOLIO_PROFILE.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">CORE TECHNICAL SKILLS</div>
                  <div className="text-slate-400 font-sans text-xs">
                    React 19, TypeScript, Three.js, WebGL, Node.js, Python, Tailwind CSS, REST APIs, Cloud Systems.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Let's connect and build something.</h3>
                <p className="text-slate-300 text-sm mt-2">
                  Interested in discussing potential roles, freelance projects, or technological ideas? Reach out through any channel below.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`mailto:${PORTFOLIO_PROFILE.email}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">EMAIL DIRECT</div>
                      <div className="text-sm font-semibold text-white">{PORTFOLIO_PROFILE.email}</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500" />
                </a>

                <a
                  href={PORTFOLIO_PROFILE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Github size={18} className="text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">GITHUB REPOSITORY</div>
                      <div className="text-sm font-semibold text-white">github.com</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500" />
                </a>

                <a
                  href={PORTFOLIO_PROFILE.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin size={18} className="text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">LINKEDIN NETWORK</div>
                      <div className="text-sm font-semibold text-white">linkedin.com</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-slate-500" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>EVAN.OS // PORTFOLIO HUB</span>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:underline"
          >
            RETURN TO 3D EXPLORATION →
          </button>
        </div>
      </div>
    </div>
  );
};
