'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_AMOUNTS = [0.1, 0.5, 1, 2, 5];

interface StakeAmountSelectorProps {
  selectedAmount: number | null;
  onAmountChange: (amount: number | null) => void;
  disabled?: boolean;
}

export function StakeAmountSelector({
  selectedAmount,
  onAmountChange,
  disabled,
}: StakeAmountSelectorProps) {
  const handlePresetClick = (amount: number) => {
    onAmountChange(amount);
  };

  const handleCustomChange = (value: string) => {
    const parsed = parseFloat(value);
    onAmountChange(isNaN(parsed) ? null : parsed);
  };

  const isPreset = selectedAmount !== null && PRESET_AMOUNTS.includes(selectedAmount);

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block text-sm font-medium">Select Amount (TON)</Label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? 'default' : 'outline'}
              onClick={() => handlePresetClick(amount)}
              disabled={disabled}
              className="h-10"
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
          value={!isPreset && selectedAmount !== null ? selectedAmount : ''}
          onChange={(e) => handleCustomChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {selectedAmount !== null && selectedAmount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          You will stake <span className="font-semibold">{selectedAmount} TON</span>
        </p>
      )}
    </div>
  );
}
