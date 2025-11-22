import React, { useState } from 'react';
import BookImport from './BookImport';
import PatronImport from './PatronImport';

const Import = () => {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="import-container">
      <h1>Data Import</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Import books and patrons from CSV files
      </p>

      {/* Import Type Tabs */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #ddd' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'books' ? '#5BC0BE' : 'transparent',
              color: activeTab === 'books' ? 'white' : '#333',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'books' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('patrons')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'patrons' ? '#5BC0BE' : 'transparent',
              color: activeTab === 'patrons' ? 'white' : '#333',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'patrons' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            Patrons
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'books' && <BookImport />}
        {activeTab === 'patrons' && <PatronImport />}
      </div>
    </div>
  );
};

export default Import;
