import React, { useState } from 'react';
import { useFollowMutation } from '../../lib/hooks/useFollow';

const FollowUserButton = ({ isUser, following, username }) => {
  const [isFollowing, setIsFollowing] = useState(following);
  const followMutation = useFollowMutation();

  if (isUser) {
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();

    const currentFollowingState = isFollowing;
    setIsFollowing(!currentFollowingState);
    followMutation.mutate(
      {
        username,
        isFollowing: currentFollowingState,
      },
      {
        onError: () => {
          setIsFollowing(currentFollowingState);
        },
      },
    );
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
