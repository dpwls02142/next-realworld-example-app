import Router from 'next/router';
import { ChangeEvent, useReducer, useState } from 'react';
import useSWR from 'swr';

import ListErrors from '../../shared/components/ListErrors';
import TagInput from '../../features/editor/TagInput';
import ArticleAPI from '../../lib/api/article';
import storage from '../../lib/utils/storage';
import editorReducer from '../../lib/utils/editorReducer';
import validateArticle from 'lib/utils/validateArticle';

const PublishArticleEditor = () => {
  const initialState = {
    title: '',
    description: '',
    body: '',
    tagList: [],
  };

  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [posting, dispatch] = useReducer(editorReducer, initialState);
  const { data: currentUser } = useSWR('user', storage);

  type InputChange = ChangeEvent<HTMLInputElement>;
  type TextareaChange = ChangeEvent<HTMLTextAreaElement>;

  const handleTitle = (e: InputChange) =>
    dispatch({ type: 'SET_TITLE', text: e.target.value });
  const handleDescription = (e: InputChange) =>
    dispatch({ type: 'SET_DESCRIPTION', text: e.target.value });
  const handleBody = (e: TextareaChange) =>
    dispatch({ type: 'SET_BODY', text: e.target.value });

  const addTag = (tag: string) => dispatch({ type: 'ADD_TAG', tag: tag });
  const removeTag = (tag: string) => dispatch({ type: 'REMOVE_TAG', tag: tag });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateArticle(posting);

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    setLoading(true);

    const { data, status } = await ArticleAPI.create(
      posting,
      currentUser?.token,
    );

    setLoading(false);

    if (status !== 200) {
      setErrors(data.errors);
    }

    Router.push('/');
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ListErrors errors={errors} />
            <form>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    value={posting.title}
                    onChange={handleTitle}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    value={posting.description}
                    onChange={handleDescription}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={posting.body}
                    onChange={handleBody}
                  />
                </fieldset>

                <TagInput
                  tagList={posting.tagList}
                  addTag={addTag}
                  removeTag={removeTag}
                />

                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishArticleEditor;
