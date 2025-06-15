import { FormEvent, useReducer } from 'react';
import ListErrors from '../../shared/components/ListErrors';
import TagInput from './TagInput';
import editorReducer from '../../lib/utils/editorReducer';
import validateArticle from '../../lib/utils/validateArticle';
import TextInput from '../../shared/ui/input/TextInput';
import QuillEditor from '../../shared/ui/input/QuillEditor';
import SubmitButton from '../../shared/ui/button/SubmitButton';

export type ArticleInput = {
  title: string;
  summary: string;
  content: string;
  tags: string[];
};

interface EditorFormProps {
  initialValues: ArticleInput;
  isLoading: boolean;
  errors: any[];
  onSubmit: (data: ArticleInput) => void;
  submitLabel: string;
}

const EditorForm = ({
  initialValues,
  isLoading,
  errors,
  onSubmit,
  submitLabel,
}: EditorFormProps) => {
  const [posting, dispatch] = useReducer(editorReducer, initialValues);

  const handleChange = (type: string) => (e: any) =>
    dispatch({ type, text: e.target.value });

  const handleQuillChange = (content: string) => {
    dispatch({ type: 'SET_CONTENT', text: content });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const error = validateArticle(posting);
    if (error) {
      alert(error);
      return;
    }
    onSubmit(posting);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ListErrors errors={errors} />

      <fieldset>
        <fieldset className="form-group">
          <label htmlFor="article-title">제목</label>
          <TextInput
            id="article-title"
            placeholder="Article Title"
            value={posting.title}
            onChange={handleChange('SET_TITLE')}
            className="form-control-lg"
          />
        </fieldset>

        <fieldset className="form-group">
          <label htmlFor="article-summary">설명</label>
          <TextInput
            id="article-summary"
            placeholder="What's this article about?"
            value={posting.summary}
            onChange={handleChange('SET_SUMMARY')}
          />
        </fieldset>

        <fieldset className="form-group">
          <label htmlFor="article-content">내용</label>
          <QuillEditor
            placeholder="아티클 내용을 작성해주세요..."
            value={posting.content}
            onChange={handleQuillChange}
          />
        </fieldset>

        <TagInput
          tagList={posting.tags}
          addTag={(tag) => dispatch({ type: 'ADD_TAG', tag })}
          removeTag={(tag) => dispatch({ type: 'REMOVE_TAG', tag })}
        />

        <SubmitButton
          label={submitLabel}
          isLoading={isLoading}
          onClick={() => onSubmit(posting)}
        />
      </fieldset>
    </form>
  );
};

export default EditorForm;
