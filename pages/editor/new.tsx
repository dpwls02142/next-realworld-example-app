import { useState } from 'react';
import Router from 'next/router';
import { cache, mutate } from 'swr';

import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';
import { usePageDispatch } from '../../lib/context/PageContext';

function NewArticlePage() {
  const [errors, setErrors] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const setPage = usePageDispatch();

  const handleSubmit = async (newData: ArticleInput) => {
    setLoading(true);

    try {
      const response = await ArticleAPI.create(newData);

      if (response.status === 200 || response.status === 201) {
        // 새 게시글 작성 후 관련 캐시 무효화
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

        setPage(0);
        Router.push(`/`).then(() => {
          window.scrollTo(0, 0);
        });
        return;
      }
    } catch (error) {
      if (error.code === 'DUPLICATE_TITLE') {
        setErrors([error.message]);
      } else {
        setErrors(['아티클 생성에 실패했습니다.']);
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
            initialValues={{
              title: '',
              summary: '',
              content: '',
              tags: [],
            }}
            isLoading={isLoading}
            errors={errors}
            onSubmit={handleSubmit}
            submitLabel="Publish Article"
          />
        </div>
      </div>
    </div>
  );
}

export default NewArticlePage;
