# poll-stakes

A Telegram Mini App with TON wallet integration.

## Project Overview

This is a Next.js application designed to run as a Telegram Mini App with TON blockchain wallet connectivity.

**Tech Stack:**
- Next.js 15 with App Router and Turbopack
- React 19
- Tailwind CSS v4
- TON Connect (@tonconnect/ui-react)
- Telegram Mini App SDK (@tma.js/sdk-react)
- MongoDB with Mongoose
- TanStack Query for data fetching
- JWT authentication

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ton/` - TON Connect UI components
- `src/components/tma/` - Telegram Mini App components
- `src/hooks/` - Custom React hooks
- `src/lib/actions/` - Next.js Server Actions
- `src/lib/` - Utility functions and configuration
- `src/models/` - Mongoose database models
- `src/types/` - TypeScript type definitions

### Key Patterns

1. **Client Components:** Use `'use client'` directive for browser-only code
2. **Server Actions:** Use `'use server'` for secure backend operations
3. **Provider Hierarchy:** QueryClient > TonConnectUI > TmaProvider
4. **Telegram Detection:** Use `isTMA()` to check if running in Telegram

### Naming Conventions

- **React component files:** PascalCase (e.g., `MyComponent.tsx`)
- **Component function names:** PascalCase (e.g., `export function MyComponent()`)
- **Hook files:** camelCase with `use` prefix (e.g., `useSendTip.ts`)
- **Hook function names:** camelCase with `use` prefix (e.g., `useSendTip()`)

### Important Files

- `src/app/providers.tsx` - React context providers setup
- `src/components/tma/TmaProvider.tsx` - TMA SDK initialization
- `src/components/ton/TonConnectButton.tsx` - Wallet connection button
- `src/components/ton/WalletInfo.tsx` - Connected wallet display
- `src/lib/actions/auth.ts` - Authentication server actions
- `src/lib/telegram-init-data.ts` - Telegram init data validation
- `src/hooks/useTelegramAuth.ts` - Telegram authentication hook
- `public/tonconnect-manifest.json` - TON Connect app manifest

## Development Commands

```bash
pnpm dev        # Start development server with Turbopack
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm format     # Format with Prettier
```

## Environment Variables

Required environment variables (see `.env.example`):

- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing (generate with `openssl rand -base64 32`)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `NEXT_PUBLIC_MANIFEST_URL` - TON Connect manifest URL

---

# TON Connect Reference

## Key Hooks

```typescript
import {
  useTonConnectUI,         // Access TonConnect UI instance
  useTonWallet,            // Get connected wallet info
  useTonAddress,           // Get user's address (friendly format)
  useIsConnectionRestored, // Check if previous session restored
} from '@tonconnect/ui-react';
```

## Check Wallet Connection

```typescript
import { useTonWallet } from '@tonconnect/ui-react';

function MyComponent() {
  const wallet = useTonWallet();

  if (!wallet) {
    return <p>Please connect your wallet</p>;
  }

  return <p>Connected to {wallet.name}!</p>;
}
```

## Get Wallet Address

```typescript
import { useTonAddress } from '@tonconnect/ui-react';

function WalletAddress() {
  const address = useTonAddress();           // Bounceable format
  const rawAddress = useTonAddress(false);   // Non-bounceable format

  return <p>Address: {address}</p>;
}
```

## Send Transaction

```typescript
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toNano } from '@ton/core';

function SendTon() {
  const [tonConnectUI] = useTonConnectUI();

  const sendTransaction = async () => {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      messages: [
        {
          address: 'RECIPIENT_ADDRESS',
          amount: toNano('0.1').toString(), // 0.1 TON
        },
      ],
    };

    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction sent:', result.boc);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return <button onClick={sendTransaction}>Send 0.1 TON</button>;
}
```

## Send Transaction with Comment

```typescript
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';

const payload = beginCell()
  .storeUint(0, 32) // op code for comment
  .storeStringTail('Hello from Mini App!')
  .endCell()
  .toBoc()
  .toString('base64');

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 300,
  messages: [
    {
      address: 'RECIPIENT_ADDRESS',
      amount: toNano('0.05').toString(),
      payload: payload,
    },
  ],
};

await tonConnectUI.sendTransaction(transaction);
```

## Disconnect Wallet

```typescript
const [tonConnectUI] = useTonConnectUI();
await tonConnectUI.disconnect();
```

## Connection Restore Check

```typescript
import { useIsConnectionRestored, useTonWallet } from '@tonconnect/ui-react';

function App() {
  const isRestored = useIsConnectionRestored();
  const wallet = useTonWallet();

  if (!isRestored) {
    return <p>Restoring connection...</p>;
  }

  return wallet ? <Dashboard /> : <ConnectPrompt />;
}
```

## TON Connect Manifest

The manifest at `public/tonconnect-manifest.json` must be publicly accessible:

```json
{
  "url": "https://your-app-url.com",
  "name": "Your App Name",
  "iconUrl": "https://your-app-url.com/icon.png"
}
```

Set `NEXT_PUBLIC_MANIFEST_URL` to the public URL of this file.

## Error Handling

```typescript
try {
  await tonConnectUI.sendTransaction(transaction);
} catch (error) {
  if (error.message?.includes('User rejected')) {
    // User cancelled
  } else if (error.message?.includes('insufficient')) {
    // Not enough balance
  }
}
```

---

# Telegram Mini App Reference

## SDK Initialization

The SDK is initialized in `TmaProvider`:

```typescript
import {
  init as initSDK,
  initData,
  miniApp,
  themeParams,
  viewport,
  backButton,
  isTMA,
} from '@tma.js/sdk-react';

