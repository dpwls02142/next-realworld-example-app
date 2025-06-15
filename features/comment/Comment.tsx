import React from 'react';
import useSWR from 'swr';

import CustomLink from '../../shared/components/CustomLink';
import CustomImage from '../../shared/components/CustomImage';
import Maybe from '../../shared/components/Maybe';
import DeleteButton from './DeleteButton';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';

const Comment = ({ comment }) => {
  const { data: currentUser } = useSWR('user', getCurrentUser);

  const isLoggedIn = checkLogin(currentUser);

  const isCommentOwner = currentUser?.id === comment?.author_id;
  const canManage = isLoggedIn && isCommentOwner;

  return (
    <div className="card">
      <div className="card-block">
        <p className="card-text">{comment.content}</p>
      </div>
      <div className="card-footer">
        <CustomLink
          href="/profile/[pid]"
          as={`/profile/${comment.user_profiles.username}`}
          className="comment-author"
        >
          <CustomImage
            src={comment.user_profiles.image}
            alt="Comment author's profile image"
            className="comment-author-img"
          />
        </CustomLink>
        &nbsp;
        <CustomLink
          href="/profile/[pid]"
          as={`/profile/${comment.user_profiles.username}`}
          className="comment-author"
        >
          {comment.user_profiles.username}
        </CustomLink>
        <span className="date-posted">
          {new Date(comment.created_at).toDateString()}
        </span>
        <Maybe test={canManage}>
          <DeleteButton commentId={comment.id} />
        </Maybe>
      </div>
    </div>
  );
};

export default Comment;
