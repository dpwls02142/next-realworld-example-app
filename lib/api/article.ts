import axios from "axios";
import { SERVER_BASE_URL } from "../utils/constant";
import { getQuery } from "../utils/getQuery";

const article = `${SERVER_BASE_URL}/articles`;
const withSlug = (slug) => `${article}/${encodeURIComponent(slug)}`;
const withToken = (token) => ({
  headers: {
    Authorization: `Token ${encodeURIComponent(token)}`,
    "Content-Type": "application/json",
  },
});

const ArticleAPI = {
  all: (page, limit = 10) =>
    axios.get(`${article}?${getQuery(limit, page)}`),

  byAuthor: (author, page = 0, limit = 5) =>
    axios.get(`${article}?author=${encodeURIComponent(author)}&${getQuery(limit, page)}`),

  byTag: (tag, page = 0, limit = 10) =>
    axios.get(`${article}?tag=${encodeURIComponent(tag)}&${getQuery(limit, page)}`),

  delete: (slug, token) =>
    axios.delete(withSlug(slug), {
      headers: {
        Authorization: `Token ${encodeURIComponent(token)}`,
      },
    }),

  favorite: (slug) =>
    axios.post(`${withSlug(slug)}/favorite`),

  favoritedBy: (author, page) =>
    axios.get(`${article}?favorited=${encodeURIComponent(author)}&${getQuery(10, page)}`),

  feed: (page, limit = 10) =>
    axios.get(`${article}/feed?${getQuery(limit, page)}`),

  get: (slug) =>
    axios.get(withSlug(slug)),

  unfavorite: (slug) =>
    axios.delete(`${withSlug(slug)}/favorite`),

  update: async (article, token) => {
    const { data, status } = await axios.put(
      withSlug(article.slug),
      JSON.stringify({ article }),
      withToken(token)
    );
    return { data, status };
  },

  create: async (articleData, token) => {
    try {
      const { data, status } = await axios.post(
        article,
        JSON.stringify({ article: articleData }),
        withToken(token)
      );
      return { data, status };
    } catch (error) {
      if (error.response) {
        console.log("400 에러:", error.response.data);
      } else {
        console.log("기타 에러:", error.message);
      }
      throw error;
    }
  },
}

export default ArticleAPI;
