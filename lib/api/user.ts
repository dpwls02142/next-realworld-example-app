import axios from 'axios';

import { SERVER_BASE_URL } from '../utils/constant';

const withToken = (token: string) => ({
  headers: {
    Authorization: `Token ${encodeURIComponent(token)}`,
    'Content-Type': 'application/json',
  },
});

const UserAPI = {
  current: async () => {
    const user: any = window.localStorage.getItem('user');
    const token = user?.token;
    try {
      const response = await axios.get(`/user`, withToken(token));
      return response;
    } catch (error) {
      return error.response;
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
      return error.response;
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
      return error.response;
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
      return error.response;
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
      return error.response;
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
      return error.response;
    }
  },
  get: async (username: string) =>
    axios.get(`${SERVER_BASE_URL}/profiles/${username}`),
};

export default UserAPI;
