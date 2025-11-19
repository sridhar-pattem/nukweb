import React, { useState } from 'react';
import BookImport from './BookImport';
import PatronImport from './PatronImport';

const Import = () => {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="import-container" style={{ padding: '2rem' }}>
      <h1>Data Import</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Import books and patrons from CSV files
      </p>

      {/* Import Type Tabs */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'books' ? 'var(--teal)' : 'transparent',
              color: activeTab === 'books' ? 'white' : 'var(--ink)',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'books' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'books' ? 'none' : '2px solid var(--line)',
            }}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('patrons')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'patrons' ? 'var(--teal)' : 'transparent',
              color: activeTab === 'patrons' ? 'white' : 'var(--ink)',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'patrons' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'patrons' ? 'none' : '2px solid var(--line)',
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
