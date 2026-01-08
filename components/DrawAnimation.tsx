
import React, { useState, useEffect, useRef } from 'react';
import { Match, Participant } from '../types/tournament';
import { Shield, Sparkles, ChevronRight, FastForward, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DrawAnimationProps {
  matches: Match[]; // Only Round 1 matches
  allParticipants: string[]; // For the "spinning" effect (fake names)
  onComplete: () => void;
  onRedraw: () => void;
  isRtl: boolean;
}

export const DrawAnimation: React.FC<DrawAnimationProps> = ({ matches, allParticipants, onComplete, onRedraw, isRtl }) => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [revealStep, setRevealStep] = useState<'intro' | 'spinning-p1' | 'revealed-p1' | 'spinning-p2' | 'revealed-p2' | 'finished'>('intro');
  const [displayedNameP1, setDisplayedNameP1] = useState('?');
  const [displayedNameP2, setDisplayedNameP2] = useState('?');
  const [drawnMatches, setDrawnMatches] = useState<Match[]>([]);
  
  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Constants
  const SPIN_DURATION = 1500; // ms to spin
  const NEXT_STEP_DELAY = 1000; // ms between reveals

  // Helper to get random name from list for effect
  const getRandomName = () => allParticipants[Math.floor(Math.random() * allParticipants.length)];

  // Effect to handle the sequence
  useEffect(() => {
    // If we've shown all matches, stop the sequence logic (wait for manual action)
    if (revealStep === 'finished') return;

    if (currentMatchIndex >= matches.length) {
      setRevealStep('finished');
      return;
    }

    const currentMatch = matches[currentMatchIndex];
    let timeout: ReturnType<typeof setTimeout>;

    const startSpinning = (setter: React.Dispatch<React.SetStateAction<string>>) => {
      if (spinInterval.current) clearInterval(spinInterval.current);
      spinInterval.current = setInterval(() => {
        setter(getRandomName());
      }, 50);
    };

    const stopSpinning = () => {
      if (spinInterval.current) {
        clearInterval(spinInterval.current);
        spinInterval.current = null;
      }
    };

    if (revealStep === 'intro') {
      // Setup for current match
      setDisplayedNameP1('?');
      setDisplayedNameP2('?');
      timeout = setTimeout(() => {
        setRevealStep('spinning-p1');
      }, 500);
    } 
    else if (revealStep === 'spinning-p1') {
      startSpinning(setDisplayedNameP1);
      timeout = setTimeout(() => {
        stopSpinning();
        setDisplayedNameP1(currentMatch.p1?.name || 'Error');
        setRevealStep('revealed-p1');
        
        // Small puff of confetti for P1
        confetti({
             particleCount: 20,
             spread: 40,
             origin: { x: isRtl ? 0.7 : 0.3, y: 0.5 },
             colors: ['#3b82f6', '#ffffff']
        });

      }, SPIN_DURATION);
    } 
    else if (revealStep === 'revealed-p1') {
      timeout = setTimeout(() => {
        setRevealStep('spinning-p2');
      }, NEXT_STEP_DELAY);
    } 
    else if (revealStep === 'spinning-p2') {
      startSpinning(setDisplayedNameP2);
      timeout = setTimeout(() => {
        stopSpinning();
        
        if (currentMatch.p2) {
            setDisplayedNameP2(currentMatch.p2.name);
             // Confetti for P2
            confetti({
                particleCount: 20,
                spread: 40,
                origin: { x: isRtl ? 0.3 : 0.7, y: 0.5 },
                colors: ['#eab308', '#ffffff']
            });
        } else {
            // Fix: Use a consistent, simple string for "Bye"
            setDisplayedNameP2(isRtl ? 'تأهل مباشر' : 'QUALIFIED DIRECTLY');
        }
        
        setRevealStep('revealed-p2');
      }, SPIN_DURATION);
    } 
    else if (revealStep === 'revealed-p2') {
      timeout = setTimeout(() => {
        // Add to drawn list
        setDrawnMatches(prev => [...prev, currentMatch]);
        
        // Move to next match
        if (currentMatchIndex < matches.length - 1) {
            // Critical Fix: Reset names immediately before transition to avoid flash of old text
            setDisplayedNameP1('?');
            setDisplayedNameP2('?');
            
            setCurrentMatchIndex(prev => prev + 1);
            setRevealStep('intro');
        } else {
            setRevealStep('finished');
        }
      }, NEXT_STEP_DELAY * 1.5);
    }

    return () => {
      clearTimeout(timeout);
      stopSpinning();
    };
  }, [revealStep, currentMatchIndex, matches, isRtl]);


  const currentMatch = matches[currentMatchIndex < matches.length ? currentMatchIndex : matches.length - 1];
  
  // Render Finished State
  if (revealStep === 'finished') {
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
             
             <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl max-h-[90vh]">
                 <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <Trophy className="w-10 h-10 md:w-16 md:h-16 text-yellow-500" />
                 </div>
                 <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-4">
                     {isRtl ? 'اكتملت القرعة' : 'DRAW COMPLETE'}
                 </h2>
                 <p className="text-slate-400 mb-4 md:mb-6 text-sm md:text-lg">
                     {isRtl ? 'تم تحديد جميع المواجهات. هل أنت مستعد للبطولة؟' : 'All matches have been set. Are you ready?'}
                 </p>
                 
                 {/* Full Match List for Finished State */}
                 <div className="w-full max-h-[40vh] overflow-y-auto pr-2 mb-6 md:mb-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                        {matches.map((m) => (
                             <div key={m.id} className={`w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg p-3 flex items-center justify-between transition-colors ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                     <span className="text-xs font-mono text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">#{m.matchIndex + 1}</span>
                                     <span className="font-bold text-slate-200 text-sm truncate max-w-[100px]">{m.p1?.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-600 px-2 italic">VS</span>
                                <span className={`font-bold text-sm truncate max-w-[100px] ${!m.p2 ? 'text-yellow-500' : 'text-slate-200'}`}>
                                    {m.p2 ? m.p2.name : (isRtl ? 'تأهل مباشر' : 'Bye')}
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 w-full">
                     <button 
                        onClick={onComplete}
                        className="flex-1 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                     >
                         <Shield className="w-4 h-4 md:w-5 md:h-5" />
                         <span>{isRtl ? 'عرض المباريات' : 'View Bracket'}</span>
                     </button>
                     
                     <button 
                        onClick={onRedraw}
                        className="flex-1 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all hover:scale-[1.02]"
                     >
                         <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                         <span>{isRtl ? 'إعادة القرعة' : 'Redraw'}</span>
                     </button>
                 </div>
             </div>
        </div>
    );
  }

  // Render Animation State
  if (!currentMatch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center h-full">
            
            {/* Header */}
            <div className="mt-4 md:mt-12 mb-4 md:mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Sparkles className="w-3 h-3" />
                    <span>{isRtl ? 'جارٍ سحب القرعة' : 'LIVE DRAW IN PROGRESS'}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                    {isRtl ? `المباراة رقم ${currentMatchIndex + 1}` : `Match Draw #${currentMatchIndex + 1}`}
                </h2>
            </div>

            {/* The Stage */}
            <div className="w-full flex-grow flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-4">
                
                {/* Home Team */}
                <div className={`relative w-full max-w-sm aspect-[3/1] md:aspect-[4/2] bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 rounded-2xl overflow-hidden flex items-center justify-center p-4 transition-all duration-300 ${revealStep === 'spinning-p1' ? 'border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}`}>
                    <div className={`absolute top-2 ${isRtl ? 'left-3' : 'left-3'} text-[10px] font-bold text-blue-400/50 uppercase tracking-widest`}>
                        {isRtl ? 'الفريق الأول' : 'HOME'}
                    </div>
                    <div className={`text-xl md:text-3xl font-black text-center transition-all ${revealStep === 'spinning-p1' ? 'blur-[1px] text-blue-200' : 'text-white scale-110'}`}>
                        {displayedNameP1}
                    </div>
                </div>

                {/* VS Badge */}
                <div className="relative shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center z-10">
                    <span className="text-xl font-black text-slate-700 italic">VS</span>
                    <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
                </div>

                {/* Away Team */}
                <div className={`relative w-full max-w-sm aspect-[3/1] md:aspect-[4/2] bg-gradient-to-bl from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 rounded-2xl overflow-hidden flex items-center justify-center p-4 transition-all duration-300 ${revealStep === 'spinning-p2' ? 'border-indigo-500/80 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : ''}`}>
                    <div className={`absolute top-2 ${isRtl ? 'right-3' : 'right-3'} text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest`}>
                        {isRtl ? 'الفريق الثاني' : 'AWAY'}
                    </div>
                    
                    {/* Visual check for BYE */}
                    <div className={`text-xl md:text-3xl font-black text-center transition-all ${revealStep === 'spinning-p2' ? 'blur-[1px] text-indigo-200' : 'text-white scale-110'}`}>
                         {/* If revealed and it's a BYE, style differently */}
                         {revealStep === 'revealed-p2' && !currentMatch.p2 ? (
                            <span className="text-yellow-400 text-lg md:text-2xl animate-pulse">
                                {isRtl ? 'تأهل تلقائي' : 'QUALIFIED DIRECTLY'}
                            </span>
                         ) : (
                             displayedNameP2
                         )}
                    </div>
                </div>

            </div>

            {/* Drawn History (Full List) */}
            <div className="w-full max-w-2xl mt-auto mb-4 md:mb-8">
                <div className={`flex items-center justify-between mb-2 px-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRtl ? 'سجل القرعة' : 'Draw Log'}</span>
                    <span className="text-[10px] font-bold text-slate-500">{drawnMatches.length} / {matches.length}</span>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {drawnMatches.slice().reverse().map((m) => (
                        <div key={m.id} className={`w-full bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                 <span className="text-xs font-mono text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">#{m.matchIndex + 1}</span>
                                 <span className="font-bold text-slate-300 text-sm">{m.p1?.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-600 px-2 italic">VS</span>
                            <span className={`font-bold text-sm ${!m.p2 ? 'text-yellow-500' : 'text-slate-300'}`}>
                                {m.p2 ? m.p2.name : (isRtl ? 'تأهل تلقائي' : 'Direct Qual.')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skip Button */}
            <button 
                onClick={onComplete}
                className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} md:top-8 md:right-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors group z-50 cursor-pointer`}
            >
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">{isRtl ? 'تخطي' : 'SKIP'}</span>
                <FastForward className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </button>

        </div>
    </div>
  );
};
