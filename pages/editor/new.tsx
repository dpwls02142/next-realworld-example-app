import { useState } from 'react';
import useSWR from 'swr';
import Router from 'next/router';

import storage from '../../lib/utils/storage';
import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';

const NewArticlePage = () => {
  const [errors, setErrors] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { data: currentUser } = useSWR('user', storage);

  const handleSubmit = async (data: ArticleInput) => {
    setLoading(true);

    const { data: res, status } = await ArticleAPI.create(
      data,
      currentUser?.token,
    );

    setLoading(false);

    if (status !== 200) return setErrors(res.errors);

    Router.push('/');
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
};

export default NewArticlePage;
