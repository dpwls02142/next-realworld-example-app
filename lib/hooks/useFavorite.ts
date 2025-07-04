import { mutate, cache } from 'swr';
import { useState } from 'react';
import ArticleAPI from '../api/article';

type FavoriteMutationParams = {
  articleId: string;
  isFavorited: boolean;
};

type MutationState = {
  isLoading: boolean;
  error: Error | null;
};

export const useFavoriteMutation = () => {
  const [mutationState, setMutationState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const mutateFavorite = async (
    params: FavoriteMutationParams,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    },
  ) => {
    const { articleId, isFavorited } = params;
    setMutationState({ isLoading: true, error: null });

    try {
      let response;
      if (isFavorited) {
        response = await ArticleAPI.unfavorite(articleId);
      } else {
        response = await ArticleAPI.favorite(articleId);
      }

      const cacheMap = cache;
      const keysToInvalidate = [];

      for (const key of cacheMap.keys()) {
        if (Array.isArray(key) && key[0] === 'articles') {
          keysToInvalidate.push(key);
        }
        if (Array.isArray(key) && key[0] === 'profile') {
          keysToInvalidate.push(key);
        }
      }
      await Promise.all(
        keysToInvalidate.map((key) => mutate(key, undefined, true)),
      );
      await mutate('user', undefined, true);

      setMutationState({ isLoading: false, error: null });
      options?.onSuccess?.(response);
    } catch (error) {
      setMutationState({ isLoading: false, error: error as Error });
      options?.onError?.(error as Error);
    }
  };

  return {
    mutate: mutateFavorite,
    isLoading: mutationState.isLoading,
    error: mutationState.error,
  };
};
