import { useEffect, useState } from 'react';
import { EmailPreview } from '../components/ui/EmailPreview';

export default function EmailPreviewPage() {
  const [html, setHtml] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const previewHtml = sessionStorage.getItem('previewHtml');
    if (previewHtml) {
      setHtml(previewHtml);
    } else {
      // No HTML to display, redirect back using window.location to avoid SPA routing issues
      setRedirecting(true);
      window.location.replace('/home');
    }
  }, []);

  if (redirecting || !html) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative w-full h-full" style={{ height: '100vh' }}>
        <EmailPreview html={html} />
      </div>
    </div>
  );
}