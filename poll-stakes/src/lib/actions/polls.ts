'use server';

import { dbConnect } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Poll } from '@/models/poll';
import { Vote } from '@/models/vote';
import { User } from '@/models/user';
import type {
  Poll as PollType,
  PollWithVotes,
  CreatePollInput,
  PollStats,
  PollChoice,
} from '@/types';

export async function createPoll(
  token: string,
  input: CreatePollInput
): Promise<PollType> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!input.question || input.question.trim().length === 0) {
    throw new Error('Question is required');
  }
  if (input.question.length > 280) {
    throw new Error('Question must be 280 characters or less');
  }
  if (input.deadlineHours < 1 || input.deadlineHours > 168) {
    throw new Error('Deadline must be between 1 hour and 7 days');
  }

  const deadline = new Date(Date.now() + input.deadlineHours * 60 * 60 * 1000);

  const poll = await Poll.create({
    question: input.question.trim(),
    createdBy: user._id,
    deadline,
    status: 'active',
    yesPool: '0',
    noPool: '0',
  });

  return {
    _id: poll._id.toString(),
    question: poll.question,
    createdBy: poll.createdBy.toString(),
    createdByUsername: user.username,
    createdByFirstName: user.firstName,
    deadline: poll.deadline.toISOString(),
    status: poll.status,
    result: poll.result,
    yesPool: poll.yesPool,
    noPool: poll.noPool,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
  };
}

export async function getPolls(
  status?: 'active' | 'closed' | 'settled' | 'all',
  limit: number = 20
): Promise<PollType[]> {
  await dbConnect();

  const query = status && status !== 'all' ? { status } : {};

  const polls = await Poll.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'username firstName')
    .lean();

  return polls.map((poll) => ({
    _id: poll._id.toString(),
    question: poll.question,
    createdBy: (poll.createdBy as any)?._id?.toString() || poll.createdBy.toString(),
    createdByUsername: (poll.createdBy as any)?.username,
    createdByFirstName: (poll.createdBy as any)?.firstName,
    deadline: poll.deadline.toISOString(),
    status: poll.status,
    result: poll.result,
    yesPool: poll.yesPool,
    noPool: poll.noPool,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
  }));
}

export async function getPollById(
  pollId: string,
  token?: string
): Promise<PollWithVotes | null> {
  await dbConnect();

  const poll = await Poll.findById(pollId)
    .populate('createdBy', 'username firstName')
    .lean();

  if (!poll) {
    return null;
  }

  const votes = await Vote.find({ poll: pollId }).sort({ createdAt: -1 }).lean();

  let userVote: any = undefined;
  if (token) {
    const verifyPayload = verifyToken(token);
    if (verifyPayload) {
      userVote = votes.find((v) => v.user.toString() === verifyPayload.userId);
    }
  }

  return {
    _id: poll._id.toString(),
    question: poll.question,
    createdBy: (poll.createdBy as any)?._id?.toString() || poll.createdBy.toString(),
    createdByUsername: (poll.createdBy as any)?.username,
    createdByFirstName: (poll.createdBy as any)?.firstName,
    deadline: poll.deadline.toISOString(),
    status: poll.status,
    result: poll.result,
    yesPool: poll.yesPool,
    noPool: poll.noPool,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
    votes: votes.map((v) => ({
      _id: v._id.toString(),
      poll: v.poll.toString(),
      user: v.user.toString(),
      userUsername: v.userUsername,
      userFirstName: v.userFirstName,
      choice: v.choice,
      amount: v.amount,
      txHash: v.txHash,
      payout: v.payout,
      payoutTxHash: v.payoutTxHash,
      createdAt: v.createdAt.toISOString(),
    })),
    userVote: userVote
      ? {
          _id: userVote._id.toString(),
          poll: userVote.poll.toString(),
          user: userVote.user.toString(),
          userUsername: userVote.userUsername,
          userFirstName: userVote.userFirstName,
          choice: userVote.choice,
          amount: userVote.amount,
          txHash: userVote.txHash,
          payout: userVote.payout,
          payoutTxHash: userVote.payoutTxHash,
          createdAt: userVote.createdAt.toISOString(),
        }
      : undefined,
  };
}

