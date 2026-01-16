'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoteDialog } from './VoteDialog';
import { PollResults } from './PollResults';
import {
  formatTon,
  formatTimeRemaining,
  getDisplayName,
  calculatePoolPercentage,
} from '@/lib/format';
import type { Poll, PollChoice } from '@/types';

interface PollCardProps {
  poll: Poll;
  userVote?: { choice: PollChoice; amount: string };
  isCreator?: boolean;
  onClose?: () => void;
  onSettle?: (result: PollChoice) => void;
}

export function PollCard({ poll, userVote, isCreator, onClose, onSettle }: PollCardProps) {
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<PollChoice | null>(null);

  const totalPool = BigInt(poll.yesPool) + BigInt(poll.noPool);
  const yesPercentage = calculatePoolPercentage(poll.yesPool, totalPool.toString());
  const noPercentage = calculatePoolPercentage(poll.noPool, totalPool.toString());

  const isExpired = new Date() > new Date(poll.deadline);
  const canVote = poll.status === 'active' && !isExpired && !userVote;
  const canClose = isCreator && poll.status === 'active' && isExpired;
  const canSettle = isCreator && poll.status === 'closed';

  const handleVoteClick = (choice: PollChoice) => {
    setSelectedChoice(choice);
    setVoteDialogOpen(true);
  };

  const getTimeDisplay = () => {
    if (poll.status === 'settled') return `Result: ${poll.result?.toUpperCase()}`;
    if (poll.status === 'closed') return 'Voting closed';
    if (isExpired) return 'Expired';
    const deadline = new Date(poll.deadline);
    const secondsRemaining = Math.floor((deadline.getTime() - Date.now()) / 1000);
    return formatTimeRemaining(secondsRemaining);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium leading-tight">{poll.question}</p>
            <span
              className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs ${
                poll.status === 'active' && !isExpired
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : poll.status === 'settled'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {getTimeDisplay()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            by {getDisplayName(poll.createdByUsername, poll.createdByFirstName)}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">
                YES: {formatTon(poll.yesPool)} TON ({yesPercentage}%)
              </span>
              <span className="text-red-600 dark:text-red-400">
                NO: {formatTon(poll.noPool)} TON ({noPercentage}%)
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-red-200 dark:bg-red-900">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Total staked: {formatTon(totalPool.toString())} TON
            </p>
          </div>

          {userVote && (
            <div className="rounded-lg bg-primary/10 p-2 text-center text-sm">
              You staked{' '}
              <span className="font-semibold">{formatTon(userVote.amount)} TON</span> on{' '}
              <span
                className={`font-semibold ${
                  userVote.choice === 'yes' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {userVote.choice.toUpperCase()}
              </span>
            </div>
          )}

          {poll.status === 'settled' && poll.result && <PollResults poll={poll} />}
        </CardContent>

        <CardFooter className="flex gap-2">
          {canVote && (
            <>
              <Button
                variant="outline"
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => handleVoteClick('yes')}
              >
                Vote YES
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => handleVoteClick('no')}
              >
                Vote NO
              </Button>
            </>
          )}

          {canClose && (
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Close Voting
            </Button>
          )}

          {canSettle && (
            <div className="flex w-full gap-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => onSettle?.('yes')}
              >
                Settle: YES Won
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => onSettle?.('no')}
              >
                Settle: NO Won
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {selectedChoice && (
        <VoteDialog
          open={voteDialogOpen}
          onOpenChange={setVoteDialogOpen}
          pollId={poll._id}
          pollQuestion={poll.question}
          choice={selectedChoice}
        />
      )}
    </>
  );
}
