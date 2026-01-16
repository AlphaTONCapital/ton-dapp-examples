'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, updateUser } from '@/lib/actions/user';
import type { User } from '@/types';

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<Pick<User, 'walletAddress'>>;
    }) => updateUser(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data._id] });
    },
  });
}
