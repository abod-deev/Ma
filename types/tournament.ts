
export interface Participant {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  p1: Participant | null;
  p2: Participant | null;
  score1: string;
  score2: string;
  score1_2: string; // نتيجة الإياب للاعب 1
  score2_2: string; // نتيجة الإياب للاعب 2
  winner: Participant | null;
  nextMatchId: string | null;
  nextMatchSlot: 1 | 2 | null;
}

export interface Round {
  name: string;
  matches: Match[];
}

export type TournamentStatus = 'setup' | 'active' | 'finished';

export interface TournamentData {
  rounds: Round[];
  thirdPlaceMatch: Match | null;
}
