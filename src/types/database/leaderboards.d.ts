import type { userId } from './common';

export type leaderboards = Record<'TicTacToe' | string & {}, Record<userId, {
  wins?: number;
  draws?: number;
  losses?: number;
  games?: number;
  drewAgainst?: Record<userId | 'AI', number>;
  lostAgainst?: Record<userId | 'AI', number>;
  wonAgainst?: Record<userId | 'AI', number>;
  against?: Record<userId | 'AI', number>;
}>>;