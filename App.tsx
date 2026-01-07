
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { NameInput } from './components/NameInput';
import { TournamentBracket } from './components/TournamentBracket';
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
  const [namesList, setNamesList] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Save to LocalStorage helper
  const saveToLocalStorage = (tournaments: SavedTournament[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  };

  // Trigger Confetti
  const triggerChampionConfetti = () => {
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

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

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

  const handleSelectWinner = useCallback((matchId: string, winner: Participant | null) => {
    let newThirdPlaceMatch = thirdPlaceMatch;
    let newRounds = [...rounds];
    
    if (matchId === 'third-place') {
      newThirdPlaceMatch = thirdPlaceMatch ? { ...thirdPlaceMatch, winner } : null;
      setThirdPlaceMatch(newThirdPlaceMatch);
      updateCurrentSavedTournament(newRounds, newThirdPlaceMatch);
      return;
    }

    let isChampionCrowned = false;

    // Deep copy to modify
    newRounds = JSON.parse(JSON.stringify(rounds));
    let currentRoundIdx = -1;
    let currentMatchIdx = -1;

    for (let r = 0; r < newRounds.length; r++) {
      const mIdx = newRounds[r].matches.findIndex(m => m.id === matchId);
      if (mIdx !== -1) {
        currentRoundIdx = r;
        currentMatchIdx = mIdx;
        break;
      }
    }

    if (currentRoundIdx !== -1) {
      const match = newRounds[currentRoundIdx].matches[currentMatchIdx];
      const previousWinnerId = match.winner?.id;
      match.winner = winner;

      // Check final
      if (currentRoundIdx === newRounds.length - 1 && winner && winner.id !== previousWinnerId) {
        isChampionCrowned = true;
      }

      // Handle Semi-Final -> Third Place logic
      const isSemiFinal = currentRoundIdx === newRounds.length - 2;
      if (isSemiFinal) {
        const loser = (winner && match.p1?.id === winner.id) ? match.p2 : match.p1;
        if (newThirdPlaceMatch) {
          // Clone third place to avoid mutation issues if it was state reference
          newThirdPlaceMatch = { ...newThirdPlaceMatch }; 
          if (currentMatchIdx === 0) newThirdPlaceMatch.p1 = loser;
          else newThirdPlaceMatch.p2 = loser;
          
          if (previousWinnerId !== winner?.id) {
            newThirdPlaceMatch.winner = null;
            newThirdPlaceMatch.score1 = ''; newThirdPlaceMatch.score2 = '';
          }
        }
      }

      // Propagate
      let r = currentRoundIdx;
      let mId = match.id;
      let currentWinner: Participant | null = winner;

      while (r < newRounds.length - 1) {
        const currMatch = newRounds[r].matches.find(m => m.id === mId);
        if (!currMatch || !currMatch.nextMatchId) break;
        const nextRound = newRounds[r + 1];
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
    }

    setRounds(newRounds);
    setThirdPlaceMatch(newThirdPlaceMatch);
    updateCurrentSavedTournament(newRounds, newThirdPlaceMatch);

    if (isChampionCrowned) {
      triggerChampionConfetti();
    }
  }, [rounds, thirdPlaceMatch, updateCurrentSavedTournament]);

  const handleUpdateScore = (matchId: string, slot: 1 | 2, score: string, leg: 1 | 2 = 1) => {
    let newThirdPlaceMatch = thirdPlaceMatch;
    let newRounds = [...rounds];
    let changed = false;

    if (matchId === 'third-place' && newThirdPlaceMatch) {
      newThirdPlaceMatch = { ...newThirdPlaceMatch };
      if (leg === 1) slot === 1 ? newThirdPlaceMatch.score1 = score : newThirdPlaceMatch.score2 = score;
      else slot === 1 ? newThirdPlaceMatch.score1_2 = score : newThirdPlaceMatch.score2_2 = score;
      
      const winner = calculateMatchWinner(newThirdPlaceMatch, true);
      if (newThirdPlaceMatch.winner?.id !== winner?.id) newThirdPlaceMatch.winner = winner;
      
      setThirdPlaceMatch(newThirdPlaceMatch);
      changed = true;
    } else {
      newRounds = JSON.parse(JSON.stringify(rounds));
      let updatedMatch: Match | null = null;
      let isFinalMatch = false;

      for (let r = 0; r < newRounds.length; r++) {
        const match = newRounds[r].matches.find(m => m.id === matchId);
        if (match) {
          if (leg === 1) slot === 1 ? match.score1 = score : match.score2 = score;
          else slot === 1 ? match.score1_2 = score : match.score2_2 = score;
          updatedMatch = match;
          isFinalMatch = r === newRounds.length - 1;
          break;
        }
      }

      if (updatedMatch) {
        const winner = calculateMatchWinner(updatedMatch, isFinalMatch);
        if (updatedMatch.winner?.id !== winner?.id) {
          setTimeout(() => handleSelectWinner(matchId, winner), 0);
        }
        setRounds(newRounds);
        changed = true;
      }
    }

    if (changed) {
      updateCurrentSavedTournament(newRounds, newThirdPlaceMatch);
    }
  };

  const handleStartDraw = useCallback((names: string[]) => {
    setNamesList(names);
    const { rounds: newRounds, thirdPlaceMatch: newThirdPlace } = generateTournament(names);
    
    // Calculate sequential ID based on existing max ID
    const maxId = savedTournaments.reduce((max, t) => {
      const num = parseInt(t.id, 10);
      return (!isNaN(num) && num > max) ? num : max;
    }, 0);
    const nextId = (maxId + 1).toString();
    
    // Create new Saved Tournament
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
    
    // Set Active
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

  // Navigation Logic
  const handleBackToHome = () => {
    setStatus('setup');
    setCurrentTournamentId(null);
    setNamesList([]);
  };

  const handleShowArchives = () => {
    setStatus('archive');
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
        backgroundColor: '#020617',
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
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`}>
      <Header 
        isRtl={isRtl} 
        onToggleRtl={() => setIsRtl(!isRtl)} 
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

      <main className="flex-grow flex flex-col justify-center pb-4 md:pb-16">
        {status === 'setup' && (
          <div className="container mx-auto px-4 py-4 md:py-20 max-w-4xl flex flex-col justify-center min-h-[70vh]">
            <div className="text-center mb-4 md:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black tracking-widest uppercase mb-3 md:mb-6">
                <Flame className="w-3 h-3 fill-current" />
                <span>Season 2024</span>
              </div>
              <h2 className="text-4xl md:text-8xl font-black mb-3 md:mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 uppercase leading-none">
                {isRtl ? 'قرعة الأبطال' : 'THE GRAND DRAW'}
              </h2>
              <p className="text-slate-400 text-xs md:text-lg max-w-xl mx-auto font-medium">
                {isRtl ? 'أنشئ جدول بطولات احترافي بلمسة سينمائية.' : 'Create professional brackets with a cinematic touch.'}
              </p>
            </div>
            <NameInput onStart={handleStartDraw} isRtl={isRtl} initialText={namesList.join('\n')} />
          </div>
        )}

        {status === 'archive' && (
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex-grow animate-in fade-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-8 text-center flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {isRtl ? 'سجل القرعات السابقة' : 'Tournament Archives'}
            </h2>
            
            {savedTournaments.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p>{isRtl ? 'لا توجد قرعات محفوظة حالياً.' : 'No saved tournaments found.'}</p>
                <button onClick={handleBackToHome} className="mt-4 text-blue-400 hover:text-blue-300 underline text-sm">
                  {isRtl ? 'إنشاء قرعة جديدة' : 'Create new tournament'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {savedTournaments.map((tournament) => (
                  <div 
                    key={tournament.id}
                    onClick={() => handleLoadTournament(tournament)}
                    className="group glass-panel rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-yellow-400 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors">
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
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                         ID: #{tournament.id}
                      </span>
                      <div className="flex items-center gap-1 text-blue-400 text-xs font-bold">
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

      <footer className="py-4 md:py-10 border-t border-white/5 text-center text-slate-600 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em]">
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
