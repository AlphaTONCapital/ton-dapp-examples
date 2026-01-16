// Set environment variable BEFORE any imports
const MOCK_RECIPIENT_ADDRESS = 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG';
process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS = MOCK_RECIPIENT_ADDRESS;

import { renderHook, act } from '@testing-library/react';
import { toNano, beginCell } from '@ton/core';

// Mock sendTransaction function
const mockSendTransaction = jest.fn();

// Mock TonConnect hooks
jest.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: jest.fn(() => [{ sendTransaction: mockSendTransaction }]),
  useTonAddress: jest.fn(() => ''),
}));

// Mock useTelegramAuth hook
jest.mock('../useTelegramAuth', () => ({
  useTelegramAuth: jest.fn(() => ({ token: null })),
}));

// Mock recordTip server action
jest.mock('@/lib/actions/tips', () => ({
  recordTip: jest.fn(),
}));

// Import hook after mocks are set up
import { useSendTip } from '../useSendTip';

// Import mocked modules for manipulation
import { useTonAddress } from '@tonconnect/ui-react';
import { useTelegramAuth } from '../useTelegramAuth';
import { recordTip } from '@/lib/actions/tips';

const mockUseTonAddress = useTonAddress as jest.Mock;
const mockUseTelegramAuth = useTelegramAuth as jest.Mock;
const mockRecordTip = recordTip as jest.Mock;

describe('useSendTip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockUseTonAddress.mockReturnValue('');
    mockUseTelegramAuth.mockReturnValue({ token: null });
    mockRecordTip.mockResolvedValue({ id: 'tip-123' });
    mockSendTransaction.mockResolvedValue({ boc: 'mock-tx-hash' });
  });

  describe('when wallet is not connected', () => {
    it('should throw "Wallet not connected" error', async () => {
      mockUseTonAddress.mockReturnValue('');
      mockUseTelegramAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useSendTip());

      await expect(
        act(async () => {
          await result.current.sendTip({ amount: 1 });
        })
      ).rejects.toThrow('Wallet not connected');

      expect(mockSendTransaction).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    it('should throw "Not authenticated" error', async () => {
      mockUseTonAddress.mockReturnValue('EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt');
      mockUseTelegramAuth.mockReturnValue({ token: null });

      const { result } = renderHook(() => useSendTip());

      await expect(
        act(async () => {
          await result.current.sendTip({ amount: 1 });
        })
      ).rejects.toThrow('Not authenticated');

      expect(mockSendTransaction).not.toHaveBeenCalled();
    });
  });

  describe('when sending TON without a message', () => {
    it('should send transaction with correct amount and no payload', async () => {
      const walletAddress = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt';
      mockUseTonAddress.mockReturnValue(walletAddress);
      mockUseTelegramAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useSendTip());

      await act(async () => {
        await result.current.sendTip({ amount: 1 });
      });

      expect(mockSendTransaction).toHaveBeenCalledTimes(1);
      const transaction = mockSendTransaction.mock.calls[0][0];

      // Verify transaction structure
      expect(transaction.validUntil).toBeDefined();
      expect(transaction.validUntil).toBeGreaterThan(Math.floor(Date.now() / 1000));
      expect(transaction.messages).toHaveLength(1);

      // Verify message details
      const message = transaction.messages[0];
      expect(message.address).toBe(MOCK_RECIPIENT_ADDRESS);
      expect(message.amount).toBe(toNano('1').toString()); // 1 TON = 1000000000 nanoTON
      expect(message.payload).toBeUndefined();
    });

    it('should record the tip after successful transaction', async () => {
      const walletAddress = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt';
      mockUseTonAddress.mockReturnValue(walletAddress);
      mockUseTelegramAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useSendTip());

      await act(async () => {
        await result.current.sendTip({ amount: 2 });
      });

      expect(mockRecordTip).toHaveBeenCalledWith('valid-token', {
        amount: toNano('2').toString(),
        message: undefined,
        txHash: 'mock-tx-hash',
      });
    });
  });

  describe('when sending TON with a message', () => {
    it('should send transaction with correct amount and payload containing message', async () => {
      const walletAddress = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt';
      mockUseTonAddress.mockReturnValue(walletAddress);
      mockUseTelegramAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useSendTip());
      const testMessage = 'Great work!';

      await act(async () => {
        await result.current.sendTip({ amount: 0.5, message: testMessage });
      });

      expect(mockSendTransaction).toHaveBeenCalledTimes(1);
      const transaction = mockSendTransaction.mock.calls[0][0];

      // Verify message details
      const message = transaction.messages[0];
      expect(message.address).toBe(MOCK_RECIPIENT_ADDRESS);
      expect(message.amount).toBe(toNano('0.5').toString());

      // Verify payload exists and is base64 encoded
      expect(message.payload).toBeDefined();
      expect(typeof message.payload).toBe('string');

      // Build expected payload to compare
      const expectedPayload = beginCell()
        .storeUint(0, 32) // 4-byte zero prefix for text comments
        .storeStringTail(testMessage)
        .endCell()
        .toBoc()
        .toString('base64');

      expect(message.payload).toBe(expectedPayload);
    });

    it('should record the tip with message after successful transaction', async () => {
      const walletAddress = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt';
      mockUseTonAddress.mockReturnValue(walletAddress);
      mockUseTelegramAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useSendTip());
      const testMessage = 'Thanks for the tips!';

      await act(async () => {
        await result.current.sendTip({ amount: 1.5, message: testMessage });
      });

      expect(mockRecordTip).toHaveBeenCalledWith('valid-token', {
        amount: toNano('1.5').toString(),
        message: testMessage,
        txHash: 'mock-tx-hash',
      });
    });
  });

  describe('hook state management', () => {
    it('should return isWalletConnected as true when wallet is connected', () => {
      mockUseTonAddress.mockReturnValue('EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt');

      const { result } = renderHook(() => useSendTip());

      expect(result.current.isWalletConnected).toBe(true);
    });

    it('should return isWalletConnected as false when wallet is not connected', () => {
      mockUseTonAddress.mockReturnValue('');

      const { result } = renderHook(() => useSendTip());

      expect(result.current.isWalletConnected).toBe(false);
    });
  });
});
