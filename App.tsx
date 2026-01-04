
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { NameInput } from './components/NameInput';
import { TournamentBracket } from './components/TournamentBracket';
import { Round, Participant, TournamentStatus, Match } from './types/tournament';
import { generateTournament } from './utils/bracketLogic';

const App: React.FC = () => {
  const [status, setStatus] = useState<TournamentStatus>('setup');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);
  const [isRtl, setIsRtl] = useState(true);
  const [namesList, setNamesList] = useState<string[]>([]);

  const handleStartDraw = (names: string[]) => {
    setNamesList(names);
    const data = generateTournament(names);
    setRounds(data.rounds);
    setThirdPlaceMatch(data.thirdPlaceMatch);
    setStatus('active');
  };

  const handleSelectWinner = useCallback((matchId: string, winner: Participant | null) => {
    if (matchId === 'third-place') {
      setThirdPlaceMatch(prev => prev ? { ...prev, winner } : null);
      return;
    }

    setRounds(prevRounds => {
      const nextRounds: Round[] = JSON.parse(JSON.stringify(prevRounds));
      let currentRoundIdx = -1;
      let currentMatchIdx = -1;

      for (let r = 0; r < nextRounds.length; r++) {
        const mIdx = nextRounds[r].matches.findIndex(m => m.id === matchId);
        if (mIdx !== -1) {
          currentRoundIdx = r;
          currentMatchIdx = mIdx;
          break;
        }
      }

      if (currentRoundIdx === -1) return prevRounds;

      const match = nextRounds[currentRoundIdx].matches[currentMatchIdx];
      const oldWinnerId = match.winner?.id;
      match.winner = winner;

      // Handle Third Place progression (from Semi-Finals)
      const isSemiFinal = currentRoundIdx === nextRounds.length - 2;
      if (isSemiFinal) {
        const loser = (winner && match.p1?.id === winner.id) ? match.p2 : match.p1;
        if (loser) {
          setThirdPlaceMatch(prev => {
            if (!prev) return null;
            const updated = { ...prev };
            if (currentMatchIdx === 0) updated.p1 = loser;
            else updated.p2 = loser;
            return updated;
          });
        }
      }

      // Propagate winner to next match
      let r = currentRoundIdx;
      let mId = match.id;
      let nextWinner: Participant | null = winner;

      while (r < nextRounds.length - 1) {
        const currentMatch = nextRounds[r].matches.find(m => m.id === mId);
        if (!currentMatch || !currentMatch.nextMatchId) break;

        const nextRound = nextRounds[r + 1];
        const nextMatch = nextRound.matches.find(m => m.id === currentMatch.nextMatchId);
        
        if (nextMatch) {
          const slot = currentMatch.nextMatchSlot;
          const oldParticipantInSlot = slot === 1 ? nextMatch.p1 : nextMatch.p2;
          
          if (slot === 1) nextMatch.p1 = nextWinner;
          else nextMatch.p2 = nextWinner;

          // If the participant in that slot changed, reset the winner of all subsequent matches
          if (oldParticipantInSlot?.id !== nextWinner?.id) {
            nextMatch.winner = null;
            nextMatch.score1 = '';
            nextMatch.score2 = '';
            nextMatch.score1_2 = '';
            nextMatch.score2_2 = '';
            nextWinner = null; 
            mId = nextMatch.id;
            r++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return nextRounds;
    });
  }, []);

  const handleUpdateScore = (matchId: string, slot: 1 | 2, score: string, leg: 1 | 2 = 1) => {
    let updatedMatch: Match | null = null;

    if (matchId === 'third-place') {
      setThirdPlaceMatch(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        if (leg === 1) {
          if (slot === 1) updated.score1 = score;
          else updated.score2 = score;
        } else {
          if (slot === 1) updated.score1_2 = score;
          else updated.score2_2 = score;
        }
        updatedMatch = updated;
        return updated;
      });
    } else {
      setRounds(prevRounds => {
        const nextRounds = [...prevRounds];
        for (const round of nextRounds) {
          const match = round.matches.find(m => m.id === matchId);
          if (match) {
            if (leg === 1) {
              if (slot === 1) match.score1 = score;
              else match.score2 = score;
            } else {
              if (slot === 1) match.score1_2 = score;
              else match.score2_2 = score;
            }
            updatedMatch = JSON.parse(JSON.stringify(match));
            break;
          }
        }
        return nextRounds;
      });
    }

    // Auto-winner logic after state update
    // Note: Since state updates are async, we use a timeout or wait for the next render
    // But we can compute it from the 'updatedMatch' we just captured
    setTimeout(() => {
      if (!updatedMatch || !updatedMatch.p1 || !updatedMatch.p2) return;
      
      const isSingleLeg = matchId === 'third-place' || (rounds.length > 0 && updatedMatch.roundIndex === rounds.length - 1);
      
      let winner: Participant | null = null;
      if (isSingleLeg) {
        const s1 = parseInt(updatedMatch.score1);
        const s2 = parseInt(updatedMatch.score2);
        if (!isNaN(s1) && !isNaN(s2)) {
          if (s1 > s2) winner = updatedMatch.p1;
          else if (s2 > s1) winner = updatedMatch.p2;
        }
      } else {
        const t1 = (parseInt(updatedMatch.score1) || 0) + (parseInt(updatedMatch.score1_2) || 0);
        const t2 = (parseInt(updatedMatch.score2) || 0) + (parseInt(updatedMatch.score2_2) || 0);
        
        // We only decide if scores are actually entered (not both 0 by default)
        const anyScoreEntered = updatedMatch.score1 !== '' || updatedMatch.score2 !== '' || updatedMatch.score1_2 !== '' || updatedMatch.score2_2 !== '';
        
        if (anyScoreEntered) {
          if (t1 > t2) winner = updatedMatch.p1;
          else if (t2 > t1) winner = updatedMatch.p2;
        }
      }

      if (winner !== null || updatedMatch.winner !== null) {
        handleSelectWinner(matchId, winner);
      }
    }, 0);
  };

  const handleReset = () => {
    if (status === 'setup') return;
    if (confirm(isRtl ? 'هل أنت متأكد من العودة لشاشة الإدخال؟' : 'Are you sure you want to return to setup?')) {
      setStatus('setup');
      setRounds([]);
      setThirdPlaceMatch(null);
    }
  };

  const handleRedraw = () => {
    if (confirm(isRtl ? 'إعادة القرعة بعشوائية جديدة؟' : 'Redraw with new random seeds?')) {
      handleStartDraw(namesList);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#020617] text-slate-100 ${isRtl ? 'rtl' : 'ltr'}`}>
      <Header 
        isRtl={isRtl} 
        onToggleRtl={() => setIsRtl(!isRtl)} 
        onReset={handleReset} 
        onRedraw={handleRedraw}
        showRedraw={status === 'active'}
      />

      <main className="flex-grow">
        {status === 'setup' ? (
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 uppercase">
                {isRtl ? 'قرعة الأبطال' : 'CHAMPIONS DRAW'}
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                {isRtl 
                  ? 'قم بإنشاء جدول بطولة احترافي في ثوانٍ. أدخل الأسماء وابدأ المنافسة.' 
                  : 'Create a professional tournament bracket in seconds. Enter names and start the competition.'}
              </p>
            </div>
            <NameInput onStart={handleStartDraw} isRtl={isRtl} />
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
             <TournamentBracket 
                rounds={rounds} 
                thirdPlaceMatch={thirdPlaceMatch}
                onSelectWinner={handleSelectWinner} 
                onUpdateScore={handleUpdateScore}
                isRtl={isRtl}
             />
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-900 text-center text-slate-600 text-[10px] uppercase tracking-[0.3em]">
        <p>© {new Date().getFullYear()} CHAMPIONS DRAW ENGINE • PREMIUM EDITION</p>
      </footer>
    </div>
  );
};

export default App;
