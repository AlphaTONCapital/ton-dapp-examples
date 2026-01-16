'use client';

import { useTonAddress, useTonWallet } from '@tonconnect/ui-react';

export function WalletInfo() {
  const wallet = useTonWallet();
  const address = useTonAddress();

  if (!wallet) {
    return null;
  }

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Get wallet name from device info or app name
  const walletName =
    'device' in wallet && wallet.device?.appName
      ? wallet.device.appName
      : 'Connected Wallet';

  return (
    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Connected Wallet</h3>
      <div className="space-y-1 text-sm text-gray-900 dark:text-gray-100">
        <p>
          <span className="text-gray-600 dark:text-gray-400">Wallet:</span> {walletName}
        </p>
        <p>
          <span className="text-gray-600 dark:text-gray-400">Address:</span>{' '}
          <code className="rounded bg-gray-200 px-1 dark:bg-gray-700">{shortAddress}</code>
        </p>
      </div>
    </div>
  );
}
