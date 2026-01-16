'use client';

import { useUserVotes } from '@/hooks/usePolls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTon } from '@/lib/format';

export function UserStakes() {
  const { data: votes, isLoading } = useUserVotes();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Stakes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!votes || votes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Stakes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            You haven&apos;t staked on any polls yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Stakes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {votes.map((vote) => (
          <div key={vote._id} className="space-y-1 rounded-lg border p-3">
            <p className="line-clamp-2 text-sm font-medium">{vote.pollQuestion}</p>
            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-semibold ${
                  vote.choice === 'yes' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {vote.choice.toUpperCase()}: {formatTon(vote.amount)} TON
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  vote.pollStatus === 'active'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : vote.pollStatus === 'settled'
                      ? vote.pollResult === vote.choice
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {vote.pollStatus === 'settled'
                  ? vote.pollResult === vote.choice
                    ? 'Won'
                    : 'Lost'
                  : vote.pollStatus}
              </span>
            </div>
            {vote.payout && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Payout: {formatTon(vote.payout)} TON
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
