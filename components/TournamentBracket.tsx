
import React, { useRef } from 'react';
import { Round, Participant, Match } from '../types/tournament';
import { MatchCard } from './MatchCard';

interface TournamentBracketProps {
  rounds: Round[];
  thirdPlaceMatch: Match | null;
  onSelectWinner: (matchId: string, winner: Participant) => void;
  onUpdateScore: (matchId: string, slot: 1 | 2, score: string, leg?: 1 | 2) => void;
  isRtl: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ rounds, thirdPlaceMatch, onSelectWinner, onUpdateScore, isRtl }) => {
  const bracketRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`w-full overflow-x-auto px-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div 
        ref={bracketRef}
        className={`inline-flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-stretch gap-6 md:gap-14 p-8 md:p-16 mx-auto`}
      >
        {rounds.map((round, rIndex) => {
          const isLastRound = rIndex === rounds.length - 1;
          
          return (
            <div key={rIndex} className="flex flex-col items-center">
              {/* Round Title */}
              <div className="relative mb-10 group">
                <div className="px-4 py-1.5 glass-panel rounded-full border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                  <h3 className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    {round.name === 'Final' && isRtl ? 'النهائي الكبير' : 
                     round.name === 'Semi-Final' && isRtl ? 'نصف النهائي' : 
                     round.name === 'Quarter-Final' && isRtl ? 'ربع النهائي' : round.name}
                  </h3>
                </div>
                {/* Decorative dots */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                  <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                  <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                </div>
              </div>
              
              <div className="relative flex flex-col items-center justify-around h-full w-full min-h-[400px]">
                <div className="flex flex-col justify-around h-full gap-8 md:gap-12 w-full">
                  {round.matches.map((match) => {
                    const isEven = match.matchIndex % 2 === 0;
                    const baseGap = 32; 
                    const verticalOffset = Math.pow(2, rIndex) * baseGap; 
                    
                    const startY = match.winner ? ((match.p1 && match.winner.id === match.p1.id) ? 92 : 108) : 100;
                    const endY = isEven ? 100 + verticalOffset : 100 - verticalOffset;

                    return (
                      <div key={match.id} className="relative flex justify-center">
                        <MatchCard 
                          match={match} 
                          onSelectWinner={onSelectWinner} 
                          onUpdateScore={onUpdateScore}
                          isRtl={isRtl} 
                          isFinal={isLastRound}
                        />
                        
                        {!isLastRound && (
                          <div 
                            className={`absolute w-6 md:w-14 overflow-visible pointer-events-none transition-opacity duration-1000 ${isRtl ? '-left-6 md:-left-14' : '-right-6 md:-right-14'} ${match.winner ? 'opacity-100' : 'opacity-20'}`}
                            style={{ top: '50%' }}
                          >
                            <svg viewBox="0 0 100 200" className="w-full h-[200px] absolute -top-[100px] overflow-visible">
                              <defs>
                                <linearGradient id={`grad-${match.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                </linearGradient>
                              </defs>
                              <path 
                                d={isRtl 
                                  ? `M 100 ${startY} L 50 ${startY} L 50 ${endY} L 0 ${endY}`
                                  : `M 0 ${startY} L 50 ${startY} L 50 ${endY} L 100 ${endY}`
                                }
                                fill="none"
                                stroke={match.winner ? `url(#grad-${match.id})` : "#1e293b"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-700"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isLastRound && thirdPlaceMatch && (
                  <div className="absolute top-[calc(100%+40px)] flex flex-col items-center animate-in fade-in duration-1000">
                    <div className="mb-2 px-3 py-0.5 glass-panel rounded-full border border-orange-500/20">
                      <h4 className="text-[7px] font-black text-orange-400 uppercase tracking-widest">
                        {isRtl ? 'مواجهة المركز الثالث' : 'BRONZE FINAL'}
                      </h4>
                    </div>
                    <MatchCard 
                      match={thirdPlaceMatch} 
                      onSelectWinner={onSelectWinner} 
                      onUpdateScore={onUpdateScore}
                      isRtl={isRtl}
                      isThirdPlace={true}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
