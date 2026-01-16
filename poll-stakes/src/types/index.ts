export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  walletAddress?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JWTPayload {
  userId: string;
  telegramId: number;
  iat: number;
  exp: number;
}

export type PollStatus = 'active' | 'closed' | 'settled';
export type PollChoice = 'yes' | 'no';

export interface Poll {
  _id: string;
  question: string;
  createdBy: string;
  createdByUsername?: string;
  createdByFirstName?: string;
  deadline: string; // ISO date string
  status: PollStatus;
  result?: PollChoice;
  yesPool: string; // nanoTON
  noPool: string; // nanoTON
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  poll: string;
  user: string;
  userUsername?: string;
  userFirstName?: string;
  choice: PollChoice;
  amount: string; // nanoTON
  txHash: string;
  payout?: string; // nanoTON
  payoutTxHash?: string;
  createdAt: string;
}

export interface VoteWithPoll extends Vote {
  pollQuestion?: string;
  pollStatus?: PollStatus;
  pollResult?: PollChoice;
  pollDeadline?: string;
}

export interface PollWithVotes extends Poll {
  votes: Vote[];
  userVote?: Vote;
}

export interface CreatePollInput {
  question: string;
  deadlineHours: number; // Hours from now
}

export interface SubmitVoteInput {
  pollId: string;
  choice: PollChoice;
  amount: string; // nanoTON
  txHash: string;
}

export interface PollStats {
  totalPolls: number;
  activePolls: number;
  totalStaked: string; // nanoTON
}
