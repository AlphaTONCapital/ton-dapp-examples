'use client';

import { formatTon } from '@/lib/format';
import type { Poll } from '@/types';

interface PollResultsProps {
  poll: Poll;
}

export function PollResults({ poll }: PollResultsProps) {
  if (poll.status !== 'settled' || !poll.result) {
    return null;
  }

  const losingPool = poll.result === 'yes' ? poll.noPool : poll.yesPool;

  return (
    <div
      className={`rounded-lg p-3 ${
        poll.result === 'yes'
          ? 'bg-green-50 dark:bg-green-950'
          : 'bg-red-50 dark:bg-red-950'
      }`}
    >
      <p
        className={`text-center font-semibold ${
          poll.result === 'yes'
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300'
        }`}
      >
        {poll.result.toUpperCase()} Wins!
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Winners split {formatTon(losingPool)} TON from the losing pool
      </p>
    </div>
  );
}
