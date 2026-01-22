# TON dApp Examples

Practical example Telegram Mini Apps built with TON blockchain integration.

> Built with [create-ton-dapp](https://github.com/AlphaTONCapital/create-ton-dapp) - the quickest way to scaffold TON dApps

## Example Projects

### Tip Jar (`/tip-jar`)

A Telegram Mini App for sending TON tips with optional messages.

**Try it:** [@TipinJarBot](https://t.me/TipinJarBot)

- Send tips with messages (280 char limit)
- View transaction history
- Leaderboard of top tippers
- Recipient information display

### Poll Stakes (`/poll-stakes`)

A prediction market Mini App where users stake TON on poll outcomes.

**Try it:** [@pollstakesbot](https://t.me/pollstakesbot)

- Create yes/no polls (1 hour to 7 day deadlines)
- Stake TON on poll outcomes
- Proportional payouts to winners
- Comprehensive test coverage

## Tech Stack

| Category      | Technologies                         |
| ------------- | ------------------------------------ |
| Framework     | Next.js 16, React 19, TypeScript 5.9 |
| Blockchain    | TON Connect, @ton/core, @ton/crypto  |
| Telegram      | @tma.js/sdk-react                    |
| Database      | MongoDB, Mongoose                    |
| Data Fetching | TanStack Query                       |
| Styling       | Tailwind CSS v4, Radix UI            |
| Testing       | Jest, Testing Library                |

## Project Structure

Both projects follow the same architecture:

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── ton/                # TON Connect components
│   ├── tma/                # Telegram Mini App components
│   └── [feature]/          # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── actions/            # Next.js Server Actions
│   ├── auth.ts             # JWT utilities
│   └── mongodb.ts          # Database connection
├── models/                 # Mongoose schemas
└── types/                  # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)
- Telegram Bot Token (from @BotFather)

### Setup

1. Clone the repository

2. Choose a project and install dependencies:

   ```bash
   cd tip-jar  # or poll-stakes
   pnpm install
   ```

3. Copy `.env.example` to `.env` and configure:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Environment Variables

| Variable                         | Description                          | Required   |
| -------------------------------- | ------------------------------------ | ---------- |
| `TELEGRAM_BOT_TOKEN`             | Bot token from @BotFather            | Yes        |
| `MONGODB_URI`                    | MongoDB connection string            | Yes        |
| `JWT_SECRET`                     | Secret for JWT signing               | Yes        |
| `JWT_EXPIRES_IN`                 | Token expiration (e.g., `7d`)        | Yes        |
| `NEXT_PUBLIC_MANIFEST_URL`       | TON Connect manifest URL             | Yes        |
| `NEXT_PUBLIC_RECIPIENT_ADDRESS`  | TON address for tips (tip-jar only)  | tip-jar    |
| `NEXT_PUBLIC_RECIPIENT_NAME`     | Display name (tip-jar only)          | tip-jar    |

Generate a JWT secret:

```bash
openssl rand -base64 32
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm dev`           | Start dev server with Turbopack |
| `pnpm build`         | Create production build        |
| `pnpm start`         | Run production server          |
| `pnpm lint`          | Run ESLint                     |
| `pnpm format`        | Format code with Prettier      |
| `pnpm test`          | Run tests                      |
| `pnpm test:coverage` | Run tests with coverage        |

## Deployment

### Requirements

- HTTPS URL (required for Telegram Mini Apps)
- Publicly accessible TON Connect manifest
- MongoDB instance

### TON Connect Manifest

Host your `tonconnect-manifest.json` publicly (e.g., GitHub Gist):

```json
{
  "url": "https://your-app-url.com",
  "name": "Your App Name",
  "iconUrl": "https://your-app-url.com/icon.png"
}
```

## Resources

- [create-ton-dapp](https://github.com/AlphaTONCapital/create-ton-dapp) - Scaffold new TON dApps
- [TON Documentation](https://docs.ton.org/)
- [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

## License

MIT
