
import React from 'react';
import { Participant, Match } from '../types/tournament';
import { Trophy, Medal, Crown, Target } from 'lucide-react';

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

  const calculateTotal = (s1: string, s2: string) => (parseInt(s1) || 0) + (parseInt(s2) || 0);

  const renderBadge = (player: Participant | null) => {
    if (!winner || !player || winner.id !== player.id) return null;

    if (isFinal) return (
      <div className="flex items-center gap-1 bg-yellow-500/20 px-1.5 py-0.5 rounded border border-yellow-500/30 animate-pulse">
        <Crown className="w-2.5 h-2.5 text-yellow-400 fill-current" />
        <span className="text-[7px] font-black text-yellow-400 uppercase tracking-tighter">
          {isRtl ? 'البطل' : '1ST'}
        </span>
      </div>
    );

    return (
      <div className="bg-blue-500/20 px-1 rounded border border-blue-500/30">
        <span className="text-[6px] font-black text-blue-400 uppercase">WIN</span>
      </div>
    );
  };

  const renderPlayerRow = (player: Participant | null, slot: 1 | 2, leg1: string, leg2: string) => {
    const isWinner = winner?.id === player?.id;
    const isLoser = winner && player && winner.id !== player.id;
    const total = calculateTotal(leg1, leg2);

    return (
      <div className={`
        group relative flex items-center gap-2 px-3 py-2 transition-all duration-300
        ${slot === 1 ? 'border-b border-white/5' : ''}
        ${isWinner ? (isFinal ? 'bg-yellow-500/5' : 'bg-blue-500/5') : 'hover:bg-white/5'}
        ${isRtl ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Active Indicator */}
        <div className={`
          absolute top-0 bottom-0 w-0.5 transition-all duration-500
          ${isRtl ? 'right-0' : 'left-0'}
          ${isWinner ? (isFinal ? 'bg-yellow-400' : 'bg-blue-500') : 'bg-transparent'}
        `} />

        <div className={`flex flex-1 items-center gap-2 overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`
            flex-1 min-w-0 font-bold tracking-tight transition-colors truncate
            ${isFinal ? 'text-[11px] md:text-xs' : 'text-[10px] md:text-[11px]'}
            ${isWinner ? (isFinal ? 'text-yellow-400' : 'text-blue-300') : 'text-slate-300'}
            ${isLoser ? 'opacity-40 line-through grayscale' : ''}
            ${!player ? 'text-slate-600 italic font-normal' : ''}
          `}>
            {player ? player.name : (isRtl ? 'بانتظار التأهل' : 'Waiting...')}
          </div>
          {renderBadge(player)}
        </div>

        <div className={`flex gap-1 items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
          <input
            type="text"
            inputMode="numeric"
            value={leg1}
            disabled={!player}
            onChange={(e) => onUpdateScore(match.id, slot, e.target.value, 1)}
            className={`
              w-6 h-6 rounded border bg-slate-950/50 text-center text-[10px] font-black transition-all
              ${isWinner ? (isFinal ? 'border-yellow-500/50 text-yellow-400' : 'border-blue-500/50 text-blue-400') : 'border-white/10 text-slate-500'}
              focus:ring-1 focus:ring-blue-500 outline-none
            `}
            placeholder="0"
          />
          {!isSingleLeg && (
            <input
              type="text"
              inputMode="numeric"
              value={leg2}
              disabled={!player}
              onChange={(e) => onUpdateScore(match.id, slot, e.target.value, 2)}
              className="w-5 h-5 rounded border border-white/5 bg-slate-900/50 text-center text-[9px] font-bold text-slate-500 outline-none"
              placeholder="0"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`
      relative group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]
      ${isFinal ? 'w-40 md:w-56' : 'w-36 md:w-48'}
    `}>
      <div className={`
        glass-panel rounded-xl overflow-hidden border transition-all duration-500
        ${isFinal ? 'border-yellow-500/40 gold-glow' : 'border-slate-800/60 shadow-lg'}
      `}>
        <div className={`
          px-3 py-1.5 flex items-center justify-between border-b border-white/5 bg-black/20
          ${isRtl ? 'flex-row-reverse' : ''}
        `}>
          <div className="flex items-center gap-1.5">
            <Target className={`w-3 h-3 ${isFinal ? 'text-yellow-500' : 'text-slate-500'}`} />
            <span className={`text-[8px] font-extrabold uppercase tracking-widest ${isFinal ? 'text-yellow-500' : 'text-slate-500'}`}>
              {isFinal ? (isRtl ? 'المواجهة النهائية' : 'THE FINAL') : 
               isThirdPlace ? (isRtl ? 'المركز الثالث' : 'BRONZE FINAL') :
               (isRtl ? `مباراة ${match.matchIndex + 1}` : `MATCH ${match.matchIndex + 1}`)}
            </span>
          </div>
          {isFinal && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
        </div>
        
        <div className="flex flex-col">
          {renderPlayerRow(p1, 1, score1, score1_2)}
          {renderPlayerRow(p2, 2, score2, score2_2)}
        </div>
      </div>
    </div>
  );
};
