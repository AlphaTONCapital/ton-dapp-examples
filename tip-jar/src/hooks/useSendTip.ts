'use client';

import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano, beginCell } from '@ton/core';
import { recordTip } from '@/lib/actions/tips';
import { useTelegramAuth } from './useTelegramAuth';

const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS!;

export interface SendTipParams {
  amount: number; // in TON (not nanoTON)
  message?: string;
}

export function useSendTip() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { token } = useTelegramAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendTip = useCallback(
    async ({ amount, message }: SendTipParams) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!token) {
        throw new Error('Not authenticated');
      }

      if (!RECIPIENT_ADDRESS) {
        throw new Error('Recipient address not configured');
      }

      setIsPending(true);
      setError(null);

      try {
        const nanoAmount = toNano(amount.toString());

        // Build the transaction
        // For TON text comments, create a Cell with 4-byte zero prefix followed by the message
        const payload = message
          ? beginCell()
              .storeUint(0, 32) // 4-byte zero prefix for text comments
              .storeStringTail(message)
              .endCell()
              .toBoc()
              .toString('base64')
          : undefined;

        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
          messages: [
            {
              address: RECIPIENT_ADDRESS,
              amount: nanoAmount.toString(),
              payload,
            },
          ],
        };

        // Send via TON Connect
        const result = await tonConnectUI.sendTransaction(transaction);

        // Record the tip in database
        const tip = await recordTip(token, {
          amount: nanoAmount.toString(),
          message,
          txHash: result.boc,
        });

        return tip;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send tip');
        setError(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [tonConnectUI, address, token]
  );

  return {
    sendTip,
    isPending,
    error,
    isWalletConnected: !!address,
  };
}
