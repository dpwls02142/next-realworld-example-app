import { useState } from 'react';
import Router from 'next/router';

import ArticleAPI from '../../lib/api/article';
import EditorForm, { ArticleInput } from '../../features/editor/EditorForm';
import { useQueryClient } from '@tanstack/react-query';

function NewArticlePage() {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (newData: ArticleInput) => {
    setLoading(true);

    try {
      await ArticleAPI.create(newData);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]);

      Router.push(`/`);
      return;
    } catch (error) {
      alert('게시글 생성에 실패했습니다.');
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
            onSubmit={handleSubmit}
            submitLabel="Publish Article"
          />
        </div>
      </div>
    </div>
  );
}

export default NewArticlePage;
