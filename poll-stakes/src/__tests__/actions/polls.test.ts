import { Types } from 'mongoose';

import {
  createMockJWTPayload,
  createMockPoll,
  createMockUser,
} from '../mocks';
import {
  mockPollCreate,
  mockUserFindById,
  resetAllMocks,
} from '../mocks/mongoose';

// Mock auth module
const mockVerifyToken = jest.fn();
jest.mock('@/lib/auth', () => ({
  verifyToken: (token: string) => mockVerifyToken(token),
  signToken: jest.fn(),
}));

// Import after mocks are set up
import { createPoll } from '@/lib/actions/polls';

describe('createPoll', () => {
  const validToken = 'valid-jwt-token';
  let mockUser: ReturnType<typeof createMockUser>;
  let mockJWTPayload: ReturnType<typeof createMockJWTPayload>;

  beforeEach(() => {
    resetAllMocks();
    mockUser = createMockUser();
    mockJWTPayload = createMockJWTPayload(mockUser._id);
    mockVerifyToken.mockReturnValue(mockJWTPayload);
    mockUserFindById.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a poll with valid input', async () => {
    const input = {
      question: 'Will Bitcoin reach $100k?',
      deadlineHours: 24,
    };

    const createdPoll = createMockPoll({
      _id: new Types.ObjectId().toString(),
      question: input.question,
      createdBy: mockUser._id,
      status: 'active',
      yesPool: '0',
      noPool: '0',
    });

    mockPollCreate.mockResolvedValue(createdPoll);

    const result = await createPoll(validToken, input);

    expect(result).toBeDefined();
    expect(result.question).toBe(input.question);
    expect(result.status).toBe('active');
    expect(result.yesPool).toBe('0');
    expect(result.noPool).toBe('0');
    expect(mockVerifyToken).toHaveBeenCalledWith(validToken);
    expect(mockUserFindById).toHaveBeenCalledWith(mockJWTPayload.userId);
    expect(mockPollCreate).toHaveBeenCalled();
  });

  it('should throw error for invalid token', async () => {
    mockVerifyToken.mockReturnValue(null);

    const input = {
      question: 'Test question?',
      deadlineHours: 24,
    };

    await expect(createPoll('invalid-token', input)).rejects.toThrow(
      'Invalid or expired token'
    );
  });

  it('should throw error for empty question', async () => {
    const input = {
      question: '',
      deadlineHours: 24,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow(
      'Question is required'
    );
  });

  it('should throw error for whitespace-only question', async () => {
    const input = {
      question: '   ',
      deadlineHours: 24,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow(
      'Question is required'
    );
  });

  it('should throw error for question exceeding 280 characters', async () => {
    const input = {
      question: 'a'.repeat(281),
      deadlineHours: 24,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow(
      'Question must be 280 characters or less'
    );
  });

  it('should throw error for deadline less than 1 hour', async () => {
    const input = {
      question: 'Valid question?',
      deadlineHours: 0,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow(
      'Deadline must be between 1 hour and 7 days'
    );
  });

  it('should throw error for deadline more than 168 hours (7 days)', async () => {
    const input = {
      question: 'Valid question?',
      deadlineHours: 169,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow(
      'Deadline must be between 1 hour and 7 days'
    );
  });

  it('should throw error if user not found', async () => {
    mockUserFindById.mockResolvedValue(null);

    const input = {
      question: 'Valid question?',
      deadlineHours: 24,
    };

    await expect(createPoll(validToken, input)).rejects.toThrow('User not found');
  });

  it('should trim question whitespace', async () => {
    const input = {
      question: '  Will this work?  ',
      deadlineHours: 24,
    };

    const createdPoll = createMockPoll({
      question: 'Will this work?',
      createdBy: mockUser._id,
    });

    mockPollCreate.mockResolvedValue(createdPoll);

    const result = await createPoll(validToken, input);

    expect(result.question).toBe('Will this work?');
    expect(mockPollCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        question: 'Will this work?',
      })
    );
  });

  it('should set initial pool values to 0', async () => {
    const input = {
      question: 'Test poll?',
      deadlineHours: 24,
    };

    const createdPoll = createMockPoll({
      question: input.question,
      createdBy: mockUser._id,
      yesPool: '0',
      noPool: '0',
    });

    mockPollCreate.mockResolvedValue(createdPoll);

    const result = await createPoll(validToken, input);

    expect(result.yesPool).toBe('0');
    expect(result.noPool).toBe('0');
    expect(mockPollCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        yesPool: '0',
        noPool: '0',
      })
    );
  });

  it('should set correct deadline based on deadlineHours', async () => {
    const input = {
      question: 'Test poll?',
      deadlineHours: 6,
    };

    const beforeCreate = Date.now();

    const createdPoll = createMockPoll({
      question: input.question,
      createdBy: mockUser._id,
    });

    mockPollCreate.mockResolvedValue(createdPoll);

    await createPoll(validToken, input);

    const createCall = mockPollCreate.mock.calls[0][0];
    const deadline = new Date(createCall.deadline).getTime();
    const expectedDeadline = beforeCreate + 6 * 60 * 60 * 1000;

    // Allow 1 second tolerance for test execution time
    expect(deadline).toBeGreaterThanOrEqual(expectedDeadline - 1000);
    expect(deadline).toBeLessThanOrEqual(expectedDeadline + 1000);
  });
});
