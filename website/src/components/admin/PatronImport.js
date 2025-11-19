import React, { useState } from 'react';
import { adminLibraryAPI } from '../../services/api';

const PatronImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const response = await adminLibraryAPI.previewPatronImport(formData);
      setPreview(response.data);
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || error.message || 'Failed to preview'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.ready_to_import === 0) {
      alert('No patrons ready to import');
      return;
    }

    setLoading(true);

    // Get full patron data for patrons ready to import
    const patronsToImport = preview.preview
      .filter(patron => patron.status === 'ready')
      .map(patron => ({
        patron_id: patron.patron_id,
        name: patron.name,
        email: patron.email,
        phone: patron.phone,
        address: patron.address,
        user_status: patron.user_status,
        join_date: patron.join_date,
      }));

    try {
      const response = await adminLibraryAPI.executePatronImport({
        patrons: patronsToImport,
      });

      setImportResult(response.data);
      setPreview(null);
      setCsvFile(null);
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || error.message || 'Failed to import'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patron-import">
      <h2>Import Patrons from CSV</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Import patron data from a CSV file exported from libib or another library system.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <h3>CSV Format Requirements</h3>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          The CSV file should contain the following columns:
        </p>
        <ul style={{ fontSize: '0.875rem', color: '#666', fontFamily: 'monospace' }}>
          <li>patron_id (required)</li>
          <li>first_name (required)</li>
          <li>last_name (required)</li>
          <li>email (required)</li>
          <li>phone (optional)</li>
          <li>address1, address2, city, state, country, zip (optional)</li>
          <li>freeze (optional - '1' or 'true' for frozen accounts)</li>
          <li>created (optional - join date in YYYY-MM-DD format)</li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload CSV</h3>
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

          {/* CSV Column Names */}
          {preview.columns_found && preview.columns_found.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e8f4f8', borderRadius: '4px' }}>
              <strong>CSV Columns Found:</strong>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {preview.columns_found.join(', ')}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Total rows:</strong> {preview.total_rows}</p>
            <p><strong>Ready to import:</strong> {preview.ready_to_import}</p>
            <p><strong>Already exists:</strong> {preview.already_exists}</p>
            <p><strong>Email conflicts:</strong> {preview.email_conflicts}</p>
            {preview.errors && preview.errors.length > 0 && (
              <p style={{ color: '#d9534f' }}><strong>Errors:</strong> {preview.errors.length}</p>
            )}
          </div>

          {/* Errors Section */}
          {preview.errors && preview.errors.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f8d7da', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
              <strong>Errors (first 10):</strong>
              <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                {preview.errors.slice(0, 10).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={preview.ready_to_import === 0 || loading}
            className="btn btn-primary"
          >
            {loading ? 'Importing...' : `Import ${preview.ready_to_import} Patrons`}
          </button>

          {/* Preview Table */}
          <div style={{ marginTop: '1rem', maxHeight: '400px', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e0e0e0' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Patron ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((patron, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{patron.patron_id}</td>
                    <td style={{ padding: '0.5rem' }}>{patron.name}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{patron.email}</td>
                    <td style={{ padding: '0.5rem' }}>{patron.phone || '-'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          background: patron.status === 'ready' ? '#d4edda' : patron.status === 'exists' ? '#fff3cd' : '#f8d7da',
                        }}
                      >
                        {patron.status === 'ready' && `✓ Ready (${patron.user_status})`}
                        {patron.status === 'exists' && '⊙ Exists'}
                        {patron.status === 'email_conflict' && '✗ Email conflict'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {importResult.default_password && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '4px' }}>
              <strong>Important:</strong> All imported patrons have been assigned the default password:
              <code style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '4px' }}>
                {importResult.default_password}
              </code>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Please inform patrons to change their password after first login.
              </p>
            </div>
          )}

          {importResult.details && importResult.details.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Errors:</h4>
              <ul>
                {importResult.details.errors.map((error, idx) => (
                  <li key={idx}>
                    Patron {error.patron_id} ({error.email}): {error.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importResult.details && importResult.details.skipped.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Skipped:</h4>
              <ul>
                {importResult.details.skipped.map((skipped, idx) => (
                  <li key={idx}>
                    Patron {skipped.patron_id} ({skipped.email}): {skipped.reason}
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

export default PatronImport;
