import React from 'react';
import { useFollowMutation } from '../../lib/hooks/useFollow';
import { useQuery } from '@tanstack/react-query';
import UserAPI from 'lib/api/user';

type FollowUserButtonProps = {
  isUser: boolean;
  username: string;
};

const FollowUserButton = ({ isUser, username }: FollowUserButtonProps) => {
  const followMutation = useFollowMutation();

  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => UserAPI.get(username),
  });

  if (isUser) {
    return null;
  }

  const isFollowing = profile?.data?.profile?.following || false;

  const handleClick = (e) => {
    e.preventDefault();

    followMutation.mutate({
      username,
      isFollowing,
    });
  };

  return (
    <button
      className={`btn btn-sm action-btn ${
        isFollowing ? 'btn-secondary' : 'btn-outline-secondary'
      }`}
      onClick={handleClick}
      disabled={followMutation.isLoading}
    >
      <i className="ion-plus-round" />
      &nbsp;
      {followMutation.isLoading
        ? isFollowing
          ? 'Unfollowing...'
          : 'Following...'
        : isFollowing
          ? 'Unfollow'
          : 'Follow'}{' '}
      {username}
    </button>
  );
};

export default FollowUserButton;
