import axios from 'axios';

import { SERVER_BASE_URL } from '../utils/constant';
import { Author } from '../types/authorType';

const user = `${SERVER_BASE_URL}/user`;

const getToken = () => {
  if (typeof window === 'undefined') return null;

  const userData = window.localStorage.getItem('user');
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      return parsedUser.token;
    } catch {
      return null;
    }
  }
  return null;
};

const withToken = (token: string | null) => {
  if (!token) return {};
  return {
    headers: {
      Authorization: `Token ${encodeURIComponent(token)}`,
    },
  };
};

const UserAPI = {
  current: async () => {
    const token = getToken();
    try {
      const response = await axios.get(`${user}`, withToken(token));
      return response;
    } catch (error) {
      return error.response;
    }
  },
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${user}/login`,
        JSON.stringify({ user: { email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        `${user}`,
        JSON.stringify({ user: { username, email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  save: async (userData: Author) => {
    const token = getToken();
    try {
      const response = await axios.put(
        `${user}`,
        JSON.stringify({ user: userData }),
        {
          ...withToken(token),
          headers: {
            ...withToken(token).headers,
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  follow: async (username: string) => {
    const token = getToken();
    try {
      const response = await axios.post(
        `${SERVER_BASE_URL}/profiles/${username}/follow`,
        {},
        withToken(token),
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  unfollow: async (username: string) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `${SERVER_BASE_URL}/profiles/${username}/follow`,
        withToken(token),
      );
      return response;
    } catch (error) {
      return error.response;
    }
  },
  get: async (username: string) => {
    const token = getToken();
    return axios.get(
      `${SERVER_BASE_URL}/profiles/${username}`,
      withToken(token),
    );
  },
};

export default UserAPI;
