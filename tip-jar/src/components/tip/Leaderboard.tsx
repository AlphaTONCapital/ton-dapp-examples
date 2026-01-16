'use client';

import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/actions/tips';
import { formatTon, getDisplayName } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/types';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(10),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No supporters yet. Leaderboard will appear after the first tip!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Supporters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-lg">
                {index < 3 ? RANK_ICONS[index] : `${index + 1}.`}
              </span>
              <div>
                <p className="text-sm font-medium">
                  {getDisplayName(entry.username, entry.firstName)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.tipCount} {entry.tipCount === 1 ? 'tip' : 'tips'}
                </p>
              </div>
            </div>
            <span className="font-semibold text-primary">
              {formatTon(entry.totalAmount)} TON
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
