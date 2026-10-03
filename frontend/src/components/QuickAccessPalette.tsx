import React, { useState } from 'react';
import { Layers, FlaskConical, ShieldAlert, FolderGit2, ShieldCheck, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface QuickAccessPaletteProps {
  onNavigateToModule: (moduleId: string) => void;
  onOpenGoldenTests: () => void;
  onOpenChaosSimulator: () => void;
  onOpenProjectOnboarding: () => void;
}

export const QuickAccessPalette: React.FC<QuickAccessPaletteProps> = ({
  onNavigateToModule,
  onOpenGoldenTests,
  onOpenChaosSimulator,
  onOpenProjectOnboarding
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 font-mono">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-white/10 bg-[#060912]">
            <span className="text-xs font-bold text-cyan-400">QUICK ACCESS PALETTE</span>
          </div>
          <div className="flex flex-col p-2 space-y-1">
            <button onClick={() => { setIsOpen(false); onOpenGoldenTests(); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <FlaskConical className="w-4 h-4 text-purple-400" /> <span>Run Golden Tests</span>
            </button>
            <button onClick={() => { setIsOpen(false); onOpenChaosSimulator(); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> <span>Chaos Simulator</span>
            </button>
            <button onClick={() => { setIsOpen(false); onOpenProjectOnboarding(); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <FolderGit2 className="w-4 h-4 text-cyan-400" /> <span>Onboard Project</span>
            </button>
            <div className="h-px bg-white/10 my-1"></div>
            <button onClick={() => { setIsOpen(false); onNavigateToModule('arch'); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> <span>Architecture Gate</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigateToModule('debt'); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <Flame className="w-4 h-4 text-amber-400" /> <span>Tech Debt Arena</span>
            </button>
            <button onClick={() => { setIsOpen(false); onNavigateToModule('tools'); }} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 text-slate-300 text-xs transition-colors text-left">
              <Zap className="w-4 h-4 text-indigo-400" /> <span>Controlled Tools</span>
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg hover:scale-105 transition-all"
        aria-label="Quick Access Palette"
      >
        <Layers className="w-5 h-5" />
      </button>
    </div>
  );
};
