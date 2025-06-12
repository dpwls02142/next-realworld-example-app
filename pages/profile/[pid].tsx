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
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import fetcher from '../../lib/utils/fetcher';
import storage from '../../lib/utils/storage';

function Profile({ initialProfile }) {
  const router = useRouter();
  const {
    query: { pid },
  } = router;
  const encodedUsername = encodeURIComponent(String(pid));

  const { data: fetchedProfile, error: profileError } = useSWR(
    `${SERVER_BASE_URL}/profiles/${encodedUsername}`,
    fetcher,
    { initialData: initialProfile },
  );

  if (profileError) return <ErrorMessage message="Can't load profile" />;

  const { profile } = fetchedProfile || initialProfile;
  const { username, bio, image, following } = profile;

  const { data: currentUser } = useSWR('user', storage);
  const isLoggedIn = checkLogin(currentUser);
  const isUser = currentUser && username === currentUser?.username;

  async function handleFollow() {
    mutate(
      `${SERVER_BASE_URL}/profiles/${encodedUsername}`,
      { profile: { ...profile, following: true } },
      false,
    );
    await UserAPI.follow(pid as string);
    trigger(`${SERVER_BASE_URL}/profiles/${encodedUsername}`);
  }

  async function handleUnfollow() {
    mutate(
      `${SERVER_BASE_URL}/profiles/${encodedUsername}`,
      { profile: { ...profile, following: false } },
      false,
    );
    await UserAPI.unfollow(pid as string);
    trigger(`${SERVER_BASE_URL}/profiles/${encodedUsername}`);
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

Profile.getInitialProps = async ({ query: { pid } }) => {
  const { data: initialProfile } = await UserAPI.get(pid);
  return { initialProfile };
};

export default Profile;
