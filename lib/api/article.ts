import axios from 'axios';
import { SERVER_BASE_URL } from '../utils/constant';
import { getQuery } from '../utils/getQuery';
import {
  ArticleType,
  ArticleResponse,
  ArticleListResponse,
} from '../types/articleType';

const CONFIG = {
  THROTTLE_INTERVAL: 3000,
  CLEANUP_DELAY: 5000,
  DEFAULT_LIMIT: 10,
} as const;

type ApiResponse<T = any> = {
  data: T;
  status: number;
};

export type ApiError = {
  message: string;
  code: string;
  status?: number;
};

const article = `${SERVER_BASE_URL}/articles`;
const withSlug = (slug: string) => `${article}/${encodeURIComponent(slug)}`;
const withToken = (token: string) => ({
  headers: {
    Authorization: `Token ${encodeURIComponent(token)}`,
    'Content-Type': 'application/json',
  },
});

const createRequestThrottler = (() => {
  let lastRequest: Promise<any> | null = null;
  let lastTime = 0;

  return {
    shouldThrottle: (interval: number = CONFIG.THROTTLE_INTERVAL): boolean => {
      const now = Date.now();
      return now - lastTime < interval && lastRequest !== null;
    },

    getLastRequest: (): Promise<any> | null => lastRequest,

    setRequest: (request: Promise<any>): Promise<any> => {
      lastTime = Date.now();
      lastRequest = request;

      setTimeout(() => {
        lastRequest = null;
      }, CONFIG.CLEANUP_DELAY);

      return request;
    },

    clear: (): void => {
      lastRequest = null;
    },
  };
})();

const handleApiError = (error: any): never => {
  if (error.response?.status === 409) {
    const apiError: ApiError = {
      message:
        '아티클 생성에 실패했습니다. 제목을 변경하거나 잠시 후 다시 시도해주세요.',
      code: 'DUPLICATE_ARTICLE',
      status: 409,
    };
    throw apiError;
  }

  throw error;
};

const ArticleAPI = {
  all: (
    page: number,
    limit: number = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> =>
    axios.get(`${article}?${getQuery(limit, page)}`),

  byAuthor: (
    author: string,
    page: number = 0,
    limit: number = 5,
  ): Promise<ApiResponse<ArticleListResponse>> =>
    axios.get(
      `${article}?author=${encodeURIComponent(author)}&${getQuery(limit, page)}`,
    ),

  byTag: (
    tag: string,
    page: number = 0,
    limit: number = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> =>
    axios.get(
      `${article}?tag=${encodeURIComponent(tag)}&${getQuery(limit, page)}`,
    ),

  delete: (slug: string, token: string): Promise<ApiResponse<void>> =>
    axios.delete(withSlug(slug), withToken(token)),

  favorite: (
    slug: string,
    token: string,
  ): Promise<ApiResponse<ArticleResponse>> =>
    axios.post(`${withSlug(slug)}/favorite`, {}, withToken(token)),

  favoritedBy: (
    author: string,
    page: number,
  ): Promise<ApiResponse<ArticleListResponse>> =>
    axios.get(
      `${article}?favorited=${encodeURIComponent(author)}&${getQuery(CONFIG.DEFAULT_LIMIT, page)}`,
    ),

  feed: (
    page: number,
    token: string,
    limit: number = CONFIG.DEFAULT_LIMIT,
  ): Promise<ApiResponse<ArticleListResponse>> =>
    axios.get(`${article}/feed?${getQuery(limit, page)}`, withToken(token)),

  get: (slug: string): Promise<ApiResponse<ArticleResponse>> =>
    axios.get(withSlug(slug)),

  unfavorite: (
    slug: string,
    token: string,
  ): Promise<ApiResponse<ArticleResponse>> =>
    axios.delete(`${withSlug(slug)}/favorite`, withToken(token)),

  update: async (
    article: ArticleType,
    token: string,
  ): Promise<ApiResponse<ArticleResponse>> => {
    try {
      const { data, status } = await axios.put(
        withSlug(article.slug),
        JSON.stringify({ article }),
        withToken(token),
      );
      return { data, status };
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (
    articleData: Partial<ArticleType>,
    token: string,
  ): Promise<ApiResponse<ArticleResponse>> => {
    if (createRequestThrottler.shouldThrottle()) {
      const throttleError: ApiError = {
        message: '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.',
        code: 'TOO_MANY_REQUESTS',
        status: 429,
      };
      throw throttleError;
    }

    const request = (async (): Promise<ApiResponse<ArticleResponse>> => {
      try {
        const { data, status } = await axios.post(
          article,
          JSON.stringify({ article: articleData }),
          withToken(token),
        );
        return { data, status };
      } catch (error) {
        handleApiError(error);
      }
    })();

    return createRequestThrottler.setRequest(request);
  },
};

export default ArticleAPI;
