'use server';

import { dbConnect } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { Tip } from '@/models/tip';
import { User } from '@/models/user';

export interface RecordTipInput {
  amount: string; // in nanoTON
  message?: string;
  txHash: string;
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

export async function recordTip(
  token: string,
  input: RecordTipInput
): Promise<TipRecord> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  await dbConnect();

  // Get user info for denormalization
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if txHash already exists (prevent duplicates)
  const existingTip = await Tip.findOne({ txHash: input.txHash });
  if (existingTip) {
    throw new Error('Transaction already recorded');
  }

  const tip = await Tip.create({
    from: user._id,
    fromUsername: user.username,
    fromFirstName: user.firstName,
    amount: input.amount,
    message: input.message,
    txHash: input.txHash,
  });

  return {
    _id: tip._id.toString(),
    fromUsername: tip.fromUsername,
    fromFirstName: tip.fromFirstName,
    amount: tip.amount,
    message: tip.message,
    txHash: tip.txHash,
    createdAt: tip.createdAt.toISOString(),
  };
}

export async function getRecentTips(limit: number = 10): Promise<TipRecord[]> {
  await dbConnect();

  const tips = await Tip.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return tips.map((tip) => ({
    _id: tip._id.toString(),
    fromUsername: tip.fromUsername,
    fromFirstName: tip.fromFirstName,
    amount: tip.amount,
    message: tip.message,
    txHash: tip.txHash,
    createdAt: tip.createdAt.toISOString(),
  }));
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const leaderboard = await Tip.aggregate([
    {
      $group: {
        _id: '$from',
        totalAmount: {
          $sum: { $toLong: '$amount' },
        },
        tipCount: { $sum: 1 },
        username: { $first: '$fromUsername' },
        firstName: { $first: '$fromFirstName' },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
  ]);

  return leaderboard.map((entry) => ({
    userId: entry._id.toString(),
    username: entry.username,
    firstName: entry.firstName,
    totalAmount: entry.totalAmount.toString(),
    tipCount: entry.tipCount,
  }));
}

export async function getTipStats(): Promise<TipStats> {
  await dbConnect();

  const stats = await Tip.aggregate([
    {
      $group: {
        _id: null,
        totalTips: { $sum: 1 },
        totalAmount: { $sum: { $toLong: '$amount' } },
      },
    },
  ]);

  if (stats.length === 0) {
    return { totalTips: 0, totalAmount: '0' };
  }

  return {
    totalTips: stats[0].totalTips,
    totalAmount: stats[0].totalAmount.toString(),
  };
}
