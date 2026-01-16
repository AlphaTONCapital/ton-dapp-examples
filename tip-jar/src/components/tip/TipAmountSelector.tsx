'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_AMOUNTS = [0.1, 0.5, 1, 2];

interface TipAmountSelectorProps {
  onSend: (amount: number, message?: string) => void;
  isPending?: boolean;
  disabled?: boolean;
}

export function TipAmountSelector({
  onSend,
  isPending,
  disabled,
}: TipAmountSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');

  const activeAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : null);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleSend = () => {
    if (activeAmount && activeAmount > 0) {
      onSend(activeAmount, message || undefined);
      // Reset form after send
      setSelectedAmount(null);
      setCustomAmount('');
      setMessage('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block text-sm font-medium">Select Amount (TON)</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? 'default' : 'outline'}
              onClick={() => handlePresetClick(amount)}
              disabled={disabled || isPending}
              className={`h-12 ${selectedAmount === amount ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="custom-amount" className="mb-2 block text-sm font-medium">
          Or enter custom amount
        </Label>
        <Input
          id="custom-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          disabled={disabled || isPending}
        />
      </div>

      <div>
        <Label htmlFor="message" className="mb-2 block text-sm font-medium">
          Message (optional)
        </Label>
        <Input
          id="message"
          type="text"
          placeholder="Thanks for the great work!"
          maxLength={280}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || isPending}
        />
      </div>

      <Button
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
        size="lg"
        onClick={handleSend}
        disabled={!activeAmount || activeAmount <= 0 || disabled || isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Sending...
          </span>
        ) : (
          `Send ${activeAmount ? `${activeAmount} TON` : 'Tip'}`
        )}
      </Button>
    </div>
  );
}
