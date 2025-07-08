import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import ArticleList from '../../features/article/ArticleList';
import CustomImage from '../../shared/components/CustomImage';
import Maybe from '../../shared/components/Maybe';
import EditProfileButton from '../../features/profile/EditProfileButton';
import FollowUserButton from '../../features/profile/FollowUserButton';
import ProfileTab from '../../features/profile/ProfileTab';
import UserAPI from '../../lib/api/user';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import { useFollowersCountByUserId } from '../../lib/hooks/useFollow';

function Profile({ profile }) {
  const { user_id, username, bio, image } = profile;

  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const isLoggedinUser =
    currentUser && username === currentUser?.user_metadata?.username;

  const { data: followersCount } = useFollowersCountByUserId(user_id);

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
              <EditProfileButton isUser={isLoggedinUser} />
              <Maybe test={isLoggedIn}>
                <FollowUserButton isUser={isLoggedinUser} username={username} />
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

export async function getServerSideProps({ query, res }) {
  const { pid } = query;
  try {
    const {
      data: { profile },
    } = await UserAPI.get(String(pid));
    return {
      props: {
        profile: profile,
      },
    };
  } catch (error) {
    res.writeHead(302, { Location: '/404' });
    res.end();
    return { props: {} };
  }
}

export default Profile;
