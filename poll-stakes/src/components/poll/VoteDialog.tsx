'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StakeAmountSelector } from './StakeAmountSelector';
import { useSubmitVote } from '@/hooks/useSubmitVote';
import type { PollChoice } from '@/types';

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollId: string;
  pollQuestion: string;
  choice: PollChoice;
}

export function VoteDialog({
  open,
  onOpenChange,
  pollId,
  pollQuestion,
  choice,
}: VoteDialogProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const { submitVote, isPending, isWalletConnected, isAuthenticated } = useSubmitVote();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please select an amount');
      return;
    }

    try {
      await submitVote({ pollId, choice, amount });
      toast.success(`Successfully staked ${amount} TON on ${choice.toUpperCase()}!`);
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      onOpenChange(false);
      setAmount(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit vote');
    }
  };

  const canSubmit = isWalletConnected && isAuthenticated && amount && amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Stake on{' '}
            <span className={choice === 'yes' ? 'text-green-600' : 'text-red-600'}>
              {choice.toUpperCase()}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">{pollQuestion}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!isWalletConnected ? (
            <p className="text-center text-sm text-muted-foreground">
              Please connect your wallet to stake
            </p>
          ) : !isAuthenticated ? (
            <p className="text-center text-sm text-muted-foreground">Authenticating...</p>
          ) : (
            <StakeAmountSelector
              selectedAmount={amount}
              onAmountChange={setAmount}
              disabled={isPending}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className={
              choice === 'yes'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Confirming...
              </span>
            ) : (
              `Stake ${amount || 0} TON`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
