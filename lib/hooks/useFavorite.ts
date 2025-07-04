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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]);
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
