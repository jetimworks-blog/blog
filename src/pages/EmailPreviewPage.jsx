import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmailPreviewPage() {
  const [html, setHtml] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const previewHtml = sessionStorage.getItem('previewHtml');
    if (previewHtml) {
      setHtml(previewHtml);
    } else {
      // No HTML to display, redirect back
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  if (!html) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div
        className="email-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}