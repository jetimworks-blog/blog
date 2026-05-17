import { useEmailEditor } from '../../hooks/useEmailEditor';
import { FloatingToolbar } from './FloatingToolbar';

export function EmailWysiwygEditor({ initialContent = '', onUpdate, className = '' }) {
  const { editor, EditorContent } = useEmailEditor({
    initialContent,
    onUpdate,
  });

  if (!editor) {
    return (
      <div className={`flex items-center justify-center p-8 text-text-muted ${className}`}>
        Loading editor...
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <FloatingToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="tiptap-editor prose prose-sm max-w-none focus-within:outline-none"
      />
      <style>{`
        .tiptap-editor {
          min-height: 200px;
          background-color: #ffffff;
        }
        .tiptap-editor .ProseMirror {
          outline: none;
          min-height: 200px;
          padding: 1rem;
          color: #111827 !important;
          background-color: #ffffff;
        }
        .tiptap-editor .ProseMirror * {
          color: #111827 !important;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-editor .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          font-style: italic;
        }
        .tiptap-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 1.5rem 0;
        }
        .tiptap-editor .ProseMirror a {
          color: #3b82f6 !important;
          text-decoration: underline;
        }
        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        .tiptap-editor .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .tiptap-editor .ProseMirror th,
        .tiptap-editor .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
        }
        .tiptap-editor .ProseMirror th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}