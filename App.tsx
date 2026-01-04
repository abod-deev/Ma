
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { NameInput } from './components/NameInput';
import { TournamentBracket } from './components/TournamentBracket';
import { Round, Participant, TournamentStatus, Match } from './types/tournament';
import { generateTournament } from './utils/bracketLogic';
import { Flame } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<TournamentStatus>('setup');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);
  const [isRtl, setIsRtl] = useState(true);
  const [namesList, setNamesList] = useState<string[]>([]);

  const calculateMatchWinner = (match: Match, isSingleLeg: boolean): Participant | null => {
    if (!match.p1 || !match.p2) return null;
    const s1_1 = parseInt(match.score1);
    const s2_1 = parseInt(match.score2);
    if (isSingleLeg) {
      if (isNaN(s1_1) || isNaN(s2_1)) return null;
      if (s1_1 > s2_1) return match.p1;
      if (s2_1 > s1_1) return match.p2;
      return null; 
    } else {
      const s1_2 = parseInt(match.score1_2) || 0;
      const s2_2 = parseInt(match.score2_2) || 0;
      const total1 = (isNaN(s1_1) ? 0 : s1_1) + s1_2;
      const total2 = (isNaN(s2_1) ? 0 : s2_1) + s2_2;
      if (match.score1 === '' && match.score2 === '' && match.score1_2 === '' && match.score2_2 === '') return null;
      if (total1 > total2) return match.p1;
      if (total2 > total1) return match.p2;
      return null;
    }
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
      const previousWinnerId = match.winner?.id;
      match.winner = winner;

      const isSemiFinal = currentRoundIdx === nextRounds.length - 2;
      if (isSemiFinal) {
        const loser = (winner && match.p1?.id === winner.id) ? match.p2 : match.p1;
        setThirdPlaceMatch(prev => {
          if (!prev) return null;
          const updated = { ...prev };
          if (currentMatchIdx === 0) updated.p1 = loser;
          else updated.p2 = loser;
          if (previousWinnerId !== winner?.id) {
            updated.winner = null;
            updated.score1 = ''; updated.score2 = '';
          }
          return updated;
        });
      }

      let r = currentRoundIdx;
      let mId = match.id;
      let currentWinner: Participant | null = winner;

      while (r < nextRounds.length - 1) {
        const currMatch = nextRounds[r].matches.find(m => m.id === mId);
        if (!currMatch || !currMatch.nextMatchId) break;
        const nextRound = nextRounds[r + 1];
        const nextMatch = nextRound.matches.find(m => m.id === currMatch.nextMatchId);
        if (nextMatch) {
          const slot = currMatch.nextMatchSlot;
          const oldParticipantInSlot = slot === 1 ? nextMatch.p1 : nextMatch.p2;
          if (slot === 1) nextMatch.p1 = currentWinner;
          else nextMatch.p2 = currentWinner;
          if (oldParticipantInSlot?.id !== currentWinner?.id) {
            nextMatch.winner = null;
            nextMatch.score1 = ''; nextMatch.score2 = '';
            nextMatch.score1_2 = ''; nextMatch.score2_2 = '';
            currentWinner = null; 
            mId = nextMatch.id;
            r++;
          } else break;
        } else break;
      }
      return nextRounds;
    });
  }, []);

  const handleUpdateScore = (matchId: string, slot: 1 | 2, score: string, leg: 1 | 2 = 1) => {
    if (matchId === 'third-place') {
      setThirdPlaceMatch(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        if (leg === 1) slot === 1 ? updated.score1 = score : updated.score2 = score;
        else slot === 1 ? updated.score1_2 = score : updated.score2_2 = score;
        const winner = calculateMatchWinner(updated, true);
        if (updated.winner?.id !== winner?.id) updated.winner = winner;
        return updated;
      });
    } else {
      setRounds(prevRounds => {
        const nextRounds: Round[] = JSON.parse(JSON.stringify(prevRounds));
        let updatedMatch: Match | null = null;
        let isFinalMatch = false;
        for (let r = 0; r < nextRounds.length; r++) {
          const match = nextRounds[r].matches.find(m => m.id === matchId);
          if (match) {
            if (leg === 1) slot === 1 ? match.score1 = score : match.score2 = score;
            else slot === 1 ? match.score1_2 = score : match.score2_2 = score;
            updatedMatch = match;
            isFinalMatch = r === nextRounds.length - 1;
            break;
          }
        }
        if (updatedMatch) {
          const winner = calculateMatchWinner(updatedMatch, isFinalMatch);
          if (updatedMatch.winner?.id !== winner?.id) setTimeout(() => handleSelectWinner(matchId, winner), 0);
        }
        return nextRounds;
      });
    }
  };

  const handleStartDraw = useCallback((names: string[]) => {
    setNamesList(names);
    const { rounds: newRounds, thirdPlaceMatch: newThirdPlace } = generateTournament(names);
    setRounds(newRounds);
    setThirdPlaceMatch(newThirdPlace);
    setStatus('active');
  }, []);

  const handleRedraw = useCallback(() => {
    if (confirm(isRtl ? 'هل تريد إعادة القرعة بنفس الأسماء؟' : 'Redraw with same names?')) {
      handleStartDraw(namesList);
    }
  }, [isRtl, namesList, handleStartDraw]);

  const handleReset = () => {
    if (status === 'setup') return;
    if (confirm(isRtl ? 'هل أنت متأكد من العودة لتعديل الأسماء؟' : 'Return to edit names?')) {
      setStatus('setup');
      setRounds([]);
      setThirdPlaceMatch(null);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`}>
      <Header 
        isRtl={isRtl} 
        onToggleRtl={() => setIsRtl(!isRtl)} 
        onReset={handleReset} 
        onRedraw={handleRedraw}
        showActions={status === 'active'} 
      />

      <main className="flex-grow pb-16">
        {status === 'setup' ? (
          <div className="container mx-auto px-4 py-20 max-w-4xl">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
                <Flame className="w-3 h-3 fill-current" />
                <span>Season 2024 Edition</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 uppercase leading-none">
                {isRtl ? 'قرعة الأبطال' : 'THE GRAND DRAW'}
              </h2>
              <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto font-medium">
                {isRtl ? 'أنشئ جدول بطولات احترافي بلمسة سينمائية.' : 'Create professional brackets with a cinematic touch.'}
              </p>
            </div>
            <NameInput onStart={handleStartDraw} isRtl={isRtl} initialText={namesList.join('\n')} />
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in duration-700">
             <div className="flex-grow py-8 overflow-hidden">
                <TournamentBracket rounds={rounds} thirdPlaceMatch={thirdPlaceMatch} onSelectWinner={handleSelectWinner} onUpdateScore={handleUpdateScore} isRtl={isRtl} />
             </div>
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">
        <p className="flex items-center justify-center gap-2">
          <span>{new Date().getFullYear()} Champions Draw Engine</span>
          <span className="w-1 h-1 rounded-full bg-blue-500" />
          <span className="text-slate-700">UI/UX v2.5</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
