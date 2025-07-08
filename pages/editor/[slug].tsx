import { useState } from 'react';
import Router from 'next/router';
import { cache, mutate } from 'swr';

import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';

function EditArticlePage({ article }) {
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (editData: ArticleInput) => {
    setLoading(true);

    try {
      const response = await ArticleAPI.update(editData, article.id.toString());

      if (response.status === 200 || response.status === 201) {
        // 게시글 수정 후 관련 캐시 무효화
        const cacheMap = cache;
        const keysToInvalidate = [];

        for (const key of cacheMap.keys()) {
          if (Array.isArray(key) && key[0] === 'articles') {
            keysToInvalidate.push(key);
          }
        }

        await Promise.all(
          keysToInvalidate.map((key) => mutate(key, undefined, true)),
        );

        Router.push('/');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-page container page">
      <div className="row">
        <div className="col-md-10 offset-md-1 col-xs-12">
          <EditorForm
            initialValues={article}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            submitLabel="Update Article"
          />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { slug } = query;
  try {
    const {
      data: { article },
    } = await ArticleAPI.get(slug);

    return {
      props: {
        article: article,
      },
    };
  } catch (error) {
    return { props: {} };
  }
}

export default EditArticlePage;
