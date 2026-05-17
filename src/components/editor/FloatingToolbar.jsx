import { useCallback, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Table,
} from 'lucide-react';

const ToolbarButton = ({ icon: Icon, isActive, onClick, title, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-accent text-white'
        : 'text-text-secondary hover:bg-accent/10 hover:text-accent'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const Divider = () => <div className="w-px h-5 bg-border mx-1" />;

export function FloatingToolbar({ editor }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const updateToolbar = useCallback(() => {
    if (!editor) return;

    const { selection } = editor.state;
    const { empty } = selection;

    if (empty || !editor.isFocused) {
      setIsVisible(false);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      top: rect.top - 50 + window.scrollY,
      left: rect.left + (rect.width / 2) - 200,
    });
    setIsVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updateToolbar);
    editor.on('blur', () => setIsVisible(false));

    return () => {
      editor.off('selectionUpdate', updateToolbar);
    };
  }, [editor, updateToolbar]);

  const handleLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
    } else {
      const existingUrl = editor.getAttributes('link').href;
      setLinkUrl(existingUrl || '');
      setShowLinkInput(true);
    }
  }, [editor, linkUrl, showLinkInput]);

  const handleImage = useCallback(() => {
    if (showImageInput) {
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
      setImageUrl('');
      setShowImageInput(false);
    } else {
      setShowImageInput(true);
    }
  }, [editor, imageUrl, showImageInput]);

  const handleTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!isVisible || !editor) return null;

  return (
    <div
      className="fixed z-50"
      style={{ top: position.top, left: position.left }}
    >
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-0.5 px-2 py-1.5 bg-surface-elevated border border-border rounded-lg shadow-xl"
      >
        <ToolbarButton
          icon={Bold}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        />
        <ToolbarButton
          icon={Italic}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        />
        <ToolbarButton
          icon={Underline}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        />
        <ToolbarButton
          icon={Strikethrough}
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        />

        <Divider />

        <ToolbarButton
          icon={Heading1}
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        />
        <ToolbarButton
          icon={Heading2}
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        />
        <ToolbarButton
          icon={Heading3}
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        />

        <Divider />

        <ToolbarButton
          icon={AlignLeft}
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        />
        <ToolbarButton
          icon={AlignCenter}
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        />
        <ToolbarButton
          icon={AlignRight}
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        />
        <ToolbarButton
          icon={AlignJustify}
          isActive={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
        />

        <Divider />

        <ToolbarButton
          icon={List}
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        />
        <ToolbarButton
          icon={Quote}
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        />
        <ToolbarButton
          icon={Table}
          isActive={false}
          onClick={handleTable}
          title="Insert Table"
        />
        <ToolbarButton
          icon={Minus}
          isActive={editor.isActive('horizontalRule')}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        />

        <Divider />

        <ToolbarButton
          icon={Link}
          isActive={editor.isActive('link')}
          onClick={handleLink}
          title="Link"
        />
        <ToolbarButton
          icon={Image}
          isActive={false}
          onClick={handleImage}
          title="Image"
        />

        <Divider />

        <ToolbarButton
          icon={Undo}
          isActive={false}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={Redo}
          isActive={false}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          disabled={!editor.can().redo()}
        />

        {showLinkInput && (
          <div className="ml-2 flex items-center gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="px-2 py-1 text-sm border border-border rounded bg-background text-text-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLink();
                if (e.key === 'Escape') {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }
              }}
              autoFocus
            />
          </div>
        )}

        {showImageInput && (
          <div className="ml-2 flex items-center gap-1">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="px-2 py-1 text-sm border border-border rounded bg-background text-text-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleImage();
                if (e.key === 'Escape') {
                  setShowImageInput(false);
                  setImageUrl('');
                }
              }}
              autoFocus
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}