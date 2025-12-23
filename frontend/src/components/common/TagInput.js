import React, { useState } from 'react';

/**
 * TagInput Component
 * A reusable component for managing tags with add/remove functionality
 *
 * @param {Array} tags - Array of tag strings
 * @param {Function} onChange - Callback function called when tags change
 * @param {String} placeholder - Placeholder text for input
 * @param {Number} maxLength - Maximum length per tag (default: 30)
 */
function TagInput({ tags = [], onChange, placeholder = "Add a tag and press Enter", maxLength = 30 }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if backspace is pressed with empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    if (!trimmedValue) return;

    if (trimmedValue.length > maxLength) {
      alert(`Tag cannot exceed ${maxLength} characters`);
      return;
    }

    // Check for duplicates
    if (tags.includes(trimmedValue)) {
      alert('This tag already exists');
      setInputValue('');
      return;
    }

    // Add the tag
    onChange([...tags, trimmedValue]);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    // Handle comma-separated input
    if (value.includes(',')) {
      const newTags = value
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag && tag.length <= maxLength && !tags.includes(tag));

      if (newTags.length > 0) {
        onChange([...tags, ...newTags]);
      }
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    // Add tag on blur if there's content
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
        Tags
      </label>

      {/* Tags Container */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minHeight: '2.5rem',
        background: '#fff'
      }}>
        {/* Tag Chips */}
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '16px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '0.25rem',
                fontSize: '1rem',
                lineHeight: '1'
              }}
              title="Remove tag"
            >
              ×
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            flex: '1',
            minWidth: '150px',
            border: 'none',
            outline: 'none',
            padding: '0.25rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Helper Text */}
      <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
        Press Enter or comma to add tags. Click × to remove. Max {maxLength} characters per tag.
      </small>
    </div>
  );
}

export default TagInput;
