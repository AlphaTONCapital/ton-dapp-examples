import { Types } from 'mongoose';

// Mock user data factory
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = new Types.ObjectId().toString();
  return {
    _id: id,
    telegramId: Math.floor(Math.random() * 1000000000),
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    ...overrides,
  };
}

// Mock poll data factory
export function createMockPoll(overrides: Partial<MockPoll> = {}): MockPoll {
  const id = new Types.ObjectId().toString();
  const createdBy = overrides.createdBy || new Types.ObjectId().toString();
  return {
    _id: id,
    question: 'Test poll question?',
    createdBy,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    status: 'active' as const,
    yesPool: '0',
    noPool: '0',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Mock vote data factory
export function createMockVote(overrides: Partial<MockVote> = {}): MockVote {
  const id = new Types.ObjectId().toString();
  return {
    _id: id,
    poll: new Types.ObjectId().toString(),
    user: new Types.ObjectId().toString(),
    userUsername: 'testuser',
    userFirstName: 'Test',
    choice: 'yes' as const,
    amount: '1000000000', // 1 TON in nanoTON
    txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Mock JWT payload
export function createMockJWTPayload(userId: string, telegramId: number = 123456789) {
  return {
    userId,
    telegramId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };
}

// Type definitions for mocks
export interface MockUser {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface MockPoll {
  _id: string;
  question: string;
  createdBy: string | { _id: string; username?: string; firstName?: string };
  deadline: Date;
  status: 'active' | 'closed' | 'settled';
  result?: 'yes' | 'no';
  yesPool: string;
  noPool: string;
  createdAt: Date;
  updatedAt: Date;
  save: jest.Mock;
}

export interface MockVote {
  _id: string;
  poll: string;
  user: string;
  userUsername?: string;
  userFirstName?: string;
  choice: 'yes' | 'no';
  amount: string;
  txHash: string;
  payout?: string;
  payoutTxHash?: string;
  createdAt: Date;
  save: jest.Mock;
}
