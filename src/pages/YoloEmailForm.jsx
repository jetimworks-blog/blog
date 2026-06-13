import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { MagicLoader } from '../components/ui/MagicLoader';
import { WysiwygEditorModal } from '../components/editor/WysiwygEditorModal';
import { ChipInput } from '../components/ui/ChipInput';
import { AttachmentInput } from '../components/ui/AttachmentInput';
import { GraphWorkflow } from '../components/workflow/GraphWorkflow';
import { StepPanel } from '../components/workflow/StepPanel';
import { WorkflowBackdrop } from '../components/workflow/WorkflowBackdrop';
import { useGraphWorkflow } from '../hooks/useGraphWorkflow';
import { yoloSteps } from '../lib/workflowSteps';
import { emailAPI, configAPI } from '../lib/api';
import { validateEmail, validateRequired, validateAttachmentFile } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { getPreviousEmails, addEmailsToPrevious, fetchAndCachePreviousEmails } from '../lib/previousEmails';
import { ArrowLeft, Send, Zap, ChevronRight, Eye, RefreshCw, Edit3, Globe } from 'lucide-react';

// Helper function to extract name from email address
const extractNameFromEmail = (email) => {
  if (!email) return 'User';
  const localPart = email.split('@')[0];
  const nameParts = localPart.split(/[._-]/);
  return nameParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to get the sender name to use in the instruction
const getSenderName = (user, fromName) => {
  if (fromName && fromName.trim() && fromName.trim() !== 'Anonymous') {
    return fromName.trim();
  }
  return extractNameFromEmail(user?.email);
};

const getEmailsSentCount = () => {
  const count = localStorage.getItem('emailsSentCount');
  return count ? parseInt(count, 10) : 0;
};

const incrementEmailsSentCount = () => {
  const newCount = getEmailsSentCount() + 1;
  localStorage.setItem('emailsSentCount', newCount.toString());
  return newCount;
};

const countRecipients = (data) => {
  const toListCount = Array.isArray(data.toList) ? data.toList.length : 0;
  const ccCount = Array.isArray(data.cc) ? data.cc.length : 0;
  const bccCount = Array.isArray(data.bcc) ? data.bcc.length : 0;
  return toListCount + ccCount + bccCount;
};

export const YoloEmailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fromName, setFromName] = useState('');
  const [formData, setFormData] = useState({
    toList: [],
    cc: [],
    bcc: [],
    recipientName: '',
    subject: '',
    prompt: '',
    noStyle: true,
  });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errors, setErrors] = useState({});
  const [emailsSentCount, setEmailsSentCount] = useState(getEmailsSentCount);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Workflow nav. Validators array: one fn per step, returns null when valid
  // or an errors object. Only steps 0 and 1 have user-input validation;
  // preview/send are gated by the underlying API call.
  const validators = [
    () => {
      const errs = {};
      if (!Array.isArray(formData.toList) || formData.toList.length === 0) {
        errs.toList = 'Please add at least one recipient';
      } else {
        const validateArray = (arr, name) => {
          for (const email of arr) {
            if (!validateEmail(email)) return `Invalid email in ${name}: ${email}`;
          }
          return null;
        };
        const toErr = validateArray(formData.toList, 'To List');
        if (toErr) errs.toList = toErr;
        const ccErr = validateArray(formData.cc, 'CC');
        if (ccErr) errs.cc = ccErr;
        const bccErr = validateArray(formData.bcc, 'BCC');
        if (bccErr) errs.bcc = bccErr;
        if (countRecipients(formData) > 50) {
          errs.toList = `Too many recipients (${countRecipients(formData)}). Maximum is 50.`;
        }
      }
      return Object.keys(errs).length ? errs : null;
    },
    () => {
      const errs = {};
      const subj = validateRequired(formData.subject, 'Subject');
      if (!subj.valid) errs.subject = subj.message;
      const prm = validateRequired(formData.prompt, 'Prompt');
      if (!prm.valid) errs.prompt = prm.message;
      else if (formData.prompt.length < 10) {
        errs.prompt = 'Please provide a bit more detail (at least 10 characters)';
      }
      return Object.keys(errs).length ? errs : null;
    },
    null, // preview — no advance-time validation
    null, // send — final
  ];

  const workflow = useGraphWorkflow({ steps: yoloSteps, validators });

  // Load previous emails for autocomplete
  const previousEmails = useMemo(() => {
    const cached = getPreviousEmails();
    if (cached.length === 0) fetchAndCachePreviousEmails();
    return cached;
  }, []);

  // Preload form data from history if available
  useEffect(() => {
    const historyData = location.state?.historyItem;
    if (historyData) {
      setFormData({
        toList: Array.isArray(historyData.to_list) ? historyData.to_list : [],
        cc: Array.isArray(historyData.cc) ? historyData.cc : [],
        bcc: Array.isArray(historyData.bcc) ? historyData.bcc : [],
        recipientName: historyData.recipientName || '',
        subject: historyData.subject || '',
        prompt: historyData.prompt || '',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch config to get from_name
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        setFromName(response.data.from_name || 'Anonymous');
      } catch {
        setFromName('Anonymous');
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Errors from the hook's validator get persisted to local errors state so
  // inputs can show them.
  const showValidationErrors = (errs) => {
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before continuing', {
        description: Object.values(errs)[0],
      });
    }
  };

  // Next-button handler. Branch per step: 0 = validate+advance, 1 = generate
  // preview, 2 = just advance to send view, 3 = send.
  const handleNext = async () => {
    setErrors({});
    if (workflow.currentStep === 0) {
      const errs = workflow.validateCurrent();
      if (errs) { showValidationErrors(errs); return; }
      workflow.completeStep(0);
      workflow.nextStep();
      return;
    }
    if (workflow.currentStep === 1) {
      const errs = workflow.validateCurrent();
      if (errs) { showValidationErrors(errs); return; }
      await handleGeneratePreview();
      return;
    }
    if (workflow.currentStep === 2) {
      // Preview -> Send: just mark preview complete and advance.
      workflow.completeStep(2);
      workflow.nextStep();
      return;
    }
  };

  const handleBack = () => workflow.prevStep();

  // Click any node = free nav. No validation. The target step just opens.
  const handleNodeClick = (index) => {
    workflow.goToStep(index);
  };

  const buildClientPrompt = () => {
    const senderName = getSenderName(user, fromName);
    const recipientName = formData.recipientName.trim();
    let clientPrompt = '';
    if (recipientName) clientPrompt += `Recipient name: ${recipientName}.\n`;
    clientPrompt += `Subject: ${formData.subject}.\n`;
    if (formData.noStyle) {
      clientPrompt += `Plain text professional email, no HTML styling, no decorative elements.\n`;
    } else {
      clientPrompt += `CRITICAL: Create a visually stunning, professionally styled HTML email. Use inline CSS styles extensively — include eye-catching colors, elegant typography, tasteful spacing, and proper table-based layouts for structure. The email MUST look polished and impressive, not plain. Apply all styling directly in HTML attributes and inline styles for maximum email client compatibility.\n`;
    }
    clientPrompt += `Sign the email from ${senderName}.`;
    return clientPrompt;
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      const previewResponse = await emailAPI.execute({
        process: 'gen',
        prompt: formData.prompt,
        client_prompt: buildClientPrompt(),
        client_category: 'yolo',
        style: !formData.noStyle,
      });

      if (!previewResponse?.data || typeof previewResponse.data !== 'object') {
        toast.error('Failed to generate preview', { description: 'Invalid server response.' });
        return;
      }

      if (previewResponse.data.success === true) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', formData.prompt);
        workflow.completeStep(1);
        workflow.nextStep();
        toast.success('Preview generated!');
      } else {
        toast.error('Preview failed', { description: previewResponse.data.error || 'Failed to generate preview.' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to generate preview', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePreview = async () => {
    setIsLoading(true);
    try {
      const previewResponse = await emailAPI.execute({
        process: 'gen',
        prompt: formData.prompt,
        client_prompt: buildClientPrompt(),
        client_category: 'yolo',
        style: !formData.noStyle,
      });

      if (!previewResponse?.data || typeof previewResponse.data !== 'object') {
        toast.error('Failed to regenerate preview', { description: 'Invalid server response.' });
        return;
      }

      if (previewResponse.data.success === true) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', formData.prompt);
        toast.success('Preview regenerated!');
      } else {
        toast.error('Regeneration failed', { description: previewResponse.data.error || 'Failed to regenerate preview.' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to regenerate preview', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const sendResponse = await emailAPI.confirm({
        process: 'email',
        to_list: formData.toList,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        html: generatedHtml,
        prompt: formData.prompt,
        client_prompt: buildClientPrompt(),
        client_category: 'yolo',
        attachments: attachments
          .filter((a) => a.status === 'uploaded')
          .map((a) => ({ filename: a.filename, path: a.path })),
      });

      if (!sendResponse?.data || typeof sendResponse.data !== 'object') {
        const errorMsg = 'Invalid server response. Please try again.';
        toast.error('Failed to send email', { description: errorMsg });
        navigate('/result', { state: { error: errorMsg } });
        return;
      }

      if (sendResponse.data.success) {
        sessionStorage.removeItem('pendingPrompt');
        const newCount = incrementEmailsSentCount();
        setEmailsSentCount(newCount);
        setAttachments([]);
        workflow.completeStep(2);
        workflow.completeStep(3);
        toast.success('Email sent!');
        navigate('/result', {
          state: {
            email: generatedHtml,
            subject: formData.subject,
            to_list: formData.toList,
            cc: formData.cc,
            bcc: formData.bcc,
          },
        });
        addEmailsToPrevious([...formData.toList, ...formData.cc, ...formData.bcc]);
      } else {
        toast.error('Send failed', { description: sendResponse.data.error || 'Failed to send email.' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to send email', { description: errorMessage });
      navigate('/result', { state: { error: errorMessage } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachmentsAdd = (newFiles) => {
    const validated = newFiles.map((file) => {
      const validation = validateAttachmentFile(file);
      return {
        id: crypto.randomUUID(),
        file,
        filename: file.name,
        size: file.size,
        status: validation.valid ? 'uploading' : 'error',
        path: null,
        error: validation.message,
      };
    });
    setAttachments((prev) => [...prev, ...validated]);
    const pendingValid = validated.filter((a) => a.status === 'uploading');
    if (pendingValid.length > 0) uploadPendingAttachments(pendingValid.map((a) => a.file));
  };

  const handleAttachmentRemove = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const uploadPendingAttachments = async (files) => {
    try {
      const response = await emailAPI.uploadAttachments(files);
      if (response.data.success) {
        const { files: uploadedFiles } = response.data;
        setAttachments((prev) => prev.map((a) => {
          const uploaded = uploadedFiles.find((f) => f.filename === a.filename);
          return uploaded ? { ...a, status: 'uploaded', path: uploaded.path } : a;
        }));
      }
    } catch {
      setAttachments((prev) => prev.map((a) =>
        a.status === 'uploading' ? { ...a, status: 'error', error: 'Upload failed' } : a
      ));
    }
  };

  // ---- Render helpers for each step's inner content ----

  const renderRecipientStep = () => (
    <>
      <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
        Who's getting this email?
      </h2>
      <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
        Add recipient email addresses.
      </p>

      <div className="mb-4 sm:mb-6 space-y-4">
        <ChipInput
          label="To"
          placeholder="Add recipient email..."
          value={formData.toList}
          onChange={(emails) => setFormData((prev) => ({ ...prev, toList: emails }))}
          error={errors.toList}
          suggestions={previousEmails}
        />
        <AnimatePresence>
          {showCcBcc && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ChipInput
                label="CC (optional)"
                placeholder="Add CC..."
                value={formData.cc}
                onChange={(emails) => setFormData((prev) => ({ ...prev, cc: emails }))}
                error={errors.cc}
                suggestions={previousEmails}
              />
              <ChipInput
                label="BCC (optional)"
                placeholder="Add BCC..."
                value={formData.bcc}
                onChange={(emails) => setFormData((prev) => ({ ...prev, bcc: emails }))}
                error={errors.bcc}
                suggestions={previousEmails}
              />
            </Motion.div>
          )}
        </AnimatePresence>
        {!showCcBcc && (
          <button
            type="button"
            onClick={() => setShowCcBcc(true)}
            className="text-sm text-text-muted hover:text-accent transition-colors"
          >
            + Add CC / BCC
          </button>
        )}
        <Input
          name="recipientName"
          label="Recipient Name (optional)"
          placeholder="Jane Smith"
          value={formData.recipientName}
          onChange={handleChange}
        />
        <AttachmentInput
          attachments={attachments}
          onAdd={handleAttachmentsAdd}
          onRemove={handleAttachmentRemove}
          disabled={isLoading}
        />
      </div>
    </>
  );

  const renderDetailsStep = () => (
    <>
      <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
        What's this about?
      </h2>
      <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
        Give us the subject and your idea.
      </p>

      <div className="space-y-4">
        <Input
          name="subject"
          label="Subject Line"
          placeholder="Quick question about the project..."
          value={formData.subject}
          onChange={handleChange}
          error={errors.subject}
        />

        <Textarea
          name="prompt"
          label="Your Email Idea"
          placeholder="I need to follow up with the team about the presentation next week. Something friendly but professional that gets them to take action..."
          value={formData.prompt}
          onChange={handleChange}
          onModalSave={(val) => setFormData((prev) => ({ ...prev, prompt: val }))}
          error={errors.prompt}
          rows={5}
          expandable
          modal
        />

        <label
          htmlFor="noStyle"
          className="flex items-center gap-4 p-4 border cursor-pointer transition-all duration-150 border-border hover:border-text-muted"
        >
          <div className="relative w-5 h-5 flex-shrink-0">
            <input
              type="checkbox"
              id="noStyle"
              checked={formData.noStyle}
              onChange={(e) => setFormData((prev) => ({ ...prev, noStyle: e.target.checked }))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`w-5 h-5 border transition-all duration-150 flex items-center justify-center ${
                formData.noStyle ? 'bg-accent border-accent' : 'border-text-secondary bg-transparent'
              }`}
            >
              <svg
                className={`w-3 h-3 text-surface transition-opacity duration-150 ${
                  formData.noStyle ? 'opacity-100' : 'opacity-0'
                }`}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-text-primary block">No Style</span>
            <span className="text-xs text-text-muted">
              Plain text — no colors, no decorative elements, no HTML styling. Clean and professional.
            </span>
          </div>
        </label>
      </div>
    </>
  );

  const renderPreviewStep = () => (
    <>
      <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
        Review Your Email Preview
      </h2>
      <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
        Here's what your email looks like.
      </p>

      <div className="border border-border overflow-hidden mb-4 sm:mb-6">
        <div className="bg-surface-elevated px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">Email Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors min-h-10 px-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Visually
            </button>
            <button
              onClick={handleRegeneratePreview}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors min-h-10 px-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={() => {
                sessionStorage.setItem('previewHtml', generatedHtml);
                window.open('/preview', '_blank');
              }}
              title="View in Browser"
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors min-h-10 px-2"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          className="p-4 sm:p-6 bg-gray-900 max-h-64 sm:max-h-96 overflow-auto prose prose-sm max-w-none [&_table]:w-full email-preview"
          dangerouslySetInnerHTML={{
            __html: generatedHtml || '<p class="text-text-muted">No preview generated</p>',
          }}
        />
      </div>

      <div className="space-y-2 p-3 sm:p-4 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">To:</span>
          <span className="font-medium text-text-primary truncate ml-2">
            {formData.toList.join(', ')}
          </span>
        </div>
        {formData.cc.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">CC:</span>
            <span className="font-medium text-text-primary truncate ml-2">{formData.cc.join(', ')}</span>
          </div>
        )}
        {formData.bcc.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">BCC:</span>
            <span className="font-medium text-text-primary truncate ml-2">{formData.bcc.join(', ')}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Subject:</span>
          <span className="font-medium text-text-primary truncate ml-2">{formData.subject}</span>
        </div>
        {attachments.filter((a) => a.status === 'uploaded').length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Attachments:</span>
            <span className="font-medium text-text-primary truncate ml-2">
              {attachments.filter((a) => a.status === 'uploaded').length} file(s)
            </span>
          </div>
        )}
      </div>
    </>
  );

  const renderSendStep = () => (
    <>
      <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
        Ready to send
      </h2>
      <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
        One last check before this goes out.
      </p>

      <div className="space-y-3 p-4 border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Recipients</span>
          <span className="text-text-primary font-medium">{countRecipients(formData)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Subject</span>
          <span className="text-text-primary font-medium truncate ml-2 max-w-[60%] text-right">
            {formData.subject || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Attachments</span>
          <span className="text-text-primary font-medium">
            {attachments.filter((a) => a.status === 'uploaded').length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Style</span>
          <span className="text-text-primary font-medium">
            {formData.noStyle ? 'Plain text' : 'Styled HTML'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Emails sent (lifetime)</span>
          <span className="text-text-primary font-medium">{emailsSentCount}</span>
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <Layout>
        <WorkflowBackdrop />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative z-10">
          <MagicLoader
            title={workflow.currentStep === 2 ? 'Generating preview...' : 'Crafting your email...'}
            subtitle={workflow.currentStep === 2 ? 'Creating HTML email' : 'This is the fun part!'}
            variant="generating"
          />
        </div>
      </Layout>
    );
  }

  const currentStepMeta = yoloSteps[workflow.currentStep];

  return (
    <Layout>
      <WorkflowBackdrop />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl text-text-primary">
                YOLO Quick Send
              </h1>
              <p className="text-text-muted text-sm sm:text-base">
                Just tell us what you need
              </p>
            </div>
          </div>
        </Motion.div>

        {/* The lego-brick graph track */}
        <div className="mb-6 sm:mb-8 bg-surface-elevated/50 border border-border rounded-2xl backdrop-blur-sm">
          <GraphWorkflow
            steps={yoloSteps}
            currentStep={workflow.currentStep}
            completedSteps={workflow.completedSteps}
            visitedSteps={workflow.visitedSteps}
            onStepClick={handleNodeClick}
            canNavigateTo={workflow.canNavigateTo}
            getStepStatus={workflow.getStepStatus}
            isEdgeJustCompleted={workflow.isEdgeJustCompleted}
            registerNode={workflow.registerNode}
          />
        </div>

        {/* Form card with snap-in crossfade per step */}
        <StepPanel
          stepKey={workflow.currentStep}
          accent={currentStepMeta?.accent}
          label={currentStepMeta?.label}
          stepNumber={workflow.currentStep + 1}
          totalSteps={yoloSteps.length}
        >
          {workflow.currentStep === 0 && renderRecipientStep()}
          {workflow.currentStep === 1 && renderDetailsStep()}
          {workflow.currentStep === 2 && renderPreviewStep()}
          {workflow.currentStep === 3 && renderSendStep()}
        </StepPanel>

        {/* Nav buttons row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={workflow.currentStep === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {workflow.currentStep === 0 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 1 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              Generate Preview
            </Button>
          )}

          {workflow.currentStep === 2 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Continue to Send
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 3 && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSendEmail}
              className="w-full sm:w-auto"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Email
            </Button>
          )}
        </div>
      </div>

      <WysiwygEditorModal
        isOpen={isEditorOpen}
        html={generatedHtml}
        onSave={(edited) => {
          setGeneratedHtml(edited);
          toast.success('HTML updated!');
        }}
        onClose={() => setIsEditorOpen(false)}
      />
    </Layout>
  );
};

export default YoloEmailForm;
