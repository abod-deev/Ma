
import React from 'react';
import { Participant } from '../types/tournament';
import { Trophy, Medal, X, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
  winner: Participant;
  runnerUp: Participant | null;
  thirdPlace: Participant | null;
  isRtl: boolean;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, runnerUp, thirdPlace, isRtl, onClose }) => {
  
  React.useEffect(() => {
    // Extended confetti celebration
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#eab308', '#ffffff', '#3b82f6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#eab308', '#ffffff', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* 
        Glassmorphism Card 
        - Transparent background (white/5)
        - Heavy blur (backdrop-blur-xl)
        - Subtle border (white/10)
        - Inner lighting glow
      */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-white/10 to-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-8 animate-in zoom-in-95 duration-500 box-shadow-glow">
        
        {/* Decorative Light Beams */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="z-10 flex flex-col items-center text-center w-full">
          {/* Main Icon */}
          <div className="mb-6 relative">
             <div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full animate-pulse-soft" />
             <Trophy className="w-24 h-24 text-yellow-400 fill-yellow-400/10 drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]" />
          </div>

          <h2 className="text-sm md:text-base font-bold text-blue-300 uppercase tracking-[0.3em] mb-2 text-shadow-sm">
            {isRtl ? 'بطل الموسم' : 'SEASON CHAMPION'}
          </h2>
          <div className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter drop-shadow-lg">
            {winner.name}
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-3 md:gap-4 mb-8">
            {/* Runner Up */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Medal className="w-6 h-6 text-slate-300 mb-2 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {isRtl ? 'الوصيف' : 'Runner Up'}
              </span>
              <span className="text-base font-bold text-slate-200">
                {runnerUp ? runnerUp.name : '-'}
              </span>
            </div>

            {/* Third Place */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Award className="w-6 h-6 text-orange-400 mb-2 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {isRtl ? 'المركز الثالث' : 'Bronze'}
              </span>
              <span className="text-base font-bold text-slate-200">
                {thirdPlace ? thirdPlace.name : '-'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-10 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/20 tracking-wider text-sm"
          >
            {isRtl ? 'العودة للجدول' : 'Return to Bracket'}
          </button>
        </div>
      </div>
    </div>
  );
};
