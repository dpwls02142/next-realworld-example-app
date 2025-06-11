import Router, { useRouter } from 'next/router';
import React from 'react';
import useSWR, { trigger } from 'swr';

import CustomLink from '../../shared/components/CustomLink';
import checkLogin from '../../lib/utils/checkLogin';
import ArticleAPI from '../../lib/api/article';
import { SERVER_BASE_URL } from '../../lib/utils/constant';
import storage from '../../lib/utils/storage';
import Maybe from '../../shared/components/Maybe';

const CONFIRM_DELETE_MESSAGE = `Do you really want to delete it?`;

const ArticleActions = ({ article }) => {
  const { data: currentUser } = useSWR('user', storage);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { slug },
  } = router;

  const handleDelete = async () => {
    if (!isLoggedIn) return;

    const result = window.confirm(CONFIRM_DELETE_MESSAGE);

    if (!result) return;

    await ArticleAPI.delete(slug as string, currentUser?.token);
    trigger(`${SERVER_BASE_URL}/articles/${slug}`);
    Router.push(`/`);
  };

  const isArticleOwner = currentUser?.username === article?.author?.username;
  const canManage = isLoggedIn && isArticleOwner;

  return (
    <Maybe test={canManage}>
      <span>
        <CustomLink
          href="/editor/[slug]"
          as={`/editor/${slug}`}
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
