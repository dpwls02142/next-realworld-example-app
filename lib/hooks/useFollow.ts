import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserAPI from '../api/user';

type FollowMutationParams = {
  username: string;
  isFollowing: boolean;
};

type MutationContext = {
  previousProfile: any;
};

export const useFollowersCountByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: () => UserAPI.getFollowersCountByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};

export const useFollowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, FollowMutationParams, MutationContext>({
    mutationFn: async ({ username, isFollowing }: FollowMutationParams) => {
      if (isFollowing) {
        return await UserAPI.unfollow(username);
      } else {
        return await UserAPI.follow(username);
      }
    },
    onMutate: async ({
      username,
      isFollowing,
    }: FollowMutationParams): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });

      const previousProfile = queryClient.getQueryData(['profile', username]);

      queryClient.setQueryData(['profile', username], (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          profile: {
            ...old?.data?.profile,
            following: !isFollowing,
          },
        },
      }));

      return { previousProfile };
    },
    onSuccess: async (data, variables) => {
      await queryClient.refetchQueries({
        queryKey: ['profile', variables.username],
      });
      if (data?.data?.profile?.user_id) {
        await queryClient.refetchQueries({
          queryKey: ['followers', data.data.profile.user_id],
        });
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ['profile', variables.username],
          context.previousProfile,
        );
      }
    },
  });
};
