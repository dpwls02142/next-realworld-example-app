import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { trigger } from 'swr';

import { SERVER_BASE_URL } from '../../lib/utils/constant';
import CommentAPI from '../../lib/api/comment';

const DeleteButton = ({ commentId }: { commentId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  const {
    query: { slug },
  } = router;

  useEffect(() => {
    if (!isDeleting) return;

    if (countdown === 0) {
      CommentAPI.delete(slug as string, commentId).then(() => {
        trigger(`${SERVER_BASE_URL}/articles/${slug}/comments`);
        setIsDeleting(false);
      });
      return;
    }

    const commentDeleteTimer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(commentDeleteTimer);
  }, [isDeleting, countdown, slug, commentId]);

  function DeleteComment() {
    setIsDeleting(true);
    setCountdown(5);
  }

  function DeleteCancel() {
    setIsDeleting(false);
    setCountdown(5);
  }

  return (
    <span className="mod-options">
      {!isDeleting ? (
        <i className="ion-trash-a" onClick={DeleteComment} />
      ) : (
        <div>
          <span>{countdown}초 후 삭제</span>
          <i className="ion-arrow-return-left" onClick={DeleteCancel} />
        </div>
      )}
    </span>
  );
};

export default DeleteButton;
