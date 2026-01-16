'use client';

import { useEffect } from 'react';
import { TonWalletButton } from '@/components/ton/TonConnectButton';
import { WalletInfo } from '@/components/ton/WalletInfo';
import { TelegramUser } from '@/components/tma/TelegramUser';
import { useTma } from '@/components/tma/TmaProvider';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

export default function Home() {
  const { isInTelegram } = useTma();
  const { user, isAuthenticated, isLoading, authenticate, isInitialized } =
    useTelegramAuth();

  // Auto-authenticate only when running inside Telegram
  useEffect(() => {
    if (!isInTelegram) return;
    if (isInitialized && !isAuthenticated && !isLoading) {
      authenticate().catch((error) => {
        console.error('Auto-authentication failed:', error);
      });
    }
  }, [isInTelegram, isInitialized, isAuthenticated, isLoading, authenticate]);

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">TON dApp</h1>
          <TonWalletButton />
        </header>

        <div className="space-y-4">
          {isInTelegram && <TelegramUser />}
          <WalletInfo />

          {isInTelegram && isAuthenticated && user && (
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <h3 className="mb-2 font-semibold text-green-800 dark:text-green-200">
                Authenticated
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Welcome back, {user.firstName}!
              </p>
            </div>
          )}

          {isInTelegram && isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Authenticating...
              </span>
            </div>
          )}

          {!isInTelegram && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
              <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Browser Mode</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Running as a web app. Open in Telegram for full features.
              </p>
            </div>
          )}
        </div>

        <footer className="pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js, TON Connect & Telegram Mini Apps</p>
        </footer>
      </div>
    </main>
  );
}
