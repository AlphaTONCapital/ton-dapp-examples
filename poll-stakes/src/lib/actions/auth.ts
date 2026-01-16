'use server';

import { validateInitData, parseInitData } from '@/lib/telegram-init-data';
import { dbConnect } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import { User } from '@/models/user';
import type { AuthResponse } from '@/types';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function authenticateTelegram(
  initDataRaw: string
): Promise<AuthResponse> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  // Validate init data (expires in 1 hour)
  try {
    validateInitData(initDataRaw, TELEGRAM_BOT_TOKEN, { expiresIn: 3600 });
  } catch {
    throw new Error('Invalid or expired Telegram init data');
  }

  // Parse the validated data
  const initData = parseInitData(initDataRaw);
  const telegramUser = initData.user;

  if (!telegramUser) {
    throw new Error('User data not found in init data');
  }

  // Connect to database
  await dbConnect();

  // Find or create user
  const user = await User.findOneAndUpdate(
    { telegramId: telegramUser.id },
    {
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      photoUrl: telegramUser.photo_url,
      languageCode: telegramUser.language_code,
      lastLoginAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Generate JWT token
  const token = signToken({
    userId: user._id.toString(),
    telegramId: user.telegramId,
  });

  return {
    token,
    user: {
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
    },
  };
}
