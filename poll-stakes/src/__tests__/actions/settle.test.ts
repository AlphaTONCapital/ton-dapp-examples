import { Types } from 'mongoose';

import {
  createMockJWTPayload,
  createMockPoll,
  createMockUser,
  createMockVote,
} from '../mocks';
import {
  mockPollFindById,
  mockVoteFind,
  resetAllMocks,
} from '../mocks/mongoose';

// Mock auth module
const mockVerifyToken = jest.fn();
jest.mock('@/lib/auth', () => ({
  verifyToken: (token: string) => mockVerifyToken(token),
  signToken: jest.fn(),
}));

// Import after mocks are set up
import { settlePoll } from '@/lib/actions/polls';

describe('settlePoll', () => {
  const validToken = 'valid-jwt-token';
  let mockUser: ReturnType<typeof createMockUser>;
  let mockPoll: ReturnType<typeof createMockPoll>;
  let mockJWTPayload: ReturnType<typeof createMockJWTPayload>;

  beforeEach(() => {
    resetAllMocks();
    mockUser = createMockUser();
    mockJWTPayload = createMockJWTPayload(mockUser._id);

    // Create poll with populated createdBy (like findById().populate() returns)
    mockPoll = createMockPoll({
      createdBy: {
        _id: mockUser._id,
        username: mockUser.username,
        firstName: mockUser.firstName,
      },
      status: 'closed',
      yesPool: '100000000000', // 100 TON
      noPool: '30000000000', // 30 TON
    });

    mockVerifyToken.mockReturnValue(mockJWTPayload);
    mockPollFindById.mockResolvedValue(mockPoll);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should settle poll and set result', async () => {
    const winningVotes = [
      createMockVote({
        poll: mockPoll._id,
        choice: 'yes',
        amount: '50000000000', // 50 TON
      }),
      createMockVote({
        poll: mockPoll._id,
        choice: 'yes',
        amount: '50000000000', // 50 TON
      }),
    ];

    mockVoteFind.mockReturnValue(winningVotes);

    const result = await settlePoll(validToken, mockPoll._id, 'yes');

    expect(result).toBeDefined();
    expect(result.status).toBe('settled');
    expect(result.result).toBe('yes');
    expect(mockPoll.save).toHaveBeenCalled();
  });

  it('should calculate correct proportional payout for single winner', async () => {
    // YES pool: 100 TON, NO pool: 30 TON
    // Result: YES wins
    // User staked: 100 TON (entire yes pool)
    // Expected payout: 100 + (100/100) * 30 = 130 TON

    const winningVote = createMockVote({
      poll: mockPoll._id,
      choice: 'yes',
      amount: '100000000000', // 100 TON
    });

    mockVoteFind.mockReturnValue([winningVote]);

    await settlePoll(validToken, mockPoll._id, 'yes');

    expect(winningVote.save).toHaveBeenCalled();
    expect(winningVote.payout).toBe('130000000000'); // 130 TON
  });

  it('should calculate correct proportional payout for multiple winners', async () => {
    // YES pool: 100 TON, NO pool: 30 TON
    // Result: YES wins
    // User 1 staked: 20 TON, User 2 staked: 80 TON
    // User 1 payout: 20 + (20/100) * 30 = 20 + 6 = 26 TON
    // User 2 payout: 80 + (80/100) * 30 = 80 + 24 = 104 TON

    const winningVote1 = createMockVote({
      poll: mockPoll._id,
      choice: 'yes',
      amount: '20000000000', // 20 TON
    });

    const winningVote2 = createMockVote({
      poll: mockPoll._id,
      choice: 'yes',
      amount: '80000000000', // 80 TON
    });

    mockVoteFind.mockReturnValue([winningVote1, winningVote2]);

    await settlePoll(validToken, mockPoll._id, 'yes');

    expect(winningVote1.payout).toBe('26000000000'); // 26 TON
    expect(winningVote2.payout).toBe('104000000000'); // 104 TON
  });

  it('should handle NO winning correctly', async () => {
    // YES pool: 100 TON, NO pool: 30 TON
    // Result: NO wins
    // User staked: 30 TON (entire no pool)
    // Expected payout: 30 + (30/30) * 100 = 130 TON

    const winningVote = createMockVote({
      poll: mockPoll._id,
      choice: 'no',
      amount: '30000000000', // 30 TON
    });

    mockVoteFind.mockReturnValue([winningVote]);

    const result = await settlePoll(validToken, mockPoll._id, 'no');

    expect(result.result).toBe('no');
    expect(winningVote.payout).toBe('130000000000'); // 130 TON
  });

  it('should handle case with no losing pool (only original stake returned)', async () => {
    mockPoll.yesPool = '50000000000'; // 50 TON
    mockPoll.noPool = '0'; // No losing pool

    const winningVote = createMockVote({
      poll: mockPoll._id,
      choice: 'yes',
      amount: '50000000000', // 50 TON
    });

    mockVoteFind.mockReturnValue([winningVote]);

    await settlePoll(validToken, mockPoll._id, 'yes');

    // Payout = 50 + (50/50) * 0 = 50 TON (just original stake)
    expect(winningVote.payout).toBe('50000000000');
  });

  it('should throw error for invalid token', async () => {
    mockVerifyToken.mockReturnValue(null);

    await expect(settlePoll('invalid-token', mockPoll._id, 'yes')).rejects.toThrow(
      'Invalid or expired token'
    );
  });

  it('should throw error if poll not found', async () => {
    mockPollFindById.mockResolvedValue(null);

    await expect(settlePoll(validToken, 'nonexistent_id', 'yes')).rejects.toThrow(
      'Poll not found'
    );
  });

  it('should throw error if non-creator tries to settle', async () => {
    const otherUser = createMockUser();
    const otherJWTPayload = createMockJWTPayload(otherUser._id);
    mockVerifyToken.mockReturnValue(otherJWTPayload);

    await expect(settlePoll(validToken, mockPoll._id, 'yes')).rejects.toThrow(
      'Only the poll creator can settle'
    );
  });

  it('should throw error if poll is not closed', async () => {
    mockPoll.status = 'active';

    await expect(settlePoll(validToken, mockPoll._id, 'yes')).rejects.toThrow(
      'Poll must be closed before settling'
    );
  });

  it('should throw error if poll is already settled', async () => {
    mockPoll.status = 'settled';

    await expect(settlePoll(validToken, mockPoll._id, 'yes')).rejects.toThrow(
      'Poll must be closed before settling'
    );
  });

  it('should handle very small proportional winnings correctly', async () => {
    // YES pool: 1000 TON, NO pool: 1 nanoTON
    // User staked: 2 TON
    // Payout: 2 + (2/1000) * 0.000000001 = ~2 TON (almost no winnings)
    mockPoll.yesPool = '1000000000000'; // 1000 TON
    mockPoll.noPool = '1'; // 1 nanoTON

    const winningVote = createMockVote({
      poll: mockPoll._id,
      choice: 'yes',
      amount: '2000000000', // 2 TON
    });

    mockVoteFind.mockReturnValue([winningVote]);

    await settlePoll(validToken, mockPoll._id, 'yes');

    // Due to BigInt integer division, small amounts get truncated
    // Payout: 2000000000 + (2000000000 * 1) / 1000000000000 = 2000000000 + 0 = 2000000000
    expect(winningVote.payout).toBe('2000000000');
  });

  it('should distribute losing pool correctly among many winners', async () => {
    // YES pool: 10 TON total from 5 voters (2 TON each)
    // NO pool: 10 TON
    // Each winner gets: 2 + (2/10) * 10 = 2 + 2 = 4 TON

    mockPoll.yesPool = '10000000000'; // 10 TON
    mockPoll.noPool = '10000000000'; // 10 TON

    const winningVotes = Array.from({ length: 5 }, () =>
      createMockVote({
        poll: mockPoll._id,
        choice: 'yes',
        amount: '2000000000', // 2 TON each
      })
    );

    mockVoteFind.mockReturnValue(winningVotes);

    await settlePoll(validToken, mockPoll._id, 'yes');

    // Each winner should get 4 TON
    winningVotes.forEach((vote) => {
      expect(vote.payout).toBe('4000000000');
    });
  });
});
