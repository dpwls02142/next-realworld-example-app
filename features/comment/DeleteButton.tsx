import { useRouter } from 'next/router';
import { trigger } from 'swr';

import { SERVER_BASE_URL } from '../../lib/utils/constant';
import CommentAPI from '../../lib/api/comment';

const DeleteButton = ({ commentId }: { commentId: string }) => {
  const router = useRouter();
  const {
    query: { slug },
  } = router;

  const handleDelete = async (commentId: string) => {
    await CommentAPI.delete(slug as string, commentId);
    trigger(`${SERVER_BASE_URL}/articles/${slug}/comments`);
  };

  return (
    <span className="mod-options">
      <i className="ion-trash-a" onClick={() => handleDelete(commentId)} />
    </span>
  );
};

export default DeleteButton;
