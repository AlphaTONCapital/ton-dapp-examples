'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TonWalletButton } from '@/components/ton/TonConnectButton';
import { useTma } from '@/components/tma/TmaProvider';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSendTip } from '@/hooks/useSendTip';
import {
  TipAmountSelector,
  TipList,
  Leaderboard,
  RecipientCard,
} from '@/components/tip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { isInTelegram } = useTma();
  const { isAuthenticated, isLoading: authLoading, authenticate, isInitialized } =
    useTelegramAuth();
  const { sendTip, isPending, isWalletConnected } = useSendTip();
  const queryClient = useQueryClient();

  // Auto-authenticate only when running inside Telegram
  useEffect(() => {
    if (!isInTelegram) return;
    if (isInitialized && !isAuthenticated && !authLoading) {
      authenticate().catch((error) => {
        console.error('Auto-authentication failed:', error);
      });
    }
  }, [isInTelegram, isInitialized, isAuthenticated, authLoading, authenticate]);

  const handleSendTip = async (amount: number, message?: string) => {
    try {
      await sendTip({ amount, message });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['tipStats'] });
    } catch (error) {
      console.error('Failed to send tip:', error);
      // Error is already displayed via the hook
    }
  };

  const canSendTip = isWalletConnected && (isAuthenticated || !isInTelegram);

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            TON Tip Jar
          </h1>
          <TonWalletButton />
        </header>

        <RecipientCard />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send a Tip</CardTitle>
          </CardHeader>
          <CardContent>
            {!isWalletConnected ? (
              <div className="py-4 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  Connect your wallet to send tips
                </p>
                <TonWalletButton />
              </div>
            ) : !isAuthenticated && isInTelegram ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Authenticating...
                </span>
              </div>
            ) : (
              <TipAmountSelector
                onSend={handleSendTip}
                isPending={isPending}
                disabled={!canSendTip}
              />
            )}
          </CardContent>
        </Card>

        {!isInTelegram && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
              Browser Mode
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Running as a web app. Open in Telegram for full features.
            </p>
          </div>
        )}

        <TipList />
        <Leaderboard />

        <footer className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with create-ton-dapp</p>
        </footer>
      </div>
    </main>
  );
}
