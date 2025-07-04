import { useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ArticleAPI from '../api/article';

type FavoriteMutationParams = {
  articleId: string;
  isFavorited: boolean;
};

export const useFavoriteMutation = () => {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    mutate: mutateFavorite,
    isLoading,
    error,
  } = useMutation({
    mutationFn: async ({ articleId, isFavorited }: FavoriteMutationParams) => {
      if (!isMountedRef.current) {
        throw new Error('Component is unmounted');
      }
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
