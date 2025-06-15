import axios from 'axios';
import { supabase } from './supabase/client';

const updateOptions = async () => {
  if (typeof window === 'undefined') return {};

  // Supabase 세션에서 토큰 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    };
  }

  return {};
};

export default async function (url) {
  const options = await updateOptions();
  const { data } = await axios.get(url, options);
  return data;
}
