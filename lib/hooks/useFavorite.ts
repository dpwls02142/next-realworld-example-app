import { useMutation, useQueryClient } from '@tanstack/react-query';
import ArticleAPI from '../api/article';

type FavoriteMutationParams = {
  articleId: string;
  isFavorited: boolean;
};

export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();
  const {
    mutate: mutateFavorite,
    isLoading,
    error,
  } = useMutation({
    mutationFn: async ({ articleId, isFavorited }: FavoriteMutationParams) => {
      if (isFavorited) {
        return await ArticleAPI.unfavorite(articleId);
      } else {
        return await ArticleAPI.favorite(articleId);
      }
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      await queryClient.invalidateQueries({
        queryKey: ['articles', 'favorited'],
      });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    mutate: mutateFavorite,
    isLoading,
    error,
  };
};
