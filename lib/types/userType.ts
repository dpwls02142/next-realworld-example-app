export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  bio: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
  };
}

export interface AuthUser {
  user: User;
  profile: UserProfile;
}

export interface FollowRelation {
  id: number;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}
