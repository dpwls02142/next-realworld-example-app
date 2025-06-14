import { FormEvent, useReducer } from 'react';
import ListErrors from '../../shared/components/ListErrors';
import TagInput from './TagInput';
import editorReducer from '../../lib/utils/editorReducer';
import validateArticle from '../../lib/utils/validateArticle';
import TextInput from '../../shared/ui/input/TextInput';
import QuillEditor from '../../shared/ui/input/QuillEditor';
import SubmitButton from '../../shared/ui/button/SubmitButton';

export interface ArticleInput {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

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
    dispatch({ type: 'SET_BODY', text: content });
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
          <TextInput
            placeholder="Article Title"
            value={posting.title}
            onChange={handleChange('SET_TITLE')}
            className="form-control-lg"
          />
        </fieldset>

        <fieldset className="form-group">
          <TextInput
            placeholder="What's this article about?"
            value={posting.description}
            onChange={handleChange('SET_DESCRIPTION')}
          />
        </fieldset>

        <fieldset className="form-group">
          <QuillEditor
            placeholder="아티클 내용을 작성해주세요..."
            value={posting.body}
            onChange={handleQuillChange}
          />
        </fieldset>

        <TagInput
          tagList={posting.tagList}
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
