'use client';

import { initData, useSignal } from '@tma.js/sdk-react';

export function TelegramUser() {
  const data = useSignal(initData.state);
  const user = data?.user;

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Telegram User</h3>
      <div className="space-y-1 text-sm text-gray-900 dark:text-gray-100">
        <p>
          <span className="text-gray-600 dark:text-gray-400">Name:</span> {user.first_name}{' '}
          {user.last_name}
        </p>
        {user.username && (
          <p>
            <span className="text-gray-600 dark:text-gray-400">Username:</span> @{user.username}
          </p>
        )}
        <p>
          <span className="text-gray-600 dark:text-gray-400">ID:</span> {user.id}
        </p>
      </div>
    </div>
  );
}
