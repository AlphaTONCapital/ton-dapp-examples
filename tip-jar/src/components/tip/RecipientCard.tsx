'use client';

import { useQuery } from '@tanstack/react-query';
import { getTipStats } from '@/lib/actions/tips';
import { formatTon } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';

const RECIPIENT_NAME = process.env.NEXT_PUBLIC_RECIPIENT_NAME || 'Creator';
const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '';

export function RecipientCard() {
  const { data: stats } = useQuery({
    queryKey: ['tipStats'],
    queryFn: () => getTipStats(),
    refetchInterval: 10000,
  });

  const shortAddress = RECIPIENT_ADDRESS
    ? `${RECIPIENT_ADDRESS.slice(0, 6)}...${RECIPIENT_ADDRESS.slice(-4)}`
    : 'Not configured';

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-4xl">
            💎
          </div>
          <h2 className="mb-1 text-xl font-bold">{RECIPIENT_NAME}</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5">{shortAddress}</code>
          </p>

          {stats && (
            <div className="mt-4 flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {formatTon(stats.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">TON received</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalTips}</p>
                <p className="text-xs text-muted-foreground">total tips</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
