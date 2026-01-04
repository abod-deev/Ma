
import React from 'react';
import { Trophy, Languages, RotateCcw, Edit3 } from 'lucide-react';

interface HeaderProps {
  isRtl: boolean;
  onToggleRtl: () => void;
  onReset: () => void;
  onRedraw?: () => void;
  showActions: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isRtl, onToggleRtl, onReset, onRedraw, showActions }) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-black tracking-tighter text-white hidden sm:block">
          CHAMPIONS <span className="text-blue-500">DRAW</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {showActions && (
          <>
            <button 
              onClick={onReset}
              className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-[10px] font-bold text-slate-300 transition-all border border-white/5"
            >
              <Edit3 className="w-3 h-3 text-blue-400" />
              <span className="hidden xs:inline">{isRtl ? 'تعديل الأسماء' : 'Edit Names'}</span>
            </button>

            {onRedraw && (
              <button 
                onClick={onRedraw}
                className="group flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-full text-[10px] font-bold text-blue-400 transition-all border border-blue-500/20"
              >
                <RotateCcw className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" />
                <span className="hidden xs:inline">{isRtl ? 'إعادة القرعة' : 'Redraw'}</span>
              </button>
            )}
          </>
        )}
        
        <div className="h-4 w-px bg-white/10 mx-1 hidden xs:block" />

        <button 
          onClick={onToggleRtl}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[10px] font-bold text-slate-400"
        >
          <Languages className="w-3.5 h-3.5" />
          {isRtl ? 'EN' : 'AR'}
        </button>
      </div>
    </header>
  );
};
