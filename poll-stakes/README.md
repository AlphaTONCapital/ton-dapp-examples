# poll-stakes

A Telegram Mini App with TON wallet integration built with Next.js.

## Features

- Next.js 15 with App Router
- Tailwind CSS v4
- TON Connect wallet integration
- Telegram Mini App SDK
- MongoDB with Mongoose
- TanStack Query for data fetching
- Server Actions pattern
- JWT authentication

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

2. Configure your environment variables:
   - `TELEGRAM_BOT_TOKEN`: Get from [@BotFather](https://t.me/BotFather)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `NEXT_PUBLIC_APP_URL`: Your production URL

3. Update `public/tonconnect-manifest.json` with your app details

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format
```

## Testing in Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Set up a Mini App with `/newapp`
3. Set the Web App URL to your development URL (use ngrok or similar for HTTPS)
4. Open the Mini App in Telegram to test

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # React providers
├── components/
│   ├── ton/               # TON Connect components
│   └── tma/               # Telegram Mini App components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── actions/           # Server Actions
│   ├── mongodb.ts         # Database connection
│   └── auth.ts            # Auth utilities
├── models/                # Mongoose models
└── types/                 # TypeScript types
```

## Resources

- [TON Connect Documentation](https://docs.ton.org/v3/guidelines/ton-connect/overview)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)

## Claude Code

This project includes a `CLAUDE.md` file with comprehensive context for [Claude Code](https://claude.ai/code). When you open this project in Claude Code, it automatically understands:

- Project architecture and patterns
- TON Connect wallet integration
- Telegram Mini App SDK usage
- Authentication flow
- Bot API integration
