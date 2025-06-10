import axios from 'axios';

import { SERVER_BASE_URL } from '../utils/constant';

export type ApiError = {
  message: string;
  code: string;
  status?: number;
};

const withToken = (token: string) => ({
  headers: {
    Authorization: `Token ${encodeURIComponent(token)}`,
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error: any): never => {
  if (error.response?.status === 409) {
    const apiError: ApiError = {
      message: '이미 팔로우한 사용자입니다.',
      code: 'ALREADY_FOLLOWING',
      status: 409,
    };
    throw apiError;
  }

  throw error;
};

const UserAPI = {
  current: async () => {
    const user: any = window.localStorage.getItem('user');
    const token = user?.token;
    try {
      const response = await axios.get(`/user`, withToken(token));
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${SERVER_BASE_URL}/users/login`,
        JSON.stringify({ user: { email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        `${SERVER_BASE_URL}/users`,
        JSON.stringify({ user: { username, email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  save: async (user: any) => {
    try {
      const response = await axios.put(
        `${SERVER_BASE_URL}/user`,
        JSON.stringify({ user }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  follow: async (username: string) => {
    const user: any = JSON.parse(window.localStorage.getItem('user'));
    const token = user?.token;
    try {
      const response = await axios.post(
        `${SERVER_BASE_URL}/profiles/${username}/follow`,
        {},
        withToken(token),
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  unfollow: async (username: string) => {
    const user: any = JSON.parse(window.localStorage.getItem('user'));
    const token = user?.token;
    try {
      const response = await axios.delete(
        `${SERVER_BASE_URL}/profiles/${username}/follow`,
        withToken(token),
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
  get: async (username: string) => {
    try {
      const response = await axios.get(
        `${SERVER_BASE_URL}/profiles/${username}`,
      );
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default UserAPI;
