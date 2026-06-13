import { useEffect, useRef } from 'react';

/**
 * Renders HTML email preview in an isolated iframe with CSS reset.
 * This ensures the email renders exactly as it would in an email client,
 * without any app styles bleeding through.
 */
export function EmailPreview({ html, className = '' }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current || !html) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;

    if (!doc) return;

    // Write HTML with CSS reset to isolate from app styles
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* CSS Reset - remove all external styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      min-height: 100%;
      height: 100%;
      background-color: transparent;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      min-height: 100%;
      height: 100%;
    }
    /* Ensure table layouts work properly */
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    td, th {
      padding: 0;
    }
    img {
      border: 0;
      display: block;
    }
    a {
      text-decoration: none;
      color: inherit;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className={`email-preview-iframe ${className}`}
      title="Email Preview"
      sandbox="allow-same-origin"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: 'transparent',
      }}
    />
  );
}

export default EmailPreview;
