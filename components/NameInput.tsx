
import React, { useState, useEffect } from 'react';
import { UserPlus, Play, Users } from 'lucide-react';

interface NameInputProps {
  onStart: (names: string[]) => void;
  isRtl: boolean;
  initialText?: string;
}

export const NameInput: React.FC<NameInputProps> = ({ onStart, isRtl, initialText = '' }) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  const namesArray = text.split('\n').map(n => n.trim()).filter(n => n !== '');
  const count = namesArray.length;

  const handleSubmit = () => {
    if (count < 2) {
      alert(isRtl ? 'يرجى إدخال اسمين على الأقل' : 'Please enter at least 2 names');
      return;
    }
    onStart(namesArray);
  };

  return (
    <div className={`max-w-md mx-auto mt-2 md:mt-8 px-0 md:px-6 animate-in slide-in-from-bottom-10 duration-700 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="glass-panel border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/50 via-blue-400/50 to-blue-600/50" />
        
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600/10 p-1.5 md:p-2 rounded-lg border border-blue-500/20">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
              {isRtl ? 'إعداد القرعة' : 'Tournament Setup'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <Users className="w-3 h-3" />
            <span>{count}</span>
          </div>
        </div>
        
        <p className="text-slate-400 mb-2 md:mb-4 text-[10px] md:text-[11px] font-medium leading-relaxed opacity-80">
          {isRtl 
            ? 'أدخل أسماء المتسابقين أو الفرق (اسم واحد في كل سطر).' 
            : 'Enter participant or team names (one per line).'}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={isRtl ? 'rtl' : 'ltr'}
          placeholder={isRtl ? 'فريق الهلال\nفريق النصر\nفريق الاتحاد...' : 'Team Alpha\nTeam Beta\nTeam Gamma...'}
          className={`w-full h-32 md:h-56 bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 text-xs md:text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${isRtl ? 'text-right' : 'text-left'} font-medium resize-none`}
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-3 md:mt-6 bg-blue-600 hover:bg-blue-500 text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/20 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" />
          <span>{isRtl ? 'ابدأ القرعة الآن' : 'Start Tournament'}</span>
        </button>
      </div>
    </div>
  );
};
