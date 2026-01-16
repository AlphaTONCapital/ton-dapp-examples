// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.JWT_EXPIRES_IN = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/poll-stakes-test';
process.env.NEXT_PUBLIC_POOL_WALLET_ADDRESS = 'EQTest...';