export async function closePoll(token: string, pollId: string): Promise<PollType> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  const poll = await Poll.findById(pollId).populate('createdBy', 'username firstName');
  if (!poll) {
    throw new Error('Poll not found');
  }

  if (poll.status !== 'active') {
    throw new Error('Poll is not active');
  }

  // Only creator can manually close before deadline
  if (poll.createdBy._id.toString() !== payload.userId) {
    if (new Date() < poll.deadline) {
      throw new Error('Only the poll creator can close before deadline');
    }
  }

  poll.status = 'closed';
  await poll.save();

  return {
    _id: poll._id.toString(),
    question: poll.question,
    createdBy: poll.createdBy._id.toString(),
    createdByUsername: (poll.createdBy as any)?.username,
    createdByFirstName: (poll.createdBy as any)?.firstName,
    deadline: poll.deadline.toISOString(),
    status: poll.status,
    result: poll.result,
    yesPool: poll.yesPool,
    noPool: poll.noPool,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
  };
}

export async function settlePoll(
  token: string,
  pollId: string,
  result: PollChoice
): Promise<PollType> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  const poll = await Poll.findById(pollId).populate('createdBy', 'username firstName');
  if (!poll) {
    throw new Error('Poll not found');
  }

  if (poll.createdBy._id.toString() !== payload.userId) {
    throw new Error('Only the poll creator can settle');
  }

  if (poll.status !== 'closed') {
    throw new Error('Poll must be closed before settling');
  }

  // Calculate payouts for winners
  const winningPool = result === 'yes' ? poll.yesPool : poll.noPool;
  const losingPool = result === 'yes' ? poll.noPool : poll.yesPool;

  // Get all winning votes
  const winningVotes = await Vote.find({ poll: pollId, choice: result });

  // Calculate proportional payouts
  for (const vote of winningVotes) {
    const stakeAmount = BigInt(vote.amount);
    const winningPoolBigInt = BigInt(winningPool);

    if (winningPoolBigInt > 0n) {
      // Payout = stake + (stake / winningPool) * losingPool
      const proportionalWinnings =
        (stakeAmount * BigInt(losingPool)) / winningPoolBigInt;
      const totalPayout = stakeAmount + proportionalWinnings;

      vote.payout = totalPayout.toString();
      await vote.save();
    }
  }

  poll.status = 'settled';
  poll.result = result;
  await poll.save();

  return {
    _id: poll._id.toString(),
    question: poll.question,
    createdBy: poll.createdBy._id.toString(),
    createdByUsername: (poll.createdBy as any)?.username,
    createdByFirstName: (poll.createdBy as any)?.firstName,
    deadline: poll.deadline.toISOString(),
    status: poll.status,
    result: poll.result,
    yesPool: poll.yesPool,
    noPool: poll.noPool,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
  };
}

export async function getPollStats(): Promise<PollStats> {
  await dbConnect();

  const [totalPolls, activePolls, stakedAgg] = await Promise.all([
    Poll.countDocuments(),
    Poll.countDocuments({ status: 'active' }),
    Poll.aggregate([
      {
        $group: {
          _id: null,
          totalYes: { $sum: { $toLong: '$yesPool' } },
          totalNo: { $sum: { $toLong: '$noPool' } },
        },
      },
    ]),
  ]);

  const totalStaked =
    stakedAgg.length > 0
      ? (BigInt(stakedAgg[0].totalYes || 0) + BigInt(stakedAgg[0].totalNo || 0)).toString()
      : '0';

  return {
    totalPolls,
    activePolls,
    totalStaked,
  };
}
