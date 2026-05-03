import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const emailIndex = headers.findIndex(h => h === 'email');

  if (emailIndex === -1) {
    throw new Error('CSV must have an "email" column');
  }

  const contacts = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values[emailIndex] && values[emailIndex].trim()) {
      const contact = { row: i };
      headers.forEach((header, idx) => {
        contact[header] = values[idx]?.trim() || '';
      });
      contact.email = values[emailIndex].trim();
      contacts.push(contact);
    }
  }

  if (contacts.length === 0) {
    throw new Error('No valid contacts found in CSV');
  }

  return {
    contacts,
    rowCount: contacts.length,
    headers,
  };
};

export const AudienceUploader = ({ onUpload, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const text = await file.text();
      const result = parseCSV(text);
      setPreview(result);

      // Call onUpload with the file and parsed data
      if (onUpload) {
        onUpload(file, result);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-text-muted',
          isUploading && 'cursor-wait'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted">Processing CSV...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-primary font-medium mb-1">
              Drop your CSV here or click to browse
            </p>
            <p className="text-sm text-text-muted">
              Upload a CSV with an "email" column plus any merge fields
            </p>
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 border border-error-muted text-error text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview after upload */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border rounded-lg overflow-hidden"
        >
          {/* File info header */}
          <div className="flex items-center justify-between bg-surface-elevated px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {preview.contacts.length} contacts imported
                </p>
                <p className="text-xs text-text-muted">
                  {preview.headers.join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 text-text-muted hover:text-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview table - first 5 rows */}
          <div className="max-h-48 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-muted sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  {preview.headers.filter(h => h !== 'email').slice(0, 3).map(h => (
                    <th key={h} className="text-left px-4 py-2 font-medium capitalize">
                      {h.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.contacts.slice(0, 5).map((contact, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="px-4 py-2 text-text-muted">{contact.row}</td>
                    <td className="px-4 py-2 text-text-primary">{contact.email}</td>
                    {preview.headers.filter(h => h !== 'email').slice(0, 3).map(h => (
                      <td key={h} className="px-4 py-2 text-text-secondary">
                        {contact[h] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.contacts.length > 5 && (
            <div className="px-4 py-2 text-xs text-text-muted bg-surface border-t border-border">
              And {preview.contacts.length - 5} more contacts...
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AudienceUploader;
