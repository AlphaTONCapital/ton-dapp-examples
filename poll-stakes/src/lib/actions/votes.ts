'use server';

import { dbConnect } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Poll } from '@/models/poll';
import { Vote } from '@/models/vote';
import { User } from '@/models/user';
import type { Vote as VoteType, SubmitVoteInput, VoteWithPoll } from '@/types';

export async function submitVote(
  token: string,
  input: SubmitVoteInput
): Promise<VoteType> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const poll = await Poll.findById(input.pollId);
  if (!poll) {
    throw new Error('Poll not found');
  }

  if (poll.status !== 'active') {
    throw new Error('Poll is not active');
  }

  if (new Date() > poll.deadline) {
    throw new Error('Poll has expired');
  }

  // Check for duplicate transaction
  const existingTx = await Vote.findOne({ txHash: input.txHash });
  if (existingTx) {
    throw new Error('Transaction already recorded');
  }

  // Check if user already voted (compound index will also enforce this)
  const existingVote = await Vote.findOne({
    poll: input.pollId,
    user: payload.userId,
  });
  if (existingVote) {
    throw new Error('You have already voted on this poll');
  }

  // Create vote
  const vote = await Vote.create({
    poll: input.pollId,
    user: payload.userId,
    userUsername: user.username,
    userFirstName: user.firstName,
    choice: input.choice,
    amount: input.amount,
    txHash: input.txHash,
  });

  // Update pool totals
  if (input.choice === 'yes') {
    poll.yesPool = (BigInt(poll.yesPool) + BigInt(input.amount)).toString();
  } else {
    poll.noPool = (BigInt(poll.noPool) + BigInt(input.amount)).toString();
  }
  await poll.save();

  return {
    _id: vote._id.toString(),
    poll: vote.poll.toString(),
    user: vote.user.toString(),
    userUsername: vote.userUsername,
    userFirstName: vote.userFirstName,
    choice: vote.choice,
    amount: vote.amount,
    txHash: vote.txHash,
    createdAt: vote.createdAt.toISOString(),
  };
}

export async function getVotesByPoll(pollId: string): Promise<VoteType[]> {
  await dbConnect();

  const votes = await Vote.find({ poll: pollId })
    .sort({ amount: -1, createdAt: -1 })
    .lean();

  return votes.map((vote) => ({
    _id: vote._id.toString(),
    poll: vote.poll.toString(),
    user: vote.user.toString(),
    userUsername: vote.userUsername,
    userFirstName: vote.userFirstName,
    choice: vote.choice,
    amount: vote.amount,
    txHash: vote.txHash,
    payout: vote.payout,
    payoutTxHash: vote.payoutTxHash,
    createdAt: vote.createdAt.toISOString(),
  }));
}

export async function getUserVotes(token: string): Promise<VoteWithPoll[]> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  const votes = await Vote.find({ user: payload.userId })
    .sort({ createdAt: -1 })
    .populate('poll', 'question status result deadline')
    .lean();

  return votes.map((vote) => ({
    _id: vote._id.toString(),
    poll: (vote.poll as any)?._id?.toString() || vote.poll.toString(),
    pollQuestion: (vote.poll as any)?.question,
    pollStatus: (vote.poll as any)?.status,
    pollResult: (vote.poll as any)?.result,
    pollDeadline: (vote.poll as any)?.deadline?.toISOString(),
    user: vote.user.toString(),
    userUsername: vote.userUsername,
    userFirstName: vote.userFirstName,
    choice: vote.choice,
    amount: vote.amount,
    txHash: vote.txHash,
    payout: vote.payout,
    payoutTxHash: vote.payoutTxHash,
    createdAt: vote.createdAt.toISOString(),
  }));
}
