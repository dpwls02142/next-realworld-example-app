import {
  supabase,
  getCurrentUser,
  getUserProfile,
  upsertUserProfile,
} from '../utils/supabase/client';

const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }
  return user;
};

const checkFollowStatus = async (
  currentUserId: string,
  targetUserId: string,
) => {
  try {
    const { data: followData } = await supabase
      .from('user_followers')
      .select('id')
      .eq('from_user_id', currentUserId)
      .eq('to_user_id', targetUserId)
      .single();

    return !!followData;
  } catch (error) {
    console.warn('팔로우 상태 확인 실패:', error);
    return false;
  }
};

const UserAPI = {
  current: async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('인증되지 않은 사용자입니다.');
      }

      return {
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            bio: user.bio,
            image: user.image,
            token: 'supabase_session',
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('로그인에 실패했습니다.');

      const profile = await getUserProfile(data.user.id);

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            token: 'supabase_session',
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) throw error;
      if (!data.user) throw new Error('회원가입에 실패했습니다.');

      const profile = await upsertUserProfile({
        user_id: data.user.id,
        username,
        bio: '',
        image: null,
      });

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            token: 'supabase_session',
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  save: async (userData: any) => {
    try {
      const user = await requireAuth();

      const { data: currentProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const profileUpdates: any = { user_id: user.id };
      let hasProfileChanges = false;

      if (userData.username && userData.username !== currentProfile?.username) {
        profileUpdates.username = userData.username;
        hasProfileChanges = true;
      } else if (currentProfile?.username) {
        profileUpdates.username = currentProfile.username;
      }

      if (userData.bio !== undefined && userData.bio !== currentProfile?.bio) {
        profileUpdates.bio = userData.bio || '';
        hasProfileChanges = true;
      } else if (currentProfile?.bio !== undefined) {
        profileUpdates.bio = currentProfile.bio;
      }

      if (
        userData.image !== undefined &&
        userData.image !== currentProfile?.image
      ) {
        profileUpdates.image = userData.image || null;
        hasProfileChanges = true;
      } else if (currentProfile?.image !== undefined) {
        profileUpdates.image = currentProfile.image;
      }

      let profile = currentProfile;

      if (hasProfileChanges || !currentProfile) {
        profile = await upsertUserProfile(profileUpdates);
      }

      if (userData.email && userData.email !== user.email) {
        const { error } = await supabase.auth.updateUser({
          email: userData.email,
        });
        if (error) throw error;
      }

      if (userData.password && userData.password.trim() !== '') {
        const { error } = await supabase.auth.updateUser({
          password: userData.password,
        });
        if (error) throw error;
      }

      return {
        data: {
          user: {
            id: user.id,
            email: userData.email || user.email,
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            token: 'supabase_session',
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  follow: async (username: string) => {
    try {
      const user = await requireAuth();

      const { data: targetProfile, error: findError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', username)
        .single();

      if (findError || !targetProfile) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const { error } = await supabase.from('user_followers').insert({
        from_user_id: user.id,
        to_user_id: targetProfile.user_id,
      });

      if (error) {
        if (error.code === '23505') {
          console.warn('이미 팔로우한 사용자입니다.');
        } else {
          console.warn('팔로우 실패:', error);
          throw new Error('팔로우에 실패했습니다.');
        }
      }

      return {
        data: {
          profile: {
            username,
            following: true,
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  unfollow: async (username: string) => {
    try {
      const user = await requireAuth();

      const { data: targetProfile, error: findError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', username)
        .single();

      if (findError || !targetProfile) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetProfile.user_id);

      if (error) {
        console.warn('언팔로우 실패:', error);
        throw new Error('언팔로우에 실패했습니다.');
      }

      return {
        data: {
          profile: {
            username,
            following: false,
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  get: async (username: string) => {
    try {
      const currentUser = await getCurrentUser();

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !profile) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      let following = false;
      // 자기 자신의 프로필이 아닌 경우에만 팔로우 상태 확인
      if (currentUser && currentUser.id !== profile.user_id) {
        following = await checkFollowStatus(currentUser.id, profile.user_id);
      }

      return {
        data: {
          profile: {
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            following,
          },
        },
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return {
        data: {},
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default UserAPI;
