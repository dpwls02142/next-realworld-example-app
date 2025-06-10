import axios from 'axios';
import { SERVER_BASE_URL } from '../utils/constant';
import { getQuery } from '../utils/getQuery';
import { ArticleType } from '../types/articleType';

const article = `${SERVER_BASE_URL}/articles`;
const withSlug = (slug: string) => `${article}/${encodeURIComponent(slug)}`;
const withToken = (token: string) => ({
  headers: {
    Authorization: `Token ${encodeURIComponent(token)}`,
    'Content-Type': 'application/json',
  },
});

const ArticleAPI = {
  all: (page: number, limit: number = 10) =>
    axios.get(`${article}?${getQuery(limit, page)}`),

  byAuthor: (author: string, page: number = 0, limit: number = 5) =>
    axios.get(
      `${article}?author=${encodeURIComponent(author)}&${getQuery(limit, page)}`,
    ),

  byTag: (tag: string, page: number = 0, limit: number = 10) =>
    axios.get(
      `${article}?tag=${encodeURIComponent(tag)}&${getQuery(limit, page)}`,
    ),

  delete: (slug: string, token: string) =>
    axios.delete(withSlug(slug), {
      headers: {
        Authorization: `Token ${encodeURIComponent(token)}`,
      },
    }),

  favorite: (slug: string) => axios.post(`${withSlug(slug)}/favorite`),

  favoritedBy: (author: string, page: number) =>
    axios.get(
      `${article}?favorited=${encodeURIComponent(author)}&${getQuery(10, page)}`,
    ),

  feed: (page: number, limit: number = 10) =>
    axios.get(`${article}/feed?${getQuery(limit, page)}`),

  get: (slug: string) => axios.get(withSlug(slug)),

  unfavorite: (slug: string) => axios.delete(`${withSlug(slug)}/favorite`),

  update: async (article: ArticleType, token: string) => {
    const { data, status } = await axios.put(
      withSlug(article.slug),
      JSON.stringify({ article }),
      withToken(token),
    );
    return { data, status };
  },

  create: async (articleData: Partial<ArticleType>, token: string) => {
    const { data, status } = await axios.post(
      article,
      JSON.stringify({ article: articleData }),
      withToken(token),
    );
    return { data, status };
  },
};

export default ArticleAPI;
