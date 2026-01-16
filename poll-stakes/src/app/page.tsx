'use client';

import { useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { CreatePollDialog, PollList, UserStakes } from '@/components/poll';
import { useTma } from '@/components/tma/TmaProvider';
import { TonWalletButton } from '@/components/ton/TonConnectButton';
import { Card, CardContent } from '@/components/ui/card';
import { usePollStats } from '@/hooks/usePolls';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { formatTon } from '@/lib/format';

export default function Home() {
  const { isInTelegram } = useTma();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    authenticate,
    isInitialized,
  } = useTelegramAuth();
  const { data: stats } = usePollStats();
  const hasAttemptedAuth = useRef(false);

  // Auto-authenticate when running inside Telegram
  // Always re-authenticate to ensure fresh token (cached tokens may be expired)
  useEffect(() => {
    if (!isInTelegram) return;
    if (isInitialized && !authLoading && !hasAttemptedAuth.current) {
      hasAttemptedAuth.current = true;
      authenticate().catch((error) => {
        console.error('Auto-authentication failed:', error);
      });
    }
  }, [isInTelegram, isInitialized, authLoading, authenticate]);

  return (
    <main className="min-h-screen p-4">
      <Toaster position="top-center" />

      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Poll Stakes
          </h1>
          <div className="flex items-center gap-2">
            <TonWalletButton />
            {isAuthenticated && user && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 text-sm font-semibold text-white">
                {user.firstName?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase() ||
                  '?'}
              </div>
            )}
          </div>
        </header>

        {stats && (
          <Card>
            <CardContent className="flex justify-around py-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.activePolls}</p>
                <p className="text-muted-foreground text-xs">Active Polls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalPolls}</p>
                <p className="text-muted-foreground text-xs">Total Polls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {formatTon(stats.totalStaked)}
                </p>
                <p className="text-muted-foreground text-xs">TON Staked</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isInTelegram && authLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Authenticating...
            </span>
          </div>
        )}

        {!isInTelegram && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
              Browser Mode
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Running as a web app. Open in Telegram to create polls and vote.
            </p>
          </div>
        )}

        {isAuthenticated && <CreatePollDialog />}

        {isAuthenticated && <UserStakes />}

        <PollList />

        <footer className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with create-ton-dapp</p>
        </footer>
      </div>
    </main>
  );
}