if (isTMA()) {
  initSDK();
  backButton.mount();
  initData.restore();
  miniApp.mount();
  themeParams.bindCssVars();
  await viewport.mount();
  viewport.bindCssVars();
  miniApp.ready();
}
```

## Check if Running in Telegram

```typescript
import { useTma } from '@/components/tma/tma-provider';

function MyComponent() {
  const { isInTelegram } = useTma();

  if (!isInTelegram) {
    return <p>Please open this app in Telegram</p>;
  }

  return <TelegramFeatures />;
}
```

## Access User Data

```typescript
import { initData, useSignal } from '@tma.js/sdk-react';

function UserProfile() {
  const data = useSignal(initData.state);
  const user = data?.user;

  if (!user) return null;

  return (
    <div>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Username: @{user.username}</p>
      <p>ID: {user.id}</p>
      <p>Premium: {user.isPremium ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Theme Parameters

CSS variables are automatically bound:

```css
.my-class {
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  border-color: var(--tg-theme-hint-color);
}
```

## Back Button

```typescript
import { backButton } from '@tma.js/sdk-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function DetailPage() {
  const router = useRouter();

  useEffect(() => {
    backButton.show();
    const off = backButton.onClick(() => router.back());
    return () => { off(); backButton.hide(); };
  }, [router]);

  return <div>Detail content</div>;
}
```

## Main Button

```typescript
import { mainButton } from '@tma.js/sdk-react';
import { useEffect } from 'react';

function CheckoutPage() {
  useEffect(() => {
    mainButton.mount();
    mainButton.setParams({
      text: 'Pay Now',
      isEnabled: true,
      isVisible: true,
    });

    const off = mainButton.onClick(() => { /* Handle payment */ });
    return () => { off(); mainButton.hide(); };
  }, []);

  return <div>Checkout content</div>;
}
```

## Haptic Feedback

```typescript
import { hapticFeedback } from '@tma.js/sdk-react';

// Impact: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
hapticFeedback.impactOccurred('medium');

// Notification: 'success' | 'warning' | 'error'
hapticFeedback.notificationOccurred('success');
```

## Open Links

```typescript
import { openLink, openTelegramLink } from '@tma.js/sdk-react';

openLink('https://example.com');
openTelegramLink('https://t.me/username');
```

## Share Content

```typescript
import { shareURL } from '@tma.js/sdk-react';

shareURL('https://your-app.com/invite/123', 'Check out this app!');
```

## Cloud Storage

```typescript
import { cloudStorage } from '@tma.js/sdk-react';

await cloudStorage.setItem('key', 'value');
const value = await cloudStorage.getItem('key');
await cloudStorage.deleteItem('key');
```

## QR Scanner

```typescript
import { qrScanner } from '@tma.js/sdk-react';

const result = await qrScanner.open({ text: 'Scan QR code' });
```

## Popup

```typescript
import { popup } from '@tma.js/sdk-react';

const result = await popup.open({
  title: 'Confirm',
  message: 'Are you sure?',
  buttons: [
    { id: 'ok', type: 'ok' },
    { id: 'cancel', type: 'cancel' },
  ],
});
```

## Viewport

```typescript
import { viewport } from '@tma.js/sdk-react';

viewport.expand(); // Expand to full screen
```

---

# Authentication

## Client Side

```typescript
import { initData, useSignal } from '@tma.js/sdk-react';

const rawInitData = useSignal(initData.raw);
// Send to server for validation
```

## Server Side Validation

```typescript
import { validateInitData, parseInitData } from '@/lib/telegram-init-data';

// Validate - throws if invalid
validateInitData(initDataRaw, process.env.TELEGRAM_BOT_TOKEN!);

// Parse the validated data
const data = parseInitData(initDataRaw);
const user = data.user;
```

**Security:** Always validate init data on the server.

---

# Bot API Integration

## Sending Messages

```typescript
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}
```

## Webhook Handler

```typescript
// src/app/api/telegram/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const update = await request.json();

  if (update.message?.text === '/start') {
    await sendMessage(update.message.chat.id, 'Welcome!');
  }

  return NextResponse.json({ ok: true });
}
```

---

# Resources

- [TON Connect Documentation](https://docs.ton.org/v3/guidelines/ton-connect/overview)
- [TON Connect UI React](https://github.com/ton-connect/sdk/tree/main/packages/ui-react)
- [@ton/core library](https://github.com/ton-org/ton-core)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [@tma.js/sdk-react Documentation](https://docs.telegram-mini-apps.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
