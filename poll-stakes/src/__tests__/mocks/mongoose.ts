// Mock implementations for Mongoose models
export const mockUserFindById = jest.fn();
export const mockUserCreate = jest.fn();
export const mockUserFindOneAndUpdate = jest.fn();

export const mockPollFindById = jest.fn();
export const mockPollCreate = jest.fn();
export const mockPollFind = jest.fn();
export const mockPollCountDocuments = jest.fn();
export const mockPollAggregate = jest.fn();

export const mockVoteFindOne = jest.fn();
export const mockVoteCreate = jest.fn();
export const mockVoteFind = jest.fn();

// Reset all mocks
export function resetAllMocks() {
  mockUserFindById.mockReset();
  mockUserCreate.mockReset();
  mockUserFindOneAndUpdate.mockReset();

  mockPollFindById.mockReset();
  mockPollCreate.mockReset();
  mockPollFind.mockReset();
  mockPollCountDocuments.mockReset();
  mockPollAggregate.mockReset();

  mockVoteFindOne.mockReset();
  mockVoteCreate.mockReset();
  mockVoteFind.mockReset();
}

// Mock module implementations
jest.mock('@/lib/mongodb', () => ({
  dbConnect: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/models/user', () => ({
  User: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
    create: (...args: unknown[]) => mockUserCreate(...args),
    findOneAndUpdate: (...args: unknown[]) => mockUserFindOneAndUpdate(...args),
  },
}));

jest.mock('@/models/poll', () => ({
  Poll: {
    findById: (...args: unknown[]) => {
      // Create a thenable object that also supports chaining
      const result = mockPollFindById(...args);
      return {
        // When awaited directly, return the result
        then: (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => {
          return Promise.resolve(result).then(resolve, reject);
        },
        // Support .populate() chaining
        populate: jest.fn().mockReturnValue({
          then: (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => {
            return Promise.resolve(result).then(resolve, reject);
          },
          lean: jest.fn().mockReturnValue(Promise.resolve(result)),
        }),
        lean: jest.fn().mockReturnValue(Promise.resolve(result)),
      };
    },
    create: (...args: unknown[]) => mockPollCreate(...args),
    find: (...args: unknown[]) => ({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(Promise.resolve(mockPollFind(...args))),
          }),
        }),
      }),
    }),
    countDocuments: (...args: unknown[]) => mockPollCountDocuments(...args),
    aggregate: (...args: unknown[]) => mockPollAggregate(...args),
  },
}));

jest.mock('@/models/vote', () => ({
  Vote: {
    findOne: (...args: unknown[]) => mockVoteFindOne(...args),
    create: (...args: unknown[]) => mockVoteCreate(...args),
    find: (...args: unknown[]) => {
      const result = mockVoteFind(...args);
      // Create a thenable that also supports chaining
      return {
        // When awaited directly (used in settlePoll)
        then: (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => {
          return Promise.resolve(result).then(resolve, reject);
        },
        // Support .sort() chaining (used in getUserVotes)
        sort: jest.fn().mockReturnValue({
          then: (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => {
            return Promise.resolve(result).then(resolve, reject);
          },
          lean: jest.fn().mockReturnValue(Promise.resolve(result)),
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(Promise.resolve(result)),
          }),
        }),
      };
    },
  },
}));
