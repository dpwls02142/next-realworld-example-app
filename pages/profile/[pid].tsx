import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import ArticleList from '../../features/article/ArticleList';
import CustomImage from '../../shared/components/CustomImage';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Maybe from '../../shared/components/Maybe';
import EditProfileButton from '../../features/profile/EditProfileButton';
import FollowUserButton from '../../features/profile/FollowUserButton';
import ProfileTab from '../../features/profile/ProfileTab';
import UserAPI from '../../lib/api/user';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import { useFollowersCount } from '../../lib/hooks/useFollow';

function Profile({ initialProfile }) {
  const router = useRouter();
  const {
    query: { pid },
  } = router;
  const decodedUsername = decodeURIComponent(String(pid));

  const { data: fetchedProfile, error: profileError } = useSWR(
    ['profile', decodedUsername],
    () => UserAPI.get(decodedUsername),
    { initialData: initialProfile },
  );

  if (profileError) return <ErrorMessage message="Can't load profile" />;

  const profile =
    fetchedProfile?.data?.profile || initialProfile?.data?.profile;

  const { user_id, username, bio, image, following } = profile;

  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const isUser =
    currentUser && username === currentUser?.user_metadata?.username;

  const { data: followersCount } = useFollowersCount(user_id);

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <CustomImage
                src={image}
                alt="User's profile image"
                className="user-img"
              />
              <h4>{username}</h4>
              <p>{bio}</p>
              <div className="profile-stats">
                <span className="followers-count">
                  팔로워 {followersCount || 0}명
                </span>
              </div>
              <EditProfileButton isUser={isUser} />
              <Maybe test={isLoggedIn}>
                <FollowUserButton
                  isUser={isUser}
                  username={username}
                  following={following}
                />
              </Maybe>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ProfileTab profile={profile} />
            </div>
            <ArticleList />
          </div>
        </div>
      </div>
    </div>
  );
}

Profile.getInitialProps = async ({ query }) => {
  const { pid } = query;
  try {
    const decodedUsername = decodeURIComponent(String(pid));
    const result = await UserAPI.get(decodedUsername);
    return { initialProfile: result };
  } catch (error) {
    console.error('Profile fetch error:', error);
  }
};

export default Profile;
