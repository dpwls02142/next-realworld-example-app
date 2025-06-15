import { useState } from 'react';

const TagInput = ({ tagList, addTag, removeTag }) => {
  const [tag, setTag] = useState('');
  const tags = tagList || [];

  const changeTagInput = (e) => setTag(e.target.value);

  const handleTagInputKeyDown = (e) => {
    switch (e.keyCode) {
      case 13: // Enter
      case 9: // Tab
      case 188: // Comma
        if (e.keyCode !== 9) e.preventDefault();
        handleAddTag();
        break;
      default:
        break;
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tag.trim();
    const isDuplicate = tags.includes(trimmedTag);
    if (trimmedTag && !isDuplicate) {
      addTag(trimmedTag);
      setTag('');
    } else if (isDuplicate) {
      alert('이미 추가된 태그입니다.');
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    removeTag(tagToRemove);
  };

  return (
    <div>
      <fieldset className="form-group">
        <label htmlFor="tag-input">태그</label>
        <div style={{ position: 'relative' }}>
          <input
            id="tag-input"
            className="form-control"
            type="text"
            placeholder="태그를 입력해주세요 (Enter, Tab, 쉼표로 추가할 수 있어요)"
            value={tag}
            onChange={changeTagInput}
            onBlur={handleAddTag}
            onKeyDown={handleTagInputKeyDown}
          />
          {tag.trim() && (
            <i
              className="ion-plus-round"
              onClick={handleAddTag}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#5cb85c',
              }}
            />
          )}
        </div>

        <div className="tag-list" style={{ marginTop: '10px' }}>
          {tags.map((tagItem, index) => (
            <span className="tag-default tag-pill" key={index}>
              {tagItem}
              <i
                className="ion-close-round"
                onClick={() => handleRemoveTag(tagItem)}
                style={{
                  marginLeft: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                }}
              />
            </span>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default TagInput;
