import axios from 'axios';

import { SERVER_BASE_URL } from '../utils/constant';
import storage from '../utils/storage';

const getAuthHeader = async () => {
  const currentUser = await storage('user');
  return {
    Authorization: `Token ${currentUser?.token}`,
  };
};

const CommentAPI = {
  create: async (slug: string, comment: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_BASE_URL}/articles/${slug}/comments`,
        JSON.stringify({ comment }),
        { headers },
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  delete: async (slug: string, commentId: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.delete(
        `${SERVER_BASE_URL}/articles/${slug}/comments/${commentId}`,
        { headers },
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },

  forArticle: async (slug: string) => {
    const headers = await getAuthHeader();
    return axios.get(`${SERVER_BASE_URL}/articles/${slug}/comments`, {
      headers,
    });
  },
};

export default CommentAPI;
