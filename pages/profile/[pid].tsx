import { useRouter } from 'next/router';
import React from 'react';
import useSWR, { mutate, trigger } from 'swr';

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

  const { username, bio, image, following } = profile;

  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const isUser =
    currentUser && username === currentUser?.user_metadata?.username;

  async function handleFollow() {
    mutate(
      ['profile', decodedUsername],
      { data: { profile: { ...profile, following: true } } },
      false,
    );
    await UserAPI.follow(decodedUsername);
    trigger(['profile', decodedUsername]);
  }

  async function handleUnfollow() {
    mutate(
      ['profile', decodedUsername],
      { data: { profile: { ...profile, following: false } } },
      false,
    );
    await UserAPI.unfollow(decodedUsername);
    trigger(['profile', decodedUsername]);
  }

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
              <EditProfileButton isUser={isUser} />
              <Maybe test={isLoggedIn}>
                <FollowUserButton
                  isUser={isUser}
                  username={username}
                  following={following}
                  follow={handleFollow}
                  unfollow={handleUnfollow}
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
