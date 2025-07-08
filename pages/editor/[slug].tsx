import { useState } from 'react';
import Router from 'next/router';
import { useQueryClient } from '@tanstack/react-query';

import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';

function EditArticlePage({ article }) {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (editData: ArticleInput) => {
    setLoading(true);

    try {
      await ArticleAPI.update(editData, article.id.toString());

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]);

      Router.push(`/`);
      return;
    } catch (error) {
      alert('게시글 수정에 실패했습니다.');
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
