# Implementation Plan

[Overview]
Enable users to edit the AI-generated HTML preview before sending, using a modal-based code editor approach. Users will see the preview, click an "Edit HTML" button to open a modal, modify the HTML, and have their edits sent to the confirm endpoint.

This feature improves user control over the final email content while maintaining the existing AI generation workflow. The modal approach keeps the UI clean and only shows complexity when needed.

[Types]
No new types or interfaces required beyond what's already in the codebase. State management uses existing `generatedHtml` state variable.

[Files]
Single sentence describing file modifications.

Detailed breakdown:
- **src/components/ui/HtmlEditorModal.jsx** (NEW) - Reusable modal component with code editor for HTML editing
- **src/pages/DetailedEmailForm.jsx** (MODIFY) - Add Edit button to preview header, integrate HtmlEditorModal, update handleSendEmail to use edited HTML
- **src/pages/YoloEmailForm.jsx** (MODIFY) - Same changes as DetailedEmailForm
- **package.json** (MODIFY) - Add `@monaco-editor/react` dependency for the code editor

[Functions]
Single sentence describing function modifications.

Detailed breakdown:
- **HtmlEditorModal** (NEW) - Component accepting `isOpen`, `html`, `onSave`, `onClose` props
- **handleEditHtml** (NEW in both forms) - Opens the modal for editing
- **handleSaveHtml** (NEW in both forms) - Saves edited HTML and updates state
- **handleSendEmail** (MODIFY in both forms) - Already uses `generatedHtml`, no changes needed as long as state is updated

[Classes]
Single sentence describing class modifications.

Detailed breakdown:
- No class modifications required. All changes are function/component-based.

[Dependencies]
Single sentence describing dependency modifications.

Details:
- Add `@monaco-editor/react` (^4.6.0 or latest) - Industry-standard React wrapper for Monaco Editor with HTML syntax highlighting

[Testing]
Single sentence describing testing approach.

Test the edit flow: generate preview → click Edit → modify HTML → save → verify preview updates → send and confirm the edited HTML is received by backend.

[Implementation Order]
Numbered steps showing the logical order of changes to minimize conflicts and ensure successful integration.

1. Install `@monaco-editor/react` dependency
2. Create `HtmlEditorModal.jsx` component with code editor
3. Integrate modal into `DetailedEmailForm.jsx`
4. Integrate modal into `YoloEmailForm.jsx`
5. Test the full flow end-to-end
