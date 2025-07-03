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

export const getCurrentUser = async () => {
  const serverClient = createClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  return user;
};

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

export const getCurrentUserWithProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const profile = await getUserProfile(user.id);
    return {
      id: user.id,
      email: user.email,
      username: profile.username,
      bio: profile.bio,
      image: profile.image,
    };
  } catch (error) {
    console.error('Profile not found:', error);
    return null;
  }
};
