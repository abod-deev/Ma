
import { Participant, Match, Round, TournamentData } from '../types/tournament';

export const generateTournament = (names: string[]): TournamentData => {
  const participants: Participant[] = names
    .filter(n => n.trim() !== '')
    .map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n.trim() }));

  // Shuffle participants
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  const numParticipants = participants.length;
  if (numParticipants < 2) return { rounds: [], thirdPlaceMatch: null };

  const numRounds = Math.ceil(Math.log2(numParticipants));
  const totalFirstRoundSlots = Math.pow(2, numRounds);
  const rounds: Round[] = [];

  for (let r = 0; r < numRounds; r++) {
    const matchCount = Math.pow(2, numRounds - r - 1);
    const roundName = r === numRounds - 1 ? 'Final' : 
                      r === numRounds - 2 ? 'Semi-Final' : 
                      r === numRounds - 3 ? 'Quarter-Final' : `Round of ${matchCount * 2}`;
    
    rounds.push({
      name: roundName,
      matches: Array.from({ length: matchCount }, (_, i) => ({
        id: `r${r}-m${i}`,
        roundIndex: r,
        matchIndex: i,
        p1: null,
        p2: null,
        score1: '',
        score2: '',
        score1_2: '',
        score2_2: '',
        winner: null,
        nextMatchId: r < numRounds - 1 ? `r${r+1}-m${Math.floor(i / 2)}` : null,
        nextMatchSlot: r < numRounds - 1 ? (i % 2 === 0 ? 1 : 2) : null
      }))
    });
  }

  // Populate first round
  for (let i = 0; i < totalFirstRoundSlots; i += 2) {
    const matchIdx = i / 2;
    const p1 = participants[i] || null;
    const p2 = participants[i + 1] || null;
    
    const match = rounds[0].matches[matchIdx];
    match.p1 = p1;
    match.p2 = p2;

    if (p1 && !p2) {
      match.winner = p1;
      propagateWinner(rounds, 0, matchIdx, p1);
    } else if (!p1 && p2) {
      match.winner = p2;
      propagateWinner(rounds, 0, matchIdx, p2);
    }
  }

  // Initialize Third Place Match if we have semi-finals
  let thirdPlaceMatch: Match | null = null;
  if (numRounds >= 2) {
    thirdPlaceMatch = {
      id: 'third-place',
      roundIndex: -1, // Special index
      matchIndex: 0,
      p1: null,
      p2: null,
      score1: '',
      score2: '',
      score1_2: '',
      score2_2: '',
      winner: null,
      nextMatchId: null,
      nextMatchSlot: null
    };
  }

  return { rounds, thirdPlaceMatch };
};

function propagateWinner(rounds: Round[], currentRoundIdx: number, currentMatchIdx: number, winner: Participant) {
  const currentMatch = rounds[currentRoundIdx].matches[currentMatchIdx];
  if (!currentMatch.nextMatchId) return;

  const nextRoundIdx = currentRoundIdx + 1;
  const nextMatchIdx = Math.floor(currentMatchIdx / 2);
  const nextMatch = rounds[nextRoundIdx].matches[nextMatchIdx];

  if (currentMatch.nextMatchSlot === 1) {
    nextMatch.p1 = winner;
  } else {
    nextMatch.p2 = winner;
  }
}
