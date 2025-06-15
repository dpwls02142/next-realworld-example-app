import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  );

export const supabase = createClient();

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    // 사용자 프로필 정보도 함께 가져오기
    const profile = await getUserProfile(user.id);
    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
      },
      username: profile.username,
      bio: profile.bio,
      image: profile.image,
    };
  } catch (error) {
    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        username: user.user_metadata?.username || '',
        bio: '',
        image: '',
      },
      username: user.user_metadata?.username || '',
      bio: '',
      image: '',
    };
  }
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// 사용자 프로필 생성 또는 업데이트
export const upsertUserProfile = async (profile: {
  user_id: string;
  username: string;
  bio?: string;
  image?: string;
}) => {
  try {
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    const isUsernameChanged =
      !existingProfile || existingProfile.username !== profile.username;

    if (isUsernameChanged) {
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from('user_profiles')
        .select('user_id, username')
        .eq('username', profile.username)
        .neq('user_id', profile.user_id)
        .maybeSingle();

      if (!duplicateError && duplicateCheck) {
        const error: any = new Error('이미 존재하는 사용자명입니다.');
        error.code = 'DUPLICATE_USERNAME';
        error.constraint = 'username';
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    return data;
  } catch (error) {
    console.error('upsertUserProfile error:', error);
    throw error;
  }
};
