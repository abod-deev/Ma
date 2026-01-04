
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
    <div className={`w-full overflow-x-auto px-2 py-4 md:py-8 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div 
        ref={bracketRef}
        className={`inline-flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-stretch gap-3 md:gap-10 p-4 md:p-12 bg-[#020617] rounded-3xl border border-white/5 mx-auto`}
      >
        {rounds.map((round, rIndex) => {
          const isLastRound = rIndex === rounds.length - 1;
          
          return (
            <div key={rIndex} className="flex flex-col items-center">
              {/* Round Title */}
              <div className="relative mb-4 md:mb-6">
                <div className="relative px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                  <h3 className="text-[7px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap">
                    {round.name === 'Final' && isRtl ? 'النهائي' : 
                     round.name === 'Semi-Final' && isRtl ? 'نصف النهائي' : 
                     round.name === 'Quarter-Final' && isRtl ? 'ربع النهائي' : round.name}
                  </h3>
                </div>
              </div>
              
              <div className="relative flex flex-col items-center justify-around h-full w-full">
                {/* Main Matches Container */}
                <div className="flex flex-col justify-around h-full gap-4 md:gap-8 w-full">
                  {round.matches.map((match) => {
                    const isEven = match.matchIndex % 2 === 0;
                    // Significantly reduced vertical spacing for mobile
                    const baseGap = 24; 
                    const verticalOffset = Math.pow(2, rIndex) * (baseGap + (rIndex * 4)); 
                    
                    // Coordinates for SVG lines adjusted for smaller MatchCard
                    const SLOT1_Y = 92;
                    const SLOT2_Y = 108;
                    
                    let startY = 100;
                    if (match.winner) {
                      startY = (match.p1 && match.winner.id === match.p1.id) ? SLOT1_Y : SLOT2_Y;
                    }

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
                        
                        {!isLastRound && match.winner && (
                          <div 
                            className={`absolute w-3 md:w-10 overflow-visible pointer-events-none ${isRtl ? '-left-3 md:-left-10' : '-right-3 md:-right-10'}`}
                            style={{ top: '50%' }}
                          >
                            <svg 
                              viewBox={`0 0 100 200`} 
                              className="w-full overflow-visible opacity-40 md:opacity-100"
                              style={{ height: '200px', top: '-100px', position: 'absolute' }}
                            >
                              <path 
                                d={isRtl 
                                  ? `M 100 ${startY} L 50 ${startY} L 50 ${endY} L 0 ${endY}`
                                  : `M 0 ${startY} L 50 ${startY} L 50 ${endY} L 100 ${endY}`
                                }
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Third Place Match */}
                {isLastRound && thirdPlaceMatch && (
                  <div className="absolute top-[calc(50%+50px)] md:top-[calc(50%+80px)] flex flex-col items-center animate-in fade-in duration-1000 z-10">
                    <div className="mb-1 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
                      <h4 className="text-[5px] md:text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                        {isRtl ? 'المركز الثالث' : 'BRONZE MATCH'}
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
