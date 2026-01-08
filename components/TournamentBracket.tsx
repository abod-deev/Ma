
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
    <div className={`w-full overflow-x-auto px-2 md:px-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div 
        id="tournament-bracket"
        ref={bracketRef}
        className={`inline-flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-stretch gap-3 md:gap-8 p-6 md:p-12 mx-auto min-w-max`}
      >
        {rounds.map((round, rIndex) => {
          const isLastRound = rIndex === rounds.length - 1;
          
          return (
            <div key={rIndex} className="flex flex-col items-center">
              {/* Round Title */}
              <div className="relative mb-6 md:mb-8 group z-10">
                <div className="px-3 py-1 glass-panel rounded-full border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                  <h3 className="text-[8px] md:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    {round.name === 'Final' && isRtl ? 'النهائي الكبير' : 
                     round.name === 'Semi-Final' && isRtl ? 'نصف النهائي' : 
                     round.name === 'Quarter-Final' && isRtl ? 'ربع النهائي' : round.name}
                  </h3>
                </div>
                {/* Decorative dots */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-400 dark:bg-blue-500/20" />
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-600 dark:bg-blue-500/40" />
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-400 dark:bg-blue-500/20" />
                </div>
              </div>
              
              <div className="relative flex flex-col items-center justify-around h-full w-full min-h-[300px] md:min-h-[400px]">
                {/* 
                  If it's the last round (Final), we use justify-center to group Final + Bronze together in the middle.
                  Otherwise, we use justify-around to space matches out for the bracket lines.
                */}
                <div className={`flex flex-col h-full w-full ${isLastRound ? 'justify-center gap-12 md:gap-16' : 'justify-around gap-4 md:gap-8'}`}>
                  {round.matches.map((match) => {
                    const isEven = match.matchIndex % 2 === 0;
                    const baseGap = 24; 
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
                          totalMatches={round.matches.length}
                        />
                        
                        {!isLastRound && (
                          <div 
                            className={`absolute w-4 md:w-8 overflow-visible pointer-events-none transition-opacity duration-1000 ${isRtl ? '-left-4 md:-left-8' : '-right-4 md:-right-8'} ${match.winner ? 'opacity-100' : 'opacity-20'}`}
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
                                stroke={match.winner ? `url(#grad-${match.id})` : "currentColor"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-700 text-slate-300 dark:text-slate-800"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Third Place Match - Rendered Below the Final Match */}
                  {isLastRound && thirdPlaceMatch && (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom duration-1000">
                       <div className="mb-3 px-3 py-1 glass-panel rounded-full border border-orange-500/20">
                          <h3 className="text-[8px] md:text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-[0.2em] whitespace-nowrap">
                            {isRtl ? 'المركز الثالث' : 'Bronze'}
                          </h3>
                        </div>
                        <MatchCard
                          match={thirdPlaceMatch}
                          onSelectWinner={onSelectWinner}
                          onUpdateScore={onUpdateScore}
                          isRtl={isRtl}
                          isThirdPlace={true}
                          totalMatches={1}
                        />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
