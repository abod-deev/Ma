
import React from 'react';
import { Participant, Match } from '../types/tournament';
import { Trophy, Medal, Target } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, winner: Participant | null) => void;
  onUpdateScore: (matchId: string, slot: 1 | 2, score: string, leg?: 1 | 2) => void;
  isRtl: boolean;
  isFinal?: boolean;
  isThirdPlace?: boolean;
  totalMatches: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectWinner, onUpdateScore, isRtl, isFinal, isThirdPlace, totalMatches }) => {
  const { p1, p2, winner, score1, score2, score1_2, score2_2 } = match;
  const isSingleLeg = isFinal || isThirdPlace;

  const calculateTotal = (s1: string, s2: string) => {
    if (s1 === '' && s2 === '') return '';
    return (parseInt(s1) || 0) + (parseInt(s2) || 0);
  };

  const renderBadge = (player: Participant | null) => {
    if (!player) return null;

    // 1. Handle Final Match (Gold & Silver)
    if (isFinal && winner) {
      if (winner.id === player.id) {
        // Gold / 1st
        return (
          <div className="flex items-center gap-0.5 bg-yellow-500/20 px-1 py-0.5 rounded border border-yellow-500/30 animate-pulse">
            <Trophy className="w-2 h-2 text-yellow-600 dark:text-yellow-400 fill-current" />
            <span className="text-[6px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-tighter">
              {isRtl ? 'البطل' : '1ST'}
            </span>
          </div>
        );
      } else if (match.p1 && match.p2) {
        // Silver / 2nd (The one who didn't win)
        return (
          <div className="flex items-center gap-0.5 bg-slate-200 dark:bg-slate-400/20 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-400/30">
            <Medal className="w-2 h-2 text-slate-500 dark:text-slate-300" />
            <span className="text-[6px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-tighter">
              {isRtl ? 'الوصيف' : '2ND'}
            </span>
          </div>
        );
      }
    }

    // 2. Handle Third Place Match (Bronze)
    if (isThirdPlace && winner && winner.id === player.id) {
      return (
        <div className="flex items-center gap-0.5 bg-orange-100 dark:bg-orange-700/20 px-1 py-0.5 rounded border border-orange-200 dark:border-orange-500/30">
          <Medal className="w-2 h-2 text-orange-600 dark:text-orange-400" />
          <span className="text-[6px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tighter">
            {isRtl ? 'الثالث' : '3RD'}
          </span>
        </div>
      );
    }

    // 3. Regular Round Winner
    if (winner && winner.id === player.id) {
      return (
        <div className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded border border-blue-200 dark:border-blue-500/30">
          <span className="text-[5px] font-black text-blue-600 dark:text-blue-400 uppercase">WIN</span>
        </div>
      );
    }

    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentSlot: 1 | 2, currentLeg: 1 | 2) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const R = match.roundIndex;
      const M = match.matchIndex;
      let nextId = '';

      if (currentSlot === 1) {
        nextId = `input-r${R}-m${M}-2-${currentLeg}`;
      } else {
        if (M < totalMatches - 1) {
          nextId = `input-r${R}-m${M + 1}-1-${currentLeg}`;
        } else {
          if (currentLeg === 1 && !isSingleLeg) {
             nextId = `input-r${R}-m0-1-2`;
          }
        }
      }

      if (nextId) {
        const nextElement = document.getElementById(nextId);
        if (nextElement) {
          nextElement.focus();
        } else {
           if (match.id === 'third-place') {
             if (currentLeg === 1 && currentSlot === 1) nextId = `input-third-place-2-1`;
             else if (currentLeg === 1 && currentSlot === 2 && !isSingleLeg) nextId = `input-third-place-1-2`;
             else if (currentLeg === 2 && currentSlot === 1) nextId = `input-third-place-2-2`;
             
             const tpEl = document.getElementById(nextId);
             if (tpEl) tpEl.focus();
             else (e.target as HTMLInputElement).blur();
             return;
           }
           
           (e.target as HTMLInputElement).blur();
        }
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const renderPlayerRow = (player: Participant | null, slot: 1 | 2, leg1: string, leg2: string) => {
    const isWinner = winner?.id === player?.id;
    const isLoser = winner && player && winner.id !== player.id;
    
    const handleInputChange = (val: string, leg: 1 | 2) => {
      if (val === '' || /^\d+$/.test(val)) {
        onUpdateScore(match.id, slot, val, leg);
      }
    };

    return (
      <div className={`
        group relative flex items-center gap-1.5 px-2 py-1.5 transition-all duration-300
        ${slot === 1 ? 'border-b border-slate-200 dark:border-white/5' : ''}
        ${isWinner ? (isFinal ? 'bg-yellow-100/50 dark:bg-yellow-500/5' : 'bg-blue-100/50 dark:bg-blue-500/5') : 'hover:bg-slate-100 dark:hover:bg-white/5'}
        ${isRtl ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Active Indicator */}
        <div className={`
          absolute top-0 bottom-0 w-0.5 transition-all duration-500
          ${isRtl ? 'right-0' : 'left-0'}
          ${isWinner ? (isFinal ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-blue-600 dark:bg-blue-500') : 'bg-transparent'}
        `} />

        <div className={`flex flex-1 items-center gap-1.5 overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`
            flex-1 min-w-0 font-bold tracking-tight transition-colors truncate
            ${isFinal ? 'text-[10px] md:text-[11px]' : 'text-[9px] md:text-[10px]'}
            ${isWinner ? (isFinal ? 'text-yellow-700 dark:text-yellow-400' : 'text-blue-700 dark:text-blue-300') : 'text-slate-700 dark:text-slate-300'}
            ${isLoser && !isFinal ? 'opacity-40 line-through grayscale' : ''} 
            ${!player ? 'text-slate-400 dark:text-slate-600 italic font-normal' : ''}
          `}>
            {player ? player.name : (isRtl ? 'بانتظار التأهل' : 'Waiting...')}
          </div>
          {renderBadge(player)}
        </div>

        <div className={`flex gap-1 items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Leg 1 Input */}
          <input
            id={`input-${match.id}-${slot}-1`}
            type="text"
            inputMode="numeric"
            enterKeyHint="next"
            value={leg1}
            disabled={!player}
            onChange={(e) => handleInputChange(e.target.value, 1)}
            onKeyDown={(e) => handleKeyDown(e, slot, 1)}
            className={`
              w-6 h-6 rounded border text-center text-[10px] font-black transition-all
              ${isWinner 
                ? (isFinal ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-500/50 dark:bg-slate-950/50 dark:text-yellow-400' : 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-slate-950/50 dark:text-blue-400') 
                : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-400'}
              focus:ring-1 focus:ring-blue-500 outline-none p-0
            `}
            placeholder="-"
          />
          
          {/* Leg 2 Input (Only if not single leg) */}
          {!isSingleLeg && (
            <input
              id={`input-${match.id}-${slot}-2`}
              type="text"
              inputMode="numeric"
              enterKeyHint={(slot === 2 && match.matchIndex === totalMatches - 1) ? "done" : "next"}
              value={leg2}
              disabled={!player}
              onChange={(e) => handleInputChange(e.target.value, 2)}
              onKeyDown={(e) => handleKeyDown(e, slot, 2)}
              className={`
                w-6 h-6 rounded border text-center text-[10px] font-black transition-all
                ${isWinner 
                   ? 'border-blue-200 bg-blue-50/50 text-blue-600 dark:border-blue-500/30 dark:bg-slate-950/50 dark:text-blue-400/70' 
                   : 'border-slate-200 bg-white text-slate-500 dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-500'}
                focus:ring-1 focus:ring-blue-500 outline-none p-0
              `}
              placeholder="-"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`
      relative group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]
      ${isFinal ? 'w-36 md:w-52' : 'w-32 md:w-44'}
    `}>
      <div className={`
        glass-panel rounded-lg overflow-hidden border transition-all duration-500
        ${isFinal ? 'border-yellow-500/40 gold-glow' : 'border-slate-300 dark:border-slate-800/60 shadow-lg'}
      `}>
        <div className={`
          px-2.5 py-1 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-black/20
          ${isRtl ? 'flex-row-reverse' : ''}
        `}>
          <div className="flex items-center gap-1">
            <Target className={`w-2.5 h-2.5 ${isFinal ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className={`text-[7px] font-extrabold uppercase tracking-widest ${isFinal ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-500'}`}>
              {isFinal ? (isRtl ? 'النهائي' : 'THE FINAL') : 
               isThirdPlace ? (isRtl ? 'المركز الثالث' : 'BRONZE') :
               (isRtl ? `مباراة ${match.matchIndex + 1}` : `M ${match.matchIndex + 1}`)}
            </span>
          </div>
          {isFinal && <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />}
        </div>
        
        <div className="flex flex-col">
          {renderPlayerRow(p1, 1, score1, score1_2)}
          {renderPlayerRow(p2, 2, score2, score2_2)}
        </div>
      </div>
    </div>
  );
};
