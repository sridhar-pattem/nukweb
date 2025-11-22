import React, { useState, useRef } from 'react';
import { FaImage, FaUpload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BannerImageManager = ({ pageName, currentImage, onImageUpdate }) => {
  const { isAdmin } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isAdmin()) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('pageName', pageName);

      const response = await fetch('http://localhost:5001/api/admin/upload-banner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Image uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);

        // Call the callback to update the parent component
        if (onImageUpdate) {
          onImageUpdate(data.imagePath);
        } else {
          // If no callback, reload the page to show new image
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        setMessage(`Error: ${data.message || 'Upload failed'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload image. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: 'var(--text-charcoal)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: uploading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          opacity: uploading ? 0.7 : 1,
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        title="Replace banner image"
      >
        {uploading ? (
          <>
            <FaUpload style={{ animation: 'spin 1s linear infinite' }} />
            Uploading...
          </>
        ) : (
          <>
            <FaImage />
            Replace Image
          </>
        )}
      </button>

      {message && (
        <div
          style={{
            position: 'absolute',
            bottom: '4.5rem',
            right: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
            color: message.startsWith('✓') ? '#155724' : '#721c24',
            border: `1px solid ${message.startsWith('✓') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {message}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default BannerImageManager;
