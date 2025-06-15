import { useState } from 'react';
import Router from 'next/router';

import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';

function EditArticlePage({ article }) {
  const [errors, setErrors] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (editData: ArticleInput) => {
    setLoading(true);

    try {
      const response = await ArticleAPI.update(editData, article.id.toString());

      if (response.status === 200 || response.status === 201) {
        Router.push('/');
        return;
      }
    } catch (error) {
      if (error.code === 'DUPLICATE_TITLE') {
        setErrors([error.message]);
      } else {
        setErrors(['아티클 수정에 실패했습니다.']);
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
            errors={errors}
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
  const {
    data: { article },
  } = await ArticleAPI.get(slug);
  return { props: { article } };
}

export default EditArticlePage;
