
import { Participant, Match, Round, TournamentData } from '../types/tournament';

export const generateTournament = (names: string[]): TournamentData => {
  const participants: Participant[] = names
    .filter(n => n.trim() !== '')
    .map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n.trim() }));

  // Shuffle participants to ensure randomness
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  const numParticipants = participants.length;
  if (numParticipants < 2) return { rounds: [], thirdPlaceMatch: null };

  // 1. Determine Bracket Size (Next Power of 2)
  // Example: For 10 players, Next Power of 2 is 16.
  const numRounds = Math.ceil(Math.log2(numParticipants));
  const totalSlots = Math.pow(2, numRounds);
  
  // 2. Calculate "Byes" (Free Passes)
  // Byes are needed when we don't have a perfect power of 2.
  // Example: 16 slots - 10 players = 6 Byes.
  // This means 6 matches in Round 1 will be (Player vs Null), resulting in auto-win.
  // The remaining slots (4 players) will play 2 real matches.
  // Result for Round 2: 6 auto-winners + 2 real winners = 8 players (Perfect Power of 2).
  const numByes = totalSlots - numParticipants;
  const numFirstRoundMatches = totalSlots / 2;

  // 3. Create Round Structures
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

  // 4. Configure Match Types for Round 1
  // We determine which matches get a "Bye" (Single Player) and which are "Full" (PvP).
  const matchTypes: ('bye' | 'full')[] = [];
  
  // Add Bye configurations
  for (let i = 0; i < numByes; i++) matchTypes.push('bye');
  // Add Full Match configurations
  for (let i = numByes; i < numFirstRoundMatches; i++) matchTypes.push('full');

  // Shuffle match types so Byes are distributed randomly throughout the bracket
  // instead of all being at the top or bottom.
  for (let i = matchTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [matchTypes[i], matchTypes[j]] = [matchTypes[j], matchTypes[i]];
  }

  // 5. Fill Round 1 Matches
  let participantIdx = 0;
  
  rounds[0].matches.forEach((match, idx) => {
    const type = matchTypes[idx];
    
    // Always assign Player 1
    match.p1 = participants[participantIdx++];

    if (type === 'full') {
      // Assign Player 2 for a real match
      match.p2 = participants[participantIdx++];
    } else {
      // It's a Bye: Player 2 is null
      match.p2 = null;
      
      // AUTO-WIN LOGIC:
      // Since there is no opponent, Player 1 wins immediately.
      match.winner = match.p1;
      match.score1 = 'W'; // Visual indicator for Walkover
      match.score2 = '-';
      
      // Move winner to the next round immediately
      propagateWinner(rounds, 0, idx, match.p1);
    }
  });

  // 6. Initialize Third Place Match
  // This sits outside the standard rounds array
  let thirdPlaceMatch: Match | null = null;
  if (numRounds >= 2) {
    thirdPlaceMatch = {
      id: 'third-place',
      roundIndex: -1,
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

  // Place the winner in the correct slot of the next match
  if (currentMatch.nextMatchSlot === 1) {
    nextMatch.p1 = winner;
  } else {
    nextMatch.p2 = winner;
  }
}
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
