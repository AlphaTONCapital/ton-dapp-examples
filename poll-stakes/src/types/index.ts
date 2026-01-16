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
