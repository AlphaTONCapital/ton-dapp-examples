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

export interface TipRecord {
  _id: string;
  fromUsername?: string;
  fromFirstName?: string;
  amount: string;
  message?: string;
  txHash: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  firstName?: string;
  totalAmount: string;
  tipCount: number;
}

export interface TipStats {
  totalTips: number;
  totalAmount: string;
}
