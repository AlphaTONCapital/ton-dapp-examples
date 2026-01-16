'use server';

import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/user';
import type { User as UserType } from '@/types';

export async function getUser(userId: string): Promise<UserType | null> {
  await dbConnect();

  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    languageCode: user.languageCode,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function getUserByTelegramId(
  telegramId: number
): Promise<UserType | null> {
  await dbConnect();

  const user = await User.findOne({ telegramId }).lean();

  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    languageCode: user.languageCode,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<UserType, 'walletAddress'>>
): Promise<UserType> {
  await dbConnect();

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
  }).lean();

  if (!user) {
    throw new Error('User not found');
  }

  return {
    _id: user._id.toString(),
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    languageCode: user.languageCode,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}
