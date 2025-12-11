import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patronContentAPI } from '../../services/api';
import { FaSave, FaPaperPlane, FaArrowLeft, FaUpload, FaImage, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../styles/blog-editor.css';

const BlogPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    tags: '',
    category: 'Book Reviews',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageHeight, setImageHeight] = useState('400');
  const [errors, setErrors] = useState({});
  const [uploadMessage, setUploadMessage] = useState('');

  const categories = [
    'Book Reviews',
    'Library Updates',
    'Reading Lists',
    'Author Spotlights',
    'Literary Events',
    'Study Tips',
    'Book Recommendations',
    'Member Stories',
    'Community',
  ];

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await patronContentAPI.getBlogPostById(id);
      const post = response.data;
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        featured_image_url: post.featured_image_url || '',
        tags: post.tags || '',
        category: post.category || 'Book Reviews',
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to load post');
      navigate('/patron/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !id) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        submit: false,
      };

      if (id) {
        await patronContentAPI.updateBlogPost(id, data);
      } else {
        await patronContentAPI.createBlogPost(data);
      }

      alert('Draft saved successfully!');
      navigate('/patron/dashboard');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Please select an image file');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('Image size should be less than 5MB');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      formDataUpload.append('pageName', 'blog-content');

      const response = await fetch(`${API_URL}/admin/website/upload-banner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        // Set the uploaded image URL
        setFormData((prev) => ({
          ...prev,
          featured_image_url: data.imagePath,
        }));
        setUploadMessage('✓ Image uploaded successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        setUploadMessage(`Error: ${data.message || 'Upload failed'}`);
        setTimeout(() => setUploadMessage(''), 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('Failed to upload image. Please try again.');
      setTimeout(() => setUploadMessage(''), 3000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        submit: true, // This flag tells the backend to set status as 'pending' instead of 'draft'
      };

      if (id) {
        await patronContentAPI.updateBlogPost(id, data);
      } else {
        await patronContentAPI.createBlogPost(data);
      }

      alert('Blog post submitted for review!');
      navigate('/patron/dashboard');
    } catch (error) {
      console.error('Error submitting post:', error);
      alert(error.response?.data?.message || 'Failed to submit post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        status: 'published', // Admin can publish directly
      };

      if (id) {
        await patronContentAPI.updateBlogPost(id, data);
      } else {
        await patronContentAPI.createBlogPost(data);
      }

      alert('Blog post published successfully!');
      navigate('/patron/dashboard');
    } catch (error) {
      console.error('Error publishing post:', error);
      alert(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-editor loading">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="blog-editor">
      <div className="editor-header">
        <button
          className="btn btn-text"
          onClick={() => navigate('/patron/dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter an engaging title..."
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="slug">
            Slug <span className="required">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="url-friendly-slug"
            className={errors.slug ? 'error' : ''}
          />
          {errors.slug && <span className="error-message">{errors.slug}</span>}
          <small>URL-friendly version of the title (auto-generated)</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="fiction, mystery, thriller (comma-separated)"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="featured_image_url">Featured Image</label>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {uploading ? (
                <>
                  <FaUpload style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                <>
                  <FaImage />
                  Upload Image
                </>
              )}
            </button>

            {/* Height selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="imageHeight" style={{ marginBottom: 0, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Image Height:
              </label>
              <select
                id="imageHeight"
                value={imageHeight}
                onChange={(e) => setImageHeight(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="200">200px</option>
                <option value="300">300px</option>
                <option value="400">400px (Recommended)</option>
                <option value="500">500px</option>
                <option value="600">600px</option>
              </select>
            </div>
          </div>

          {uploadMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                backgroundColor: uploadMessage.startsWith('✓') ? '#d4edda' : '#f8d7da',
                color: uploadMessage.startsWith('✓') ? '#155724' : '#721c24',
                border: `1px solid ${uploadMessage.startsWith('✓') ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              {uploadMessage}
            </div>
          )}

          {/* Image URL Input (or manual URL entry) */}
          <input
            type="url"
            id="featured_image_url"
            name="featured_image_url"
            value={formData.featured_image_url}
            onChange={handleChange}
            placeholder="Or enter image URL manually: https://example.com/image.jpg"
          />

          {/* Image Preview */}
          {formData.featured_image_url && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Preview:</p>
              <img
                src={formData.featured_image_url}
                alt="Featured preview"
                style={{
                  width: '100%',
                  height: `${imageHeight}px`,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <small>Upload an image or enter a URL manually. Image will match content width.</small>
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief summary of your post (optional)..."
            rows="3"
          ></textarea>
          <small>A short description that will appear in previews</small>
        </div>

        <div className="form-group">
          <label htmlFor="content">
            Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your blog post here... You can use Markdown formatting."
            rows="20"
            className={errors.content ? 'error' : ''}
          ></textarea>
          {errors.content && <span className="error-message">{errors.content}</span>}
          <small>
            Supports basic formatting: **bold**, *italic*, [link](url), # headings
          </small>
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          {isAdmin ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={saving}
            >
              <FaCheckCircle /> {saving ? 'Publishing...' : 'Publish Post'}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <FaPaperPlane /> {saving ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </form>

      <div className="editor-help">
        <h3>Writing Tips</h3>
        <ul>
          <li>Write a clear, engaging title that captures your main idea</li>
          <li>Use paragraphs to break up your content for better readability</li>
          <li>Add relevant tags to help readers find your post</li>
          <li>Include an excerpt to give readers a preview</li>
          <li>Proofread before submitting for review</li>
        </ul>
      </div>
    </div>
  );
};

export default BlogPostEditor;
