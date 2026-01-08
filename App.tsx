
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { NameInput } from './components/NameInput';
import { TournamentBracket } from './components/TournamentBracket';
import { WinnerModal } from './components/WinnerModal';
import { Round, Participant, TournamentStatus, Match, SavedTournament } from './types/tournament';
import { generateTournament } from './utils/bracketLogic';
import { Flame, Trophy, Trash2, ExternalLink, Calendar, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'champions_draw_archives';

const App: React.FC = () => {
  const [status, setStatus] = useState<TournamentStatus>('setup');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);
  const [isRtl, setIsRtl] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [namesList, setNamesList] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Results State
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [tournamentResults, setTournamentResults] = useState<{
    winner: Participant | null;
    runnerUp: Participant | null;
    thirdPlace: Participant | null;
  }>({ winner: null, runnerUp: null, thirdPlace: null });

  // Archive State
  const [savedTournaments, setSavedTournaments] = useState<SavedTournament[]>([]);
  const [currentTournamentId, setCurrentTournamentId] = useState<string | null>(null);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedTournaments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved tournaments", e);
      }
    }
    
    // Check fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Monitor Tournament Completion & Winner Changes
  useEffect(() => {
    if (rounds.length === 0) return;

    const finalRound = rounds[rounds.length - 1];
    if (!finalRound || finalRound.matches.length === 0) return;

    const finalMatch = finalRound.matches[0];
    const finalWinner = finalMatch.winner;
    
    // Check third place status
    const thirdPlaceDone = thirdPlaceMatch ? !!thirdPlaceMatch.winner : true;

    if (finalWinner && thirdPlaceDone) {
        const runnerUp = finalWinner.id === finalMatch.p1?.id ? finalMatch.p2 : finalMatch.p1;
        const third = thirdPlaceMatch?.winner || null;

        // Check if results have changed compared to stored state
        const isNewResult = 
            tournamentResults.winner?.id !== finalWinner.id ||
            tournamentResults.runnerUp?.id !== runnerUp?.id ||
            tournamentResults.thirdPlace?.id !== third?.id;

        if (isNewResult) {
            setTournamentResults({
                winner: finalWinner,
                runnerUp: runnerUp,
                thirdPlace: third
            });
            setShowWinnerModal(true);
            
            // Trigger confetti only if it's a fresh update or first load
            const duration = 3000;
            const end = Date.now() + duration;
            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#3b82f6', '#eab308', '#ffffff']
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#3b82f6', '#eab308', '#ffffff']
              });
              if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    }
  }, [rounds, thirdPlaceMatch, tournamentResults]);

  // Save to LocalStorage helper
  const saveToLocalStorage = (tournaments: SavedTournament[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  };

  // Helper to calculate winner based on scores
  const calculateMatchWinner = (match: Match, isSingleLeg: boolean): Participant | null => {
    if (!match.p1 || !match.p2) return null;
    
    // STRICT VALIDATION: Check if scores exist
    if (isSingleLeg) {
      if (match.score1 === '' || match.score2 === '') return null;
      
      const s1 = parseInt(match.score1);
      const s2 = parseInt(match.score2);
      if (s1 > s2) return match.p1;
      if (s2 > s1) return match.p2;
      return null; 
    } else {
      // For double legs, ALL 4 scores must be present
      if (match.score1 === '' || match.score2 === '' || match.score1_2 === '' || match.score2_2 === '') return null;

      const s1_1 = parseInt(match.score1);
      const s2_1 = parseInt(match.score2);
      const s1_2 = parseInt(match.score1_2) || 0;
      const s2_2 = parseInt(match.score2_2) || 0;
      
      const total1 = s1_1 + s1_2;
      const total2 = s2_1 + s2_2;
      
      if (total1 > total2) return match.p1;
      if (total2 > total1) return match.p2;
      return null;
    }
  };

  // CORE LOGIC: Propagate winners/losers throughout the tournament
  const propagateTournamentData = (
    currentRounds: Round[], 
    currentThirdPlace: Match | null, 
    changedMatchId: string,
    newWinner: Participant | null
  ): { updatedRounds: Round[], updatedThirdPlace: Match | null } => {
    
    const roundsCopy = JSON.parse(JSON.stringify(currentRounds));
    let thirdPlaceCopy = currentThirdPlace ? { ...currentThirdPlace } : null;

    // Find the changed match coordinates
    let rIdx = -1;
    let mIdx = -1;

    // Check if it's third place match
    if (changedMatchId === 'third-place') {
      if (thirdPlaceCopy) thirdPlaceCopy.winner = newWinner;
      return { updatedRounds: roundsCopy, updatedThirdPlace: thirdPlaceCopy };
    }

    // Find in regular rounds
    for (let r = 0; r < roundsCopy.length; r++) {
      const idx = roundsCopy[r].matches.findIndex((m: Match) => m.id === changedMatchId);
      if (idx !== -1) {
        rIdx = r;
        mIdx = idx;
        break;
      }
    }

    if (rIdx === -1) return { updatedRounds: roundsCopy, updatedThirdPlace: thirdPlaceCopy };

    // Update the winner of the current match
    const match = roundsCopy[rIdx].matches[mIdx];
    const prevWinnerId = match.winner?.id;
    match.winner = newWinner;

    // Detect if this is a Semi-Final to update Third Place
    const isSemiFinal = rIdx === roundsCopy.length - 2;
    if (isSemiFinal && thirdPlaceCopy) {
      // Determine loser
      let loser: Participant | null = null;
      if (newWinner) {
        loser = (match.p1?.id === newWinner.id) ? match.p2 : match.p1;
      }

      // Slot 1 is for match 0, Slot 2 is for match 1
      if (mIdx === 0) thirdPlaceCopy.p1 = loser;
      else thirdPlaceCopy.p2 = loser;

      // Reset third place winner if the participants changed
      if (prevWinnerId !== newWinner?.id) {
         thirdPlaceCopy.winner = null;
         thirdPlaceCopy.score1 = ''; thirdPlaceCopy.score2 = '';
      }
    }

    // Propagate Winner to Next Round
    let currR = rIdx;
    let currMatch = match;
    let winnerToPropagate = newWinner;

    while (currR < roundsCopy.length - 1) {
      if (!currMatch.nextMatchId) break;
      
      const nextRound = roundsCopy[currR + 1];
      const nextMatch = nextRound.matches.find((m: Match) => m.id === currMatch.nextMatchId);
      
      if (nextMatch) {
        const slot = currMatch.nextMatchSlot;
        const currentOccupant = slot === 1 ? nextMatch.p1 : nextMatch.p2;

        if (slot === 1) nextMatch.p1 = winnerToPropagate;
        else nextMatch.p2 = winnerToPropagate;

        // If the participant in the next match changed, we must reset the next match's scores/winner
        if (currentOccupant?.id !== winnerToPropagate?.id) {
          nextMatch.winner = null;
          nextMatch.score1 = ''; nextMatch.score2 = '';
          nextMatch.score1_2 = ''; nextMatch.score2_2 = '';
          winnerToPropagate = null;
          currMatch = nextMatch;
          currR++;
        } else {
           break; 
        }
      } else {
        break;
      }
    }

    return { updatedRounds: roundsCopy, updatedThirdPlace: thirdPlaceCopy };
  };

  // Update a specific tournament in the saved list (Persistence logic)
  const updateCurrentSavedTournament = useCallback((newRounds: Round[], newThirdPlace: Match | null) => {
    if (!currentTournamentId) return;

    setSavedTournaments(prev => {
      const updatedList = prev.map(t => {
        if (t.id === currentTournamentId) {
          return {
            ...t,
            data: {
              rounds: newRounds,
              thirdPlaceMatch: newThirdPlace
            }
          };
        }
        return t;
      });
      saveToLocalStorage(updatedList);
      return updatedList;
    });
  }, [currentTournamentId]);

  // Unified Handler for Updates (Manual Winner Select OR Score Update)
  const handleTournamentUpdate = useCallback((matchId: string, overrides: { winner?: Participant | null, scoreUpdate?: { slot: 1|2, val: string, leg: 1|2 } }) => {
    
    // 1. Get current state copies
    let currentRounds = rounds;
    let currentThirdPlace = thirdPlaceMatch;
    
    // 2. Identify the match
    let targetMatch: Match | null = null;
    let isFinalMatch = false;

    if (matchId === 'third-place') {
      targetMatch = currentThirdPlace ? { ...currentThirdPlace } : null;
      currentThirdPlace = targetMatch; 
    } else {
      for (let r = 0; r < currentRounds.length; r++) {
        const m = currentRounds[r].matches.find(m => m.id === matchId);
        if (m) {
          targetMatch = { ...m }; 
          isFinalMatch = r === currentRounds.length - 1;
          break;
        }
      }
    }

    if (!targetMatch) return;

    // 3. Apply Score Updates if any
    if (overrides.scoreUpdate) {
      const { slot, val, leg } = overrides.scoreUpdate;
      if (leg === 1) slot === 1 ? targetMatch.score1 = val : targetMatch.score2 = val;
      else slot === 1 ? targetMatch.score1_2 = val : targetMatch.score2_2 = val;
    }

    // 4. Determine Winner
    let newWinner = targetMatch.winner;
    
    if (overrides.winner !== undefined) {
      newWinner = overrides.winner;
    } else if (overrides.scoreUpdate) {
      newWinner = calculateMatchWinner(targetMatch, isFinalMatch || matchId === 'third-place');
    }

    // 5. Update State
    const { updatedRounds, updatedThirdPlace } = propagateTournamentData(rounds, thirdPlaceMatch, matchId, newWinner);
    
    // Apply score updates to the result of propagation
    if (overrides.scoreUpdate) {
       if (matchId === 'third-place' && updatedThirdPlace) {
          const { slot, val, leg } = overrides.scoreUpdate;
          if (leg === 1) slot === 1 ? updatedThirdPlace.score1 = val : updatedThirdPlace.score2 = val;
          else slot === 1 ? updatedThirdPlace.score1_2 = val : updatedThirdPlace.score2_2 = val;
       } else {
          for (const r of updatedRounds) {
             const m = r.matches.find(xm => xm.id === matchId);
             if (m) {
                const { slot, val, leg } = overrides.scoreUpdate;
                if (leg === 1) slot === 1 ? m.score1 = val : m.score2 = val;
                else slot === 1 ? m.score1_2 = val : m.score2_2 = val;
                break;
             }
          }
       }
    }

    // 6. Final Commit
    setRounds(updatedRounds);
    setThirdPlaceMatch(updatedThirdPlace);
    updateCurrentSavedTournament(updatedRounds, updatedThirdPlace);

  }, [rounds, thirdPlaceMatch, updateCurrentSavedTournament]);

  const handleSelectWinner = (matchId: string, winner: Participant | null) => {
    handleTournamentUpdate(matchId, { winner });
  };

  const handleUpdateScore = (matchId: string, slot: 1 | 2, score: string, leg: 1 | 2 = 1) => {
    handleTournamentUpdate(matchId, { scoreUpdate: { slot, val: score, leg } });
  };

  const handleStartDraw = useCallback((names: string[]) => {
    setNamesList(names);
    const { rounds: newRounds, thirdPlaceMatch: newThirdPlace } = generateTournament(names);
    
    const maxId = savedTournaments.reduce((max, t) => {
      const num = parseInt(t.id, 10);
      return (!isNaN(num) && num > max) ? num : max;
    }, 0);
    const nextId = (maxId + 1).toString();
    
    const newTournament: SavedTournament = {
      id: nextId,
      name: isRtl ? `قرعة ${new Date().toLocaleDateString('ar-EG')}` : `Tournament ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      participants: names,
      data: {
        rounds: newRounds,
        thirdPlaceMatch: newThirdPlace
      }
    };

    const newSavedList = [newTournament, ...savedTournaments];
    setSavedTournaments(newSavedList);
    saveToLocalStorage(newSavedList);
    
    setShowWinnerModal(false);
    setTournamentResults({ winner: null, runnerUp: null, thirdPlace: null });

    setCurrentTournamentId(newTournament.id);
    setRounds(newRounds);
    setThirdPlaceMatch(newThirdPlace);
    setStatus('active');
  }, [savedTournaments, isRtl]);

  const handleRedraw = useCallback(() => {
    if (confirm(isRtl ? 'هل تريد إعادة القرعة بنفس الأسماء؟ (سيتم إنشاء قرعة جديدة)' : 'Redraw with same names? (Creates new tournament)')) {
      handleStartDraw(namesList);
    }
  }, [isRtl, namesList, handleStartDraw]);

  const handleBackToHome = () => {
    setStatus('setup');
    setCurrentTournamentId(null);
    setNamesList([]);
    setShowWinnerModal(false);
  };

  const handleShowArchives = () => {
    setStatus('archive');
    setShowWinnerModal(false);
  };

  const handleLoadTournament = (tournament: SavedTournament) => {
    setRounds(tournament.data.rounds);
    setThirdPlaceMatch(tournament.data.thirdPlaceMatch);
    setNamesList(tournament.participants);
    setCurrentTournamentId(tournament.id);
    setStatus('active');
  };

  const handleDeleteTournament = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذه القرعة؟' : 'Are you sure you want to delete this tournament?')) {
      const updated = savedTournaments.filter(t => t.id !== id);
      setSavedTournaments(updated);
      saveToLocalStorage(updated);
      if (currentTournamentId === id) {
        handleBackToHome();
      }
    }
  };

  const handleExport = async () => {
    const element = document.getElementById('tournament-bracket');
    if (!element) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(element, {
        backgroundColor: isDarkMode ? '#020617' : '#f1f5f9',
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth + 40,
        height: element.scrollHeight + 40,
        x: -20,
        y: -20
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `bracket-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert(isRtl ? 'فشل تصدير الصورة' : 'Failed to export image');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500`}>
      <Header 
        isRtl={isRtl} 
        onToggleRtl={() => setIsRtl(!isRtl)} 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onReset={handleBackToHome} 
        onRedraw={status === 'active' ? handleRedraw : undefined}
        onExport={status === 'active' ? handleExport : undefined}
        onFullscreen={handleFullscreen}
        onShowArchives={handleShowArchives}
        onBackToHome={handleBackToHome}
        isFullscreen={isFullscreen}
        showActions={status === 'active'}
        status={status}
      />

      <main className="flex-grow flex flex-col justify-center pb-4 md:pb-16 relative">
        {showWinnerModal && tournamentResults.winner && (
           <WinnerModal 
              winner={tournamentResults.winner} 
              runnerUp={tournamentResults.runnerUp}
              thirdPlace={tournamentResults.thirdPlace}
              isRtl={isRtl}
              onClose={() => setShowWinnerModal(false)}
           />
        )}

        {status === 'setup' && (
          <div className="container mx-auto px-4 py-4 md:py-20 max-w-4xl flex flex-col justify-center min-h-[70vh]">
            <div className="text-center mb-4 md:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[9px] md:text-[10px] font-black tracking-widest uppercase mb-3 md:mb-6">
                <Flame className="w-3 h-3 fill-current" />
                <span>Season 2024</span>
              </div>
              <h2 className="text-4xl md:text-8xl font-black mb-3 md:mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-slate-500 uppercase leading-none">
                {isRtl ? 'قرعة الأبطال' : 'THE GRAND DRAW'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-lg max-w-xl mx-auto font-medium">
                {isRtl ? 'أنشئ جدول بطولات احترافي بلمسة سينمائية.' : 'Create professional brackets with a cinematic touch.'}
              </p>
            </div>
            <NameInput onStart={handleStartDraw} isRtl={isRtl} initialText={namesList.join('\n')} />
          </div>
        )}

        {status === 'archive' && (
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex-grow animate-in fade-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {isRtl ? 'سجل القرعات السابقة' : 'Tournament Archives'}
            </h2>
            
            {savedTournaments.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <p>{isRtl ? 'لا توجد قرعات محفوظة حالياً.' : 'No saved tournaments found.'}</p>
                <button onClick={handleBackToHome} className="mt-4 text-blue-500 hover:text-blue-400 underline text-sm">
                  {isRtl ? 'إنشاء قرعة جديدة' : 'Create new tournament'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {savedTournaments.map((tournament) => (
                  <div 
                    key={tournament.id}
                    onClick={() => handleLoadTournament(tournament)}
                    className="group glass-panel rounded-xl p-5 hover:bg-white/40 dark:hover:bg-white/10 transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-yellow-400 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
                          {tournament.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(tournament.createdAt).toLocaleDateString()}</span>
                          <span className="mx-1">•</span>
                          <Users className="w-3 h-3" />
                          <span>{tournament.participants.length}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteTournament(tournament.id, e)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-600 tracking-wider">
                         ID: #{tournament.id}
                      </span>
                      <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 text-xs font-bold">
                        <span>{isRtl ? 'عرض التفاصيل' : 'View Details'}</span>
                        <ExternalLink className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'active' && (
          <div className="flex flex-col h-full animate-in fade-in duration-700">
             <div className="flex-grow py-8 overflow-hidden">
                <TournamentBracket rounds={rounds} thirdPlaceMatch={thirdPlaceMatch} onSelectWinner={handleSelectWinner} onUpdateScore={handleUpdateScore} isRtl={isRtl} />
             </div>
          </div>
        )}
      </main>

      <footer className="py-4 md:py-10 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em]">
        <p className="flex items-center justify-center gap-2">
          <span>{new Date().getFullYear()} Champions Draw Engine</span>
          <span className="w-1 h-1 rounded-full bg-blue-500" />
          <span className="text-slate-600 dark:text-slate-700">UI/UX v2.5</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
