import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserAPI from '../api/user';

type FollowMutationParams = {
  username: string;
  isFollowing: boolean;
};

export const useFollowersCount = (username: string) => {
  return useQuery({
    queryKey: ['followers', username],
    queryFn: () => UserAPI.getFollowersCount(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};

export const useFollowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ username, isFollowing }: FollowMutationParams) => {
      if (isFollowing) {
        return UserAPI.unfollow(username);
      } else {
        return UserAPI.follow(username);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['followers']);
        queryClient.invalidateQueries(['profile', variables.username]);
        queryClient.invalidateQueries(['user']);
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );
};
