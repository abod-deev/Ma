
import React from 'react';
import { Trophy, Languages, RotateCcw, Edit3, Camera, Maximize, Minimize, History, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  isRtl: boolean;
  onToggleRtl: () => void;
  onReset: () => void; // Go to Setup
  onRedraw?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  onShowArchives: () => void;
  onBackToHome: () => void;
  isFullscreen?: boolean;
  showActions: boolean;
  status: string; // 'setup' | 'active' | 'archive'
}

export const Header: React.FC<HeaderProps> = ({ 
  isRtl, 
  onToggleRtl, 
  onReset, 
  onRedraw, 
  onExport,
  onFullscreen,
  onShowArchives,
  onBackToHome,
  isFullscreen,
  showActions,
  status
}) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onBackToHome}>
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-110 duration-300">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-black tracking-tighter text-white hidden sm:block">
          CHAMPIONS <span className="text-blue-500">DRAW</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {/* Navigation Actions */}
        {status === 'active' && (
          <button 
            onClick={onShowArchives} // When active, back goes to archives or setup? Let's make it go to archives if we want, but usually "Back" is safer
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-[10px] font-bold text-slate-300 transition-all border border-white/5"
            title={isRtl ? 'القائمة الرئيسية' : 'Back to Home'}
          >
            <ArrowLeft className={`w-3 h-3 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="hidden lg:inline">{isRtl ? 'الرئيسية' : 'Home'}</span>
          </button>
        )}

        {status === 'setup' && (
           <button 
             onClick={onShowArchives}
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-[10px] font-bold text-slate-300 transition-all border border-white/5"
           >
             <History className="w-3 h-3 text-blue-400" />
             <span className="hidden lg:inline">{isRtl ? 'الأرشيف' : 'Archives'}</span>
           </button>
        )}

        {status === 'archive' && (
           <button 
             onClick={onBackToHome}
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-full text-[10px] font-bold text-slate-300 transition-all border border-white/5"
           >
             <ArrowLeft className={`w-3 h-3 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
             <span className="hidden lg:inline">{isRtl ? 'إنشاء قرعة' : 'Create New'}</span>
           </button>
        )}

        {showActions && (
          <div className="flex items-center gap-2">
            {onRedraw && (
              <button 
                onClick={onRedraw}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-full text-[10px] font-bold text-blue-400 transition-all border border-blue-500/20"
                title={isRtl ? 'إعادة القرعة' : 'Redraw'}
              >
                <RotateCcw className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" />
                <span className="hidden lg:inline">{isRtl ? 'إعادة القرعة' : 'Redraw'}</span>
              </button>
            )}

            <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

            {/* Feature Buttons */}
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-300 transition-colors border border-white/5"
                title={isRtl ? 'حفظ صورة الجدول' : 'Save Bracket Image'}
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {onFullscreen && (
              <button
                onClick={onFullscreen}
                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-300 transition-colors border border-white/5"
                title={isRtl ? 'ملء الشاشة' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
        
        <div className="h-4 w-px bg-white/10 mx-1 hidden xs:block" />

        <button 
          onClick={onToggleRtl}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[10px] font-bold text-slate-400"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRtl ? 'EN' : 'AR'}</span>
        </button>
      </div>
    </header>
  );
};
