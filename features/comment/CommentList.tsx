import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import Comment from './Comment';
import CommentInput from './CommentInput';
import ErrorMessage from '../../shared/components/ErrorMessage';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

import { CommentType } from '../../lib/types/commentType';
import CommentAPI from '../../lib/api/comment';

const CommentList = () => {
  const router = useRouter();
  const {
    query: { id },
  } = router;

  const { data, error } = useSWR(id ? ['comments', id] : null, () =>
    CommentAPI.forArticle(String(id)),
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  if (error)
    return (
      <ErrorMessage message="Cannot load comments related to this article..." />
    );

  const comments = data?.data?.comments || [];

  return (
    <div>
      <CommentInput />
      {comments.map((comment: CommentType) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
