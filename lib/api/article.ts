import { supabase, getCurrentUser } from '../utils/supabase/client';
import {
  ArticleType,
  ArticleResponse,
  ArticleListResponse,
} from '../types/articleType';
import TagAPI from './tag';

const CONFIG = {
  THROTTLE_INTERVAL: 3000,
  CLEANUP_DELAY: 5000,
  DEFAULT_LIMIT: 10,
} as const;

const ARTICLE_SELECT = `
  *,
  user_profiles!articles_author_id_fkey (
    username,
    bio,
    image
  ),
  article_tags (
    tags (
      name
    )
  ),
  article_favorites (
    id,
    user_id
  )
`;

const ARTICLE_SELECT_BY_TAG = `
  *,
  user_profiles!articles_author_id_fkey (username, bio, image),
  article_tags!inner (tags!inner (name)),
  article_favorites (
    id,
    user_id
  )
`;

// 즐겨찾기별 조회용 select
const ARTICLE_SELECT_FAVORITED = `
  *,
  user_profiles!articles_author_id_fkey (
    username,
    bio,
    image
  ),
  article_tags (
    tags (
      name
    )
  ),
  article_favorites!inner (
    id,
    user_id
  )
`;

// 상세 페이지용 간단한 select (팔로우/즐겨찾기 정보 제외)
const ARTICLE_SELECT_DETAIL = `
  *,
  user_profiles!articles_author_id_fkey (
    username,
    bio,
    image
  ),
  article_tags (
    tags (
      name
    )
  )
`;

type ApiResponse<T = any> = {
  data: T;
  status: number;
};

const throttle = (() => {
  let lastRequest: Promise<any> | null = null;
  let lastTime = 0;

  return {
    shouldThrottle: () =>
      Date.now() - lastTime < CONFIG.THROTTLE_INTERVAL && !!lastRequest,
    setRequest: (req: Promise<any>) => {
      lastTime = Date.now();
      lastRequest = req;
      setTimeout(() => (lastRequest = null), CONFIG.CLEANUP_DELAY);
      return req;
    },
  };
})();

const getUserIdByUsername = async (
  username: string,
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('username', username)
    .single();
  return error ? null : data?.user_id;
};

const getFollowStatus = async (currentUserId: string, authorIds: string[]) => {
  if (!currentUserId || authorIds.length === 0) return {};

  const { data } = await supabase
    .from('user_followers')
    .select('to_user_id')
    .eq('from_user_id', currentUserId)
    .in('to_user_id', authorIds);

  // authorId를 key로 하는 맵 생성
  const followMap: Record<string, boolean> = {};
  authorIds.forEach((id) => (followMap[id] = false));
  data.forEach((follow) => (followMap[follow.to_user_id] = true));

  return followMap;
};

const enrichArticles = async (articles: any[], currentUserId?: string) => {
  if (articles.length === 0) return [];

  // 팔로우 상태를 한 번에 조회
  const authorIds = Array.from(new Set(articles.map((a) => a.author_id)));
  const followMap = currentUserId
    ? await getFollowStatus(currentUserId, authorIds)
    : {};

  return articles.map((article) => {
    // 즐겨찾기 데이터 계산 (이미 조인으로 가져온 데이터 사용)
    const favorited = currentUserId
      ? article.article_favorites?.some((f: any) => f.user_id === currentUserId)
      : false;
    const favorites_count = article.article_favorites?.length || 0;

    // 팔로우 상태 설정
    const following = currentUserId
      ? followMap[article.author_id] || false
      : false;

    return {
      ...article,
      favorited,
      favorites_count,
      tags: article.article_tags?.map((at: any) => at.tags) || [],
      user_profiles: {
        ...article.user_profiles,
        following,
      },
    };
  });
};

const toArticleType = (article: any): ArticleType => ({
  id: article.id,
  title: article.title,
  summary: article.summary,
  content: article.content,
  author_id: article.author_id,
  created_at: article.created_at,
  updated_at: article.updated_at,
  favorited: article.favorited,
  favorites_count: article.favorites_count,
  author: article.user_profiles && {
    username: article.user_profiles.username,
    bio: article.user_profiles.bio,
    image: article.user_profiles.image,
    following: article.user_profiles.following,
  },
  tags: article.tags?.map((t: any) => t.name) || [],
});

const fetchArticles = async (
  query: any,
  page: number,
  limit: number,
  userId?: string,
) => {
  const offset = page * limit;
  const {
    data = [],
    count = 0,
    error,
  } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const enriched = await enrichArticles(data, userId);
  return {
    articles: enriched.map(toArticleType),
    articlesCount: count,
  };
};

const processTags = async (articleId: number, tags: string[]) => {
  await supabase.from('article_tags').delete().eq('article_id', articleId);
  for (const name of tags) {
    try {
      const {
        data: { tag },
      } = await TagAPI.create(name);
      if (tag?.id) {
        await supabase
          .from('article_tags')
          .insert({ article_id: articleId, tag_id: tag.id });
      }
    } catch (e) {
      console.error(`태그 처리 실패: ${name}`, e);
    }
  }
};

