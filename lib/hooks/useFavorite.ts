import { mutate, cache } from 'swr';
import { useState, useRef, useEffect } from 'react';
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

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mutateFavorite = async (
    params: FavoriteMutationParams,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    },
  ) => {
    const { articleId, isFavorited } = params;

    if (!isMountedRef.current) return;
    setMutationState({ isLoading: true, error: null });

    try {
      let response;
      if (isFavorited) {
        response = await ArticleAPI.unfavorite(articleId);
      } else {
        response = await ArticleAPI.favorite(articleId);
      }

      // 캐시 업데이트 함수들
      const updateArticleInCache = (articles: any[]) => {
        return articles.map((article) => {
          if (article.id.toString() === articleId) {
            return {
              ...article,
              favorited: !isFavorited,
              favorites_count: isFavorited
                ? Math.max(0, (article.favorites_count || 1) - 1)
                : (article.favorites_count || 0) + 1,
            };
          }
          return article;
        });
      };

      // 즐겨찾기 탭에서 게시글 제거 (즐겨찾기 취소 시)
      const removeFavoritedArticle = (articles: any[]) => {
        if (isFavorited) {
          return articles.filter(
            (article) => article.id.toString() !== articleId,
          );
        }
        return articles;
      };

      // 모든 관련 캐시를 한 번에 업데이트
      const updateAllCaches = async () => {
        const cacheUpdates = [];

        // 모든 캐시를 한 번에 순회하여 처리
        for (const key of cache.keys()) {
          const keyStr = typeof key === 'string' ? key : JSON.stringify(key);

          // Articles 관련 캐시 처리
          if (keyStr.includes('"articles"')) {
            const isFavoritedTab = keyStr.includes('"favorited"');

            if (isFavoritedTab) {
              // 즐겨찾기 탭 처리
              if (isFavorited) {
                // 즐겨찾기 취소 - 게시글 제거
                cacheUpdates.push(
                  mutate(
                    key,
                    (currentData: any) => {
                      if (currentData?.data?.articles) {
                        const newArticles = removeFavoritedArticle(
                          currentData.data.articles,
                        );
                        return {
                          ...currentData,
                          data: {
                            ...currentData.data,
                            articles: newArticles,
                            articlesCount: Math.max(
                              0,
                              (currentData.data.articlesCount || 1) - 1,
                            ),
                          },
                        };
                      }
                      return currentData;
                    },
                    false,
                  ),
                );
              } else {
                // 즐겨찾기 추가 - 전체 revalidate
                cacheUpdates.push(mutate(key, undefined, true));
              }
            } else {
              // 일반 게시글 목록 - 상태만 업데이트
              cacheUpdates.push(
                mutate(
                  key,
                  (currentData: any) => {
                    if (currentData?.data?.articles) {
                      return {
                        ...currentData,
                        data: {
                          ...currentData.data,
                          articles: updateArticleInCache(
                            currentData.data.articles,
                          ),
                        },
                      };
                    }
                    return currentData;
                  },
                  false,
                ),
              );
            }
          }

          // Profile 관련 캐시 처리
          if (keyStr.includes('"profile"')) {
            cacheUpdates.push(mutate(key, undefined, true));
          }
        }

        // 사용자 정보 revalidate
        cacheUpdates.push(mutate('user', undefined, true));

        return Promise.all(cacheUpdates);
      };

      await updateAllCaches();

      if (isMountedRef.current) {
        setMutationState({ isLoading: false, error: null });
        options?.onSuccess?.(response);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setMutationState({ isLoading: false, error: error as Error });
        options?.onError?.(error as Error);
      }
    }
  };

  return {
    mutate: mutateFavorite,
    isLoading: mutationState.isLoading,
    error: mutationState.error,
  };
};
