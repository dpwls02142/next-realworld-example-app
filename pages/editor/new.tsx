import { useState } from 'react';
import useSWR from 'swr';
import Router from 'next/router';

import storage from '../../lib/utils/storage';
import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';

function NewArticlePage() {
  const [errors, setErrors] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { data: currentUser } = useSWR('user', storage);

  const handleSubmit = async (data: ArticleInput) => {
    setLoading(true);

    try {
      const response = await ArticleAPI.create(data, currentUser.token);

      if (response.status === 200 || response.status === 201) {
        Router.push('/');
        return;
      }
    } catch (error) {
      if (error.code === 'DUPLICATE_ARTICLE') {
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
              description: '',
              body: '',
              tagList: [],
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
