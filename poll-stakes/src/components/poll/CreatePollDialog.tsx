'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePoll } from '@/hooks/usePolls';

const DEADLINE_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '6 hours', value: 6 },
  { label: '24 hours', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
];

interface CreatePollDialogProps {
  trigger?: React.ReactNode;
}

export function CreatePollDialog({ trigger }: CreatePollDialogProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [deadlineHours, setDeadlineHours] = useState(24);
  const createPoll = useCreatePoll();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        deadlineHours,
      });
      toast.success('Poll created successfully!');
      setOpen(false);
      setQuestion('');
      setDeadlineHours(24);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create poll');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="w-full">Create Poll</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a Prediction Poll</DialogTitle>
            <DialogDescription>
              Ask a yes/no question. Others can stake TON on their prediction.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Will BTC reach $100k by end of month?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={280}
                disabled={createPoll.isPending}
              />
              <p className="text-right text-xs text-muted-foreground">
                {question.length}/280
              </p>
            </div>

            <div className="space-y-2">
              <Label>Voting Deadline</Label>
              <div className="grid grid-cols-3 gap-2">
                {DEADLINE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={deadlineHours === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeadlineHours(option.value)}
                    disabled={createPoll.isPending}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createPoll.isPending || !question.trim()}>
              {createPoll.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </span>
              ) : (
                'Create Poll'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
