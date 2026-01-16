'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentTips } from '@/lib/actions/tips';
import { formatTon, formatRelativeTime, getDisplayName } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TipRecord } from '@/types';

export function TipList() {
  const { data: tips, isLoading } = useQuery<TipRecord[]>({
    queryKey: ['tips', 'recent'],
    queryFn: () => getRecentTips(10),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tips || tips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tips yet. Be the first to send one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Tips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip) => (
          <div
            key={tip._id}
            className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {getDisplayName(tip.fromUsername, tip.fromFirstName)}
              </p>
              {tip.message && (
                <p className="text-xs text-muted-foreground">&quot;{tip.message}&quot;</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(tip.createdAt)}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
              {formatTon(tip.amount)} TON
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
