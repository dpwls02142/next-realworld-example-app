import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

export const getIsLogin = async () => {
  const serverClient = createClient();
  const {
    data: { session },
  } = await serverClient.auth.getSession();
  return !!session;
};

// 서버에서 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  const serverClient = createClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  return user;
};

// 서버에서 사용자 프로필 정보 가져오기
export const getUserProfile = async (userId: string) => {
  const serverClient = createClient();
  const { data, error } = await serverClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getArticles = async (offset = 0, limit = 10) => {
  const { data, error } = await createClient()
    .from('articles')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getArticleById = async (id: string) => {
  const { data, error } = await createClient()
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 태그 관련 함수들
export const getTags = async () => {
  const { data, error } = await createClient()
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const getTagById = async (id: string) => {
  const { data, error } = await createClient()
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
