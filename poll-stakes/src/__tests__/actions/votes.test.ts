import { Types } from 'mongoose';

import {
  createMockJWTPayload,
  createMockPoll,
  createMockUser,
  createMockVote,
} from '../mocks';
import {
  mockPollFindById,
  mockUserFindById,
  mockVoteCreate,
  mockVoteFindOne,
  resetAllMocks,
} from '../mocks/mongoose';

// Mock auth module
const mockVerifyToken = jest.fn();
jest.mock('@/lib/auth', () => ({
  verifyToken: (token: string) => mockVerifyToken(token),
  signToken: jest.fn(),
}));

// Import after mocks are set up
import { submitVote } from '@/lib/actions/votes';

describe('submitVote', () => {
  const validToken = 'valid-jwt-token';
  let mockUser: ReturnType<typeof createMockUser>;
  let mockPoll: ReturnType<typeof createMockPoll>;
  let mockJWTPayload: ReturnType<typeof createMockJWTPayload>;

  beforeEach(() => {
    resetAllMocks();
    mockUser = createMockUser();
    mockJWTPayload = createMockJWTPayload(mockUser._id);
    mockPoll = createMockPoll({
      createdBy: mockUser._id,
      status: 'active',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Future deadline
      yesPool: '0',
      noPool: '0',
    });

    mockVerifyToken.mockReturnValue(mockJWTPayload);
    mockUserFindById.mockResolvedValue(mockUser);
    mockPollFindById.mockResolvedValue(mockPoll);
    mockVoteFindOne.mockResolvedValue(null); // No existing votes
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should submit vote successfully', async () => {
    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000', // 1 TON in nanoTON
      txHash: 'unique_tx_hash_123',
    };

    const createdVote = createMockVote({
      poll: mockPoll._id,
      user: mockUser._id,
      choice: 'yes',
      amount: input.amount,
      txHash: input.txHash,
    });

    mockVoteCreate.mockResolvedValue(createdVote);

    const result = await submitVote(validToken, input);

    expect(result).toBeDefined();
    expect(result.poll).toBe(mockPoll._id);
    expect(result.choice).toBe('yes');
    expect(result.amount).toBe(input.amount);
    expect(result.txHash).toBe(input.txHash);
    expect(mockVerifyToken).toHaveBeenCalledWith(validToken);
    expect(mockVoteCreate).toHaveBeenCalled();
  });

  it('should update yesPool when voting yes', async () => {
    mockPoll.yesPool = '500000000'; // Start with 0.5 TON
    mockPoll.noPool = '0';

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000', // 1 TON
      txHash: 'tx_yes_vote',
    };

    const createdVote = createMockVote({
      poll: mockPoll._id,
      user: mockUser._id,
      choice: 'yes',
      amount: input.amount,
      txHash: input.txHash,
    });

    mockVoteCreate.mockResolvedValue(createdVote);

    await submitVote(validToken, input);

    // Poll should be updated with new yesPool
    expect(mockPoll.save).toHaveBeenCalled();
    expect(mockPoll.yesPool).toBe('1500000000'); // 0.5 + 1 = 1.5 TON
  });

  it('should update noPool when voting no', async () => {
    mockPoll.yesPool = '0';
    mockPoll.noPool = '2000000000'; // Start with 2 TON

    const input = {
      pollId: mockPoll._id,
      choice: 'no' as const,
      amount: '500000000', // 0.5 TON
      txHash: 'tx_no_vote',
    };

    const createdVote = createMockVote({
      poll: mockPoll._id,
      user: mockUser._id,
      choice: 'no',
      amount: input.amount,
      txHash: input.txHash,
    });

    mockVoteCreate.mockResolvedValue(createdVote);

    await submitVote(validToken, input);

    expect(mockPoll.save).toHaveBeenCalled();
    expect(mockPoll.noPool).toBe('2500000000'); // 2 + 0.5 = 2.5 TON
  });

  it('should throw error for invalid token', async () => {
    mockVerifyToken.mockReturnValue(null);

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'tx_invalid',
    };

    await expect(submitVote('invalid-token', input)).rejects.toThrow(
      'Invalid or expired token'
    );
  });

  it('should throw error if user not found', async () => {
    mockUserFindById.mockResolvedValue(null);

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'tx_no_user',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow('User not found');
  });

  it('should throw error if poll not found', async () => {
    mockPollFindById.mockResolvedValue(null);

    const input = {
      pollId: 'nonexistent_poll_id',
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'tx_no_poll',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow('Poll not found');
  });

  it('should throw error if poll is not active', async () => {
    mockPoll.status = 'closed';

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'tx_closed_poll',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow(
      'Poll is not active'
    );
  });

  it('should throw error if poll has expired', async () => {
    mockPoll.deadline = new Date(Date.now() - 1000); // Past deadline

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'tx_expired_poll',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow('Poll has expired');
  });

  it('should throw error for duplicate transaction hash', async () => {
    const existingVote = createMockVote({ txHash: 'duplicate_tx' });
    mockVoteFindOne.mockResolvedValueOnce(existingVote); // First call returns existing vote

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'duplicate_tx',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow(
      'Transaction already recorded'
    );
  });

  it('should throw error if user already voted on this poll', async () => {
    // First findOne (txHash check) returns null
    // Second findOne (existing vote check) returns existing vote
    mockVoteFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createMockVote({ poll: mockPoll._id, user: mockUser._id }));

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1000000000',
      txHash: 'new_tx_hash',
    };

    await expect(submitVote(validToken, input)).rejects.toThrow(
      'You have already voted on this poll'
    );
  });

  it('should handle large amounts correctly using BigInt', async () => {
    mockPoll.yesPool = '9999999999999999999'; // Large number

    const input = {
      pollId: mockPoll._id,
      choice: 'yes' as const,
      amount: '1', // Add 1 nanoTON
      txHash: 'tx_large_amount',
    };

    const createdVote = createMockVote({
      poll: mockPoll._id,
      user: mockUser._id,
      choice: 'yes',
      amount: input.amount,
      txHash: input.txHash,
    });

    mockVoteCreate.mockResolvedValue(createdVote);

    await submitVote(validToken, input);

    expect(mockPoll.yesPool).toBe('10000000000000000000');
  });
});
