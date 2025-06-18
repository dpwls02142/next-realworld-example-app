import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import useSWR, { trigger } from 'swr';

import CustomImage from '../../shared/components/CustomImage';
import CustomLink from '../../shared/components/CustomLink';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import CommentAPI from '../../lib/api/comment';

const CommentInput = () => {
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { id },
  } = router;

  const [content, setContent] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CommentAPI.create(String(id), content);
      setContent('');
      trigger(['comments', id]);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <p>
        <CustomLink href="/user/login" as="/user/login">
          Sign in
        </CustomLink>
        &nbsp;or&nbsp;
        <CustomLink href="/user/register" as="/user/register">
          sign up
        </CustomLink>
        &nbsp;to add comments on this article.
      </p>
    );
  }

  return (
    <form className="card comment-form" onSubmit={handleSubmit}>
      <div className="card-block">
        <textarea
          className="form-control"
          placeholder="Write a comment..."
          rows={3}
          value={content}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      <div className="card-footer">
        <CustomImage
          src={currentUser?.user_metadata?.image}
          alt="Comment author's profile image"
          className="comment-author-img"
        />
        <button
          className="btn btn-sm btn-primary"
          type="submit"
          disabled={isLoading}
        >
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentInput;
