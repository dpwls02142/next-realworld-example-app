import { useMutation, useQueryClient } from '@tanstack/react-query';
import ArticleAPI from '../api/article';

type FavoriteMutationParams = {
  articleId: string;
  isFavorited: boolean;
};

export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ articleId, isFavorited }: FavoriteMutationParams) => {
      if (isFavorited) {
        return ArticleAPI.unfavorite(articleId);
      } else {
        return ArticleAPI.favorite(articleId);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['articles']);
        queryClient.invalidateQueries(['user']);
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );
};
