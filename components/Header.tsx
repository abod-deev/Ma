
import React from 'react';
import { Trophy, Languages, RotateCcw } from 'lucide-react';

interface HeaderProps {
  isRtl: boolean;
  onToggleRtl: () => void;
  onReset: () => void;
  onRedraw?: () => void;
  showRedraw: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isRtl, onToggleRtl, onReset, onRedraw, showRedraw }) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-white hidden sm:block">
          CHAMPIONS <span className="text-blue-500">DRAW</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {showRedraw && onRedraw && (
          <button 
            onClick={onRedraw}
            className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-[10px] font-bold text-white transition-all border border-slate-800"
          >
            <RotateCcw className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" />
            <span className="hidden xs:inline">{isRtl ? 'إعادة القرعة' : 'Redraw'}</span>
          </button>
        )}
        
        <button 
          onClick={onToggleRtl}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-[10px] font-medium text-slate-300"
        >
          <Languages className="w-3.5 h-3.5" />
          {isRtl ? 'English' : 'العربية'}
        </button>
      </div>
    </header>
  );
};
