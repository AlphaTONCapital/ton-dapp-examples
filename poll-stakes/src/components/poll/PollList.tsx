'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { usePolls, useClosePoll, useSettlePoll } from '@/hooks/usePolls';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { PollCard } from './PollCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PollChoice } from '@/types';

type FilterStatus = 'active' | 'closed' | 'settled' | 'all';

export function PollList() {
  const [filter, setFilter] = useState<FilterStatus>('active');
  const { user } = useTelegramAuth();
  const { data: polls, isLoading } = usePolls(filter);
  const closePoll = useClosePoll();
  const settlePoll = useSettlePoll();

  const handleClose = async (pollId: string) => {
    try {
      await closePoll.mutateAsync(pollId);
      toast.success('Poll closed successfully');
    } catch (error) {
      toast.error('Failed to close poll');
    }
  };

  const handleSettle = async (pollId: string, result: PollChoice) => {
    try {
      await settlePoll.mutateAsync({ pollId, result });
      toast.success(`Poll settled: ${result.toUpperCase()} wins!`);
    } catch (error) {
      toast.error('Failed to settle poll');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Polls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {(['active', 'closed', 'settled', 'all'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {!polls || polls.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No {filter === 'all' ? '' : filter} polls yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              isCreator={user?._id === poll.createdBy}
              onClose={() => handleClose(poll._id)}
              onSettle={(result) => handleSettle(poll._id, result)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
