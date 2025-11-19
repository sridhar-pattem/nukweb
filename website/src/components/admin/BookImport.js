import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BookImport = () => {
  const { getAuthHeaders } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isbnList, setIsbnList] = useState('');
  const [mode, setMode] = useState('csv'); // 'csv' or 'manual'

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/collections', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setCollections(data.collections || []);
      if (data.collections && data.collections.length > 0) {
        setSelectedCollection(data.collections[0].collection_id);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setPreview(null);
    setImportResult(null);
  };

  const handlePreview = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('http://localhost:5001/api/admin/import/books/preview', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview');
      }

      setPreview(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedCollection) {
      alert('Please select a collection');
      return;
    }

    if (!preview || preview.ready_to_import === 0) {
      alert('No books ready to import');
      return;
    }

    setLoading(true);

    // Get ISBNs of books that are ready to import
    const isbnsToImport = preview.preview
      .filter(book => book.status === 'ready')
      .map(book => book.isbn);

    try {
      const response = await fetch('http://localhost:5001/api/admin/import/books/execute', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_id: selectedCollection,
          isbns: isbnsToImport,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import');
      }

      setImportResult(data);
      setPreview(null);
      setCsvFile(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!selectedCollection) {
      alert('Please select a collection');
      return;
    }

    if (!isbnList.trim()) {
      alert('Please enter at least one ISBN');
      return;
    }

    setLoading(true);

    // Parse ISBNs
    const isbns = isbnList
      .split(/[\n,]/)
      .map(isbn => isbn.trim())
      .filter(isbn => isbn);

    try {
      const response = await fetch('http://localhost:5001/api/admin/import/books/execute', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_id: selectedCollection,
          isbns: isbns,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import');
      }

      setImportResult(data);
      setIsbnList('');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-import" style={{ padding: '2rem' }}>
      <h1>Import Books from libib</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Import your book inventory using ISBNs. Book details will be automatically fetched from Google Books.
      </p>

      {/* Mode Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setMode('csv')}
            className={`btn ${mode === 'csv' ? 'btn-primary' : 'btn-outline'}`}
          >
            Import from CSV
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
          >
            Manual ISBN Entry
          </button>
        </div>
      </div>

      {/* Collection Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="collection" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Target Collection
        </label>
        <select
          id="collection"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', maxWidth: '400px' }}
        >
          {collections.map((collection) => (
            <option key={collection.collection_id} value={collection.collection_id}>
              {collection.collection_name}
            </option>
          ))}
        </select>
      </div>

      {/* CSV Import Mode */}
      {mode === 'csv' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h3>Step 1: Export from libib</h3>
            <ol>
              <li>Go to your libib.com library</li>
              <li>Click on "Settings" → "Export Library"</li>
              <li>Download the CSV file</li>
            </ol>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Step 2: Upload CSV</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            <button
              onClick={handlePreview}
              disabled={!csvFile || loading}
              className="btn btn-primary"
            >
              {loading ? 'Processing...' : 'Preview Import'}
            </button>
          </div>

          {/* Preview Results */}
          {preview && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Preview Results</h3>
              <div style={{ marginBottom: '1rem' }}>
                <p><strong>Total rows:</strong> {preview.total_rows}</p>
                <p><strong>Ready to import:</strong> {preview.ready_to_import}</p>
                <p><strong>Already exists:</strong> {preview.already_exists}</p>
                <p><strong>Not found:</strong> {preview.not_found}</p>
              </div>

              <button
                onClick={handleImport}
                disabled={preview.ready_to_import === 0 || loading}
                className="btn btn-primary"
              >
                {loading ? 'Importing...' : `Import ${preview.ready_to_import} Books`}
              </button>

              {/* Preview Table */}
              <div style={{ marginTop: '1rem', maxHeight: '400px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e0e0e0' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>ISBN</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Title</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((book, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '0.5rem' }}>{book.isbn}</td>
                        <td style={{ padding: '0.5rem' }}>{book.title || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              background: book.status === 'ready' ? '#d4edda' : book.status === 'exists' ? '#fff3cd' : '#f8d7da',
                            }}
                          >
                            {book.message}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual ISBN Entry Mode */}
      {mode === 'manual' && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Enter ISBNs</h3>
          <p className="text-muted">Enter one ISBN per line or separate with commas</p>
          <textarea
            value={isbnList}
            onChange={(e) => setIsbnList(e.target.value)}
            placeholder="9780123456789&#10;9789876543210&#10;..."
            style={{
              width: '100%',
              maxWidth: '600px',
              minHeight: '200px',
              padding: '0.5rem',
              fontFamily: 'monospace',
              marginBottom: '1rem',
            }}
          />
          <div>
            <button
              onClick={handleManualImport}
              disabled={!isbnList.trim() || loading}
              className="btn btn-primary"
            >
              {loading ? 'Importing...' : 'Import Books'}
            </button>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px', marginTop: '2rem' }}>
          <h3>Import Complete!</h3>
          <p><strong>Total:</strong> {importResult.total}</p>
          <p><strong>Imported:</strong> {importResult.imported}</p>
          <p><strong>Skipped:</strong> {importResult.skipped}</p>
          <p><strong>Errors:</strong> {importResult.errors}</p>

          {importResult.details && importResult.details.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Errors:</h4>
              <ul>
                {importResult.details.errors.map((error, idx) => (
                  <li key={idx}>
                    ISBN {error.isbn}: {error.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookImport;
