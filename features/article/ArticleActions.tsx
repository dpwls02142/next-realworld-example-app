import Router, { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';
import { useQueryClient } from '@tanstack/react-query';
import CustomLink from '../../shared/components/CustomLink';
import checkLogin from '../../lib/utils/checkLogin';
import ArticleAPI from '../../lib/api/article';
import { getCurrentUser } from '../../lib/utils/supabase/client';
import Maybe from '../../shared/components/Maybe';

const CONFIRM_DELETE_MESSAGE = `Do you really want to delete it?`;

const ArticleActions = ({ article }) => {
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    query: { id },
  } = router;

  const handleDelete = async () => {
    if (!isLoggedIn) return;

    const result = window.confirm(CONFIRM_DELETE_MESSAGE);
    if (!result) return;

    try {
      await ArticleAPI.delete(id as string);

      await Promise.all([
        queryClient.removeQueries({
          queryKey: ['articles'],
          exact: false,
        }),
      ]);

      Router.push(`/`);
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const isArticleOwner = currentUser?.id === article?.author_id;
  const canManage = isLoggedIn && isArticleOwner;

  return (
    <Maybe test={canManage}>
      <span>
        <CustomLink
          href="/editor/[slug]"
          as={`/editor/${id}`}
          className="btn btn-outline-secondary btn-sm"
        >
          <i className="ion-edit" /> Edit Article
        </CustomLink>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleDelete}
        >
          <i className="ion-trash-a" /> Delete Article
        </button>
      </span>
    </Maybe>
  );
};

export default ArticleActions;