const ArticleAPI = {
  all: async (
    page: number,
    limit = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const user = await getCurrentUser();
    const query = supabase
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' });
    const result = await fetchArticles(query, page, limit, user?.id);
    return { data: result, status: 200 };
  },

  byAuthor: async (
    author: string,
    page = 0,
    limit = 5,
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const user = await getCurrentUser();
    const profile = await getUserIdByUsername(author);
    if (!profile)
      return { data: { articles: [], articlesCount: 0 }, status: 200 };
    const query = supabase
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('author_id', profile);
    const result = await fetchArticles(query, page, limit, user?.id);
    return { data: result, status: 200 };
  },

  byTag: async (
    tag: string,
    page = 0,
    limit = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const user = await getCurrentUser();
    const query = supabase
      .from('articles')
      .select(ARTICLE_SELECT_BY_TAG, { count: 'exact' })
      .eq('article_tags.tags.name', tag);

    const result = await fetchArticles(query, page, limit, user?.id);
    return { data: result, status: 200 };
  },

  favoritedBy: async (
    author: string,
    page: number,
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const user = await getCurrentUser();
    const profile = await getUserIdByUsername(author);
    if (!profile)
      return { data: { articles: [], articlesCount: 0 }, status: 200 };

    const query = supabase
      .from('articles')
      .select(ARTICLE_SELECT_FAVORITED, { count: 'exact' })
      .eq('article_favorites.user_id', profile);

    const result = await fetchArticles(
      query,
      page,
      CONFIG.DEFAULT_LIMIT,
      user?.id,
    );
    return { data: result, status: 200 };
  },

  feed: async (
    page: number,
    limit = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('인증되지 않은 사용자입니다.');

    try {
      const query = supabase
        .from('articles')
        .select(ARTICLE_SELECT, { count: 'exact' })
        .eq('author_id', user.id);

      const result = await fetchArticles(query, page, limit, user.id);
      return { data: result, status: 200 };
    } catch (error) {
      console.warn('피드 조회 실패:', error);
      return { data: { articles: [], articlesCount: 0 }, status: 200 };
    }
  },

  get: async (slug: string): Promise<ApiResponse<ArticleResponse>> => {
    const articleId = Number(slug);
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT_DETAIL)
      .eq('id', articleId)
      .single();

    if (error || !data) throw new Error('게시글을 찾을 수 없습니다.');

    const article: ArticleType = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      content: data.content,
      author_id: data.author_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      favorited: false,
      favorites_count: 0,
      author: data.user_profiles && {
        username: data.user_profiles.username,
        bio: data.user_profiles.bio,
        image: data.user_profiles.image,
        following: false,
      },
      tags: data.article_tags?.map((at: any) => at.tags.name) || [],
    };

    return { data: { article }, status: 200 };
  },

  delete: async (slug: string): Promise<ApiResponse<void>> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('인증되지 않은 사용자입니다.');

    const articleId = Number(slug);
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId)
      .eq('author_id', user.id);

    if (error) throw error;
    return { data: undefined, status: 200 };
  },

  favorite: async (slug: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('인증되지 않은 사용자입니다.');
    const articleId = Number(slug);

    const { error } = await supabase
      .from('article_favorites')
      .insert({ article_id: articleId, user_id: user.id });

    if (error && error.code !== '23505') throw error;
    return await ArticleAPI.get(slug);
  },

  unfavorite: async (slug: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('인증되지 않은 사용자입니다.');
    const articleId = Number(slug);

    const { error } = await supabase
      .from('article_favorites')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id);

    if (error) throw error;
    return await ArticleAPI.get(slug);
  },

  update: async (article: Partial<ArticleType>, slug: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('인증되지 않은 사용자입니다.');
    const articleId = Number(slug);

    const { error } = await supabase
      .from('articles')
      .update({
        title: article.title,
        summary: article.summary,
        content: article.content,
      })
      .eq('id', articleId)
      .eq('author_id', user.id);

    if (error) throw error;
    if (article.tags?.length) await processTags(articleId, article.tags);

    return await ArticleAPI.get(slug);
  },

  create: async (articleData: Partial<ArticleType>) => {
    if (throttle.shouldThrottle()) {
      throw {
        message: '요청이 너무 빠릅니다.',
        code: 'TOO_MANY_REQUESTS',
        status: 429,
      };
    }

    const request = (async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('인증되지 않은 사용자입니다.');

      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: articleData.title,
          summary: articleData.summary,
          content: articleData.content,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (articleData.tags?.length)
        await processTags(data.id, articleData.tags);

      return await ArticleAPI.get(data.id.toString());
    })();

    return throttle.setRequest(request);
  },
};

export default ArticleAPI;
