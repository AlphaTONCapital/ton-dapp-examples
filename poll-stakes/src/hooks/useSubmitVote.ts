'use client';

import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano, beginCell } from '@ton/core';
import { submitVote } from '@/lib/actions/votes';
import { useTelegramAuth } from './useTelegramAuth';
import type { PollChoice, Vote } from '@/types';

const POOL_WALLET_ADDRESS = process.env.NEXT_PUBLIC_POOL_WALLET_ADDRESS!;

export interface SubmitVoteParams {
  pollId: string;
  choice: PollChoice;
  amount: number; // in TON (not nanoTON)
}

export function useSubmitVote() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { token } = useTelegramAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitVoteTransaction = useCallback(
    async ({ pollId, choice, amount }: SubmitVoteParams): Promise<Vote> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!token) {
        throw new Error('Not authenticated');
      }

      if (!POOL_WALLET_ADDRESS) {
        throw new Error('Pool wallet address not configured');
      }

      setIsPending(true);
      setError(null);

      try {
        const nanoAmount = toNano(amount.toString());

        // Build the transaction with a comment indicating poll and choice
        const comment = `poll:${pollId}:${choice}`;
        const payload = beginCell()
          .storeUint(0, 32) // 4-byte zero prefix for text comments
          .storeStringTail(comment)
          .endCell()
          .toBoc()
          .toString('base64');

        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
          messages: [
            {
              address: POOL_WALLET_ADDRESS,
              amount: nanoAmount.toString(),
              payload,
            },
          ],
        };

        // Send via TON Connect
        const result = await tonConnectUI.sendTransaction(transaction);

        // Record the vote in database
        const vote = await submitVote(token, {
          pollId,
          choice,
          amount: nanoAmount.toString(),
          txHash: result.boc,
        });

        return vote;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to submit vote');
        setError(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [tonConnectUI, address, token]
  );

  return {
    submitVote: submitVoteTransaction,
    isPending,
    error,
    isWalletConnected: !!address,
    isAuthenticated: !!token,
  };
}
