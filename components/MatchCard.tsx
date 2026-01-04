
import React from 'react';
import { Participant, Match } from '../types/tournament';
import { Trophy, Medal } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, winner: Participant | null) => void;
  onUpdateScore: (matchId: string, slot: 1 | 2, score: string, leg?: 1 | 2) => void;
  isRtl: boolean;
  isFinal?: boolean;
  isThirdPlace?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectWinner, onUpdateScore, isRtl, isFinal, isThirdPlace }) => {
  const { p1, p2, winner, score1, score2, score1_2, score2_2 } = match;

  const isSingleLeg = isFinal || isThirdPlace;

  const calculateTotal = (s1: string, s2: string) => {
    const val1 = parseInt(s1) || 0;
    const val2 = parseInt(s2) || 0;
    return val1 + val2;
  };

  const renderRankIcon = (player: Participant | null) => {
    if (!winner || !player) return null;

    if (isFinal && winner.id === player.id) {
      return (
        <div className="flex items-center gap-0.5 animate-bounce shrink-0">
          <Trophy className="w-2 h-2 text-yellow-400" />
          <span className="text-[5px] font-black text-yellow-500 bg-yellow-500/10 px-0.5 rounded border border-yellow-500/20">1st</span>
        </div>
      );
    }
    
    if (isFinal && winner.id !== player.id) {
      return (
        <div className="flex items-center gap-0.5 opacity-80 shrink-0">
          <Medal className="w-2 h-2 text-slate-300" />
          <span className="text-[5px] font-black text-slate-300 bg-slate-300/10 px-0.5 rounded border border-slate-300/20">2nd</span>
        </div>
      );
    }

    if (isThirdPlace && winner.id === player.id) {
      return (
        <div className="flex items-center gap-0.5 shrink-0">
          <Medal className="w-1.5 h-1.5 text-orange-400" />
          <span className="text-[5px] font-black text-orange-400 bg-orange-400/10 px-0.5 rounded border border-orange-400/20">3rd</span>
        </div>
      );
    }

    return null;
  };

  const renderPlayer = (player: Participant | null, slot: 1 | 2, leg1Score: string, leg2Score: string) => {
    const isWinner = winner?.id === player?.id;
    const isLoser = winner && player && winner.id !== player.id;
    const total = calculateTotal(leg1Score, leg2Score);
    
    return (
      <div 
        className={`
          relative flex items-center gap-0.5 px-1 transition-all duration-300
          ${slot === 1 ? 'border-b border-white/5' : ''}
          ${isWinner ? 'bg-blue-600/20' : 'hover:bg-white/5'}
          ${!player ? 'opacity-30' : 'opacity-100'}
          ${isRtl ? 'flex-row-reverse' : 'flex-row'}
          ${isFinal ? 'py-1 md:py-1.5' : 'py-0.5'}
        `}
      >
        <div className={`shrink-0 w-0.5 rounded-full transition-all duration-500 
          ${isWinner ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'bg-slate-800'}
          ${isFinal ? 'h-3.5' : 'h-2.5'}
        `} />

        <div className={`flex items-center gap-0.5 overflow-hidden flex-1 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className="flex flex-col flex-1 overflow-hidden">
             <span className={`font-black truncate tracking-tight transition-colors duration-300
              ${isFinal ? 'text-[9px] md:text-[10px]' : 'text-[8px] md:text-[9px]'}
              ${isWinner ? 'text-blue-300' : 'text-slate-300'} 
              ${isLoser ? 'text-slate-600 line-through' : ''}
            `}>
              {player ? player.name : (isRtl ? 'بانتظار' : 'TBD')}
            </span>
          </div>
          {renderRankIcon(player)}
        </div>
        
        <div className={`flex gap-0.5 shrink-0 items-center ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <input
            type="text"
            inputMode="numeric"
            value={leg1Score}
            disabled={!player}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdateScore(match.id, slot, e.target.value, 1)}
            placeholder="0"
            className={`
              bg-slate-950/80 border rounded text-center font-black transition-all
              ${isFinal ? 'w-4 h-4 text-[8px]' : 'w-3 h-3 text-[7px]'}
              ${isWinner 
                ? 'border-blue-500/50 text-blue-400' 
                : 'border-white/10 text-slate-500'}
              focus:outline-none focus:ring-1 focus:ring-blue-500/40
            `}
          />
          
          {!isSingleLeg && (
            <>
              <input
                type="text"
                inputMode="numeric"
                value={leg2Score}
                disabled={!player}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onUpdateScore(match.id, slot, e.target.value, 2)}
                placeholder="0"
                className={`
                  w-3 h-3 text-[7px] bg-blue-900/10 border border-white/5 rounded text-center font-black transition-all
                  ${isWinner ? 'text-blue-300' : 'text-slate-600'}
                  focus:outline-none focus:ring-1 focus:ring-blue-400/30
                `}
              />
              <div className={`
                w-3 h-3 text-[6px] flex items-center justify-center bg-white/5 border border-white/5 rounded font-black text-slate-500
                ${isWinner ? 'text-blue-200 bg-blue-500/10 border-blue-500/20' : ''}
              `}>
                {total}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative group shrink-0">
      <div className={`
        bg-slate-900/95 border backdrop-blur-xl rounded overflow-hidden transition-all duration-500 
        ${isFinal ? 'w-28 md:w-40 border-yellow-500/40 shadow-lg' : 'w-24 md:w-36 border-slate-800 shadow-sm'}
      `}>
        <div className={`bg-black/40 px-1 py-0.5 flex items-center justify-between border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-0.5">
            <span className={`font-black text-slate-500 uppercase tracking-tight ${isFinal ? 'text-[6px] md:text-[7px]' : 'text-[5px]'}`}>
              {isFinal ? (isRtl ? 'النهائي' : 'FINAL') : 
               isThirdPlace ? (isRtl ? 'المركز 3' : '3RD PLACE') :
               (isRtl ? `م${match.matchIndex + 1}` : `M${match.matchIndex + 1}`)}
            </span>
          </div>
          {!isSingleLeg && (
            <div className={`flex gap-1 text-[4px] font-bold text-slate-600 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span>{isRtl ? 'ذ' : 'H'}</span>
              <span>{isRtl ? 'إ' : 'A'}</span>
              <span>{isRtl ? 'م' : 'T'}</span>
            </div>
          )}
          {isFinal && <div className="w-0.5 h-0.5 rounded-full bg-yellow-500 animate-pulse" />}
        </div>

        <div className="flex flex-col">
          {renderPlayer(p1, 1, score1, score1_2)}
          {renderPlayer(p2, 2, score2, score2_2)}
        </div>
      </div>
    </div>
  );
};
