import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '300px',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      에디터 로딩 중...
    </div>
  ),
});

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const QuillEditor = ({
  value,
  onChange,
  placeholder = '내용을 입력해주세요...',
  className = '',
}: QuillEditorProps) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
    'color',
    'background',
    'script',
    'code-block',
  ];

  return (
    <div className={`quill-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: '300px',
          marginBottom: '50px',
        }}
      />
      <style jsx global>{`
        .quill-editor-wrapper .ql-editor {
          min-height: 200px;
          font-size: 16px;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
        .quill-editor-wrapper .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
