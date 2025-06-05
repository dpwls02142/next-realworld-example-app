import axios from "axios";

import { SERVER_BASE_URL } from "../utils/constant";
import { getQuery } from "../utils/getQuery";

const ArticleAPI = {
  all: (page, limit = 10) =>
    axios.get(`${SERVER_BASE_URL}/articles?${getQuery(limit, page)}`),

  byAuthor: (author, page = 0, limit = 5) =>
    axios.get(
      `${SERVER_BASE_URL}/articles?author=${encodeURIComponent(
        author
      )}&${getQuery(limit, page)}`
    ),

  byTag: (tag, page = 0, limit = 10) =>
    axios.get(
      `${SERVER_BASE_URL}/articles?tag=${encodeURIComponent(tag)}&${getQuery(
        limit,
        page
      )}`
    ),

  delete: (id, token) =>
    axios.delete(`${SERVER_BASE_URL}/articles/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    }),

  favorite: (slug) =>
    axios.post(`${SERVER_BASE_URL}/articles/${slug}/favorite`),

  favoritedBy: (author, page) =>
    axios.get(
      `${SERVER_BASE_URL}/articles?favorited=${encodeURIComponent(
        author
      )}&${getQuery(10, page)}`
    ),

  feed: (page, limit = 10) =>
    axios.get(`${SERVER_BASE_URL}/articles/feed?${getQuery(limit, page)}`),

  get: (slug) => axios.get(`${SERVER_BASE_URL}/articles/${slug}`),

  unfavorite: (slug) =>
    axios.delete(`${SERVER_BASE_URL}/articles/${slug}/favorite`),

  update: async (article, token) => {
    const { data, status } = await axios.put(
      `${SERVER_BASE_URL}/articles/${article.slug}`,
      JSON.stringify({ article }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${encodeURIComponent(token)}`,
        },
      }
    );
    return {
      data,
      status,
    };
  },

  create: async (article, token) => {
    try {
      const { data, status } = await axios.post(
        `${SERVER_BASE_URL}/articles`,
        JSON.stringify({ article }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${encodeURIComponent(token)}`,
          },
        }
      );
      return {
        data,
        status,
      };
    } catch (error) {
      if (error.response) {
        console.log("400 에러:", error.response.data);
      } else {
        console.log("기타 에러:", error.message);
      }
      throw error;
    }
  },

};

export default ArticleAPI;
