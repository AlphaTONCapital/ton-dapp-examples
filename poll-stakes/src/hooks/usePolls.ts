'use client';

import type {
  CreatePollInput,
  Poll,
  PollChoice,
  PollStats,
  PollWithVotes,
  VoteWithPoll,
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  closePoll,
  createPoll,
  getPollById,
  getPolls,
  getPollStats,
  settlePoll,
} from '@/lib/actions/polls';
import { getUserVotes } from '@/lib/actions/votes';
import { useTelegramAuth } from './useTelegramAuth';

export function usePolls(status?: 'active' | 'closed' | 'settled' | 'all') {
  return useQuery<Poll[]>({
    queryKey: ['polls', status || 'all'],
    queryFn: () => getPolls(status),
    refetchInterval: 10000,
  });
}

export function usePoll(pollId: string) {
  const { token } = useTelegramAuth();

  return useQuery<PollWithVotes | null>({
    queryKey: ['poll', pollId],
    queryFn: () => getPollById(pollId, token || undefined),
    refetchInterval: 5000,
    enabled: !!pollId,
  });
}

export function usePollStats() {
  return useQuery<PollStats>({
    queryKey: ['pollStats'],
    queryFn: () => getPollStats(),
    refetchInterval: 30000,
  });
}

export function useUserVotes() {
  const { token } = useTelegramAuth();

  return useQuery<VoteWithPoll[]>({
    queryKey: ['userVotes'],
    queryFn: () => getUserVotes(token!),
    enabled: !!token,
    refetchInterval: 15000,
  });
}

export function useCreatePoll() {
  const { token } = useTelegramAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePollInput) => {
      if (!token) throw new Error('Not authenticated');
      return createPoll(token, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['pollStats'] });
    },
  });
}

export function useClosePoll() {
  const { token } = useTelegramAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pollId: string) => {
      if (!token) throw new Error('Not authenticated');
      return closePoll(token, pollId);
    },
    onSuccess: (_, pollId) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}

export function useSettlePoll() {
  const { token } = useTelegramAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pollId,
      result,
    }: {
      pollId: string;
      result: PollChoice;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return settlePoll(token, pollId, result);
    },
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });
}
