import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { MagicLoader } from '../components/ui/MagicLoader';
import { HtmlEditorModal } from '../components/ui/HtmlEditorModal';
import { ChipInput } from '../components/ui/ChipInput';
import { AttachmentInput } from '../components/ui/AttachmentInput';
import { TemplateSelector } from '../components/TemplateSelector';
import { GraphWorkflow } from '../components/workflow/GraphWorkflow';
import { StepPanel } from '../components/workflow/StepPanel';
import { WorkflowBackdrop } from '../components/workflow/WorkflowBackdrop';
import { useGraphWorkflow } from '../hooks/useGraphWorkflow';
import { detailedSteps } from '../lib/workflowSteps';
import { emailAPI, configAPI } from '../lib/api';
import { validateEmail, validateRequired, validateAttachmentFile } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { getPreviousEmails, addEmailsToPrevious, fetchAndCachePreviousEmails } from '../lib/previousEmails';
import { ArrowLeft, Send, Sparkles, ChevronRight, ChevronLeft, Eye, RefreshCw, Pencil, List, Edit3, Globe } from 'lucide-react';
import { EmailPreview } from '../components/ui/EmailPreview';

// Helper function to parse client_prompt string into form fields
const parseClientPrompt = (clientPrompt) => {
  if (!clientPrompt) return {};

  const result = {};
  const lines = clientPrompt.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Subject: ...
    if (trimmed.startsWith('Subject:')) {
      const value = trimmed.slice(8).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.subject = value;
    }
    // Tone: ...
    else if (trimmed.startsWith('Tone:')) {
      const value = trimmed.slice(5).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.tone = value;
    }
    // Tone & style: ... (custom tone)
    else if (trimmed.startsWith('Tone & style:')) {
      const value = trimmed.slice(13).trim();
      if (value && value !== 'undefined') {
        result.customTone = value;
        result.useCustomTone = true;
      }
    }
    // Style: ...
    else if (trimmed.startsWith('Style:')) {
      const value = trimmed.slice(6).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.style = value;
    }
    // Font: ...
    else if (trimmed.startsWith('Font:')) {
      const value = trimmed.slice(5).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.font = value;
    }
    // Color theme: ...
    else if (trimmed.startsWith('Color theme:')) {
      const value = trimmed.slice(12).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.color = value;
    }
    // Overall feel: ...
    else if (trimmed.startsWith('Overall feel:')) {
      const value = trimmed.slice(13).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.feel = value;
    }
    // Email width: ...
    else if (trimmed.startsWith('Email width:')) {
      const value = trimmed.slice(12).replace(/%$/, '').replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.emailWidth = value;
    }
    // Border radius: ...
    else if (trimmed.startsWith('Border radius:')) {
      const value = trimmed.slice(14).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.borderRadius = value;
    }
    // Shadow: ...
    else if (trimmed.startsWith('Shadow:')) {
      const value = trimmed.slice(7).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.shadow = value;
    }
    // Spacing: ...
    else if (trimmed.startsWith('Spacing:')) {
      const value = trimmed.slice(8).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.spacing = value;
    }
    // Header style: ...
    else if (trimmed.startsWith('Header style:')) {
      const value = trimmed.slice(13).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.headerStyle = value;
    }
    // Word count: min-max words.
    else if (trimmed.startsWith('Word count:')) {
      const match = trimmed.match(/Word count:\s*(\d+)-(\d+)/);
      if (match) {
        result.wordCountMin = parseInt(match[1], 10);
        result.wordCountMax = parseInt(match[2], 10);
      }
    }
    // Plain text professional email... -> noStyle
    else if (trimmed.includes('Plain text professional email') || trimmed.includes('no HTML styling')) {
      result.noStyle = true;
    }
    // Key message: ...
    else if (trimmed.startsWith('Key message:')) {
      const value = trimmed.slice(12).replace(/\.$/, '').trim();
      if (value && value !== 'undefined') result.keyMessage = value;
    }
  }

  return result;
};

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

const toneOptions = [
  { value: 'professional', label: 'Professional', icon: ' Formal' },
  { value: 'friendly', label: 'Friendly', icon: ' Warm' },
  { value: 'casual', label: 'Casual', icon: ' Relaxed' },
  { value: 'formal', label: 'Formal', icon: ' Rigid' },
  { value: 'persuasive', label: 'Persuasive', icon: ' Strong' },
];

const customTonePlaceholder = `Describe the tone and style you want for your email...

Example: "Warm and approachable, like a mentor giving feedback over coffee. Professional but not stiff, with a touch of humor."`;

const styleOptions = [
  { value: 'minimal', label: 'Minimal', desc: 'Clean and simple' },
  { value: 'bold', label: 'Bold', desc: 'Make a statement' },
  { value: 'elegant', label: 'Elegant', desc: 'Sophisticated touch' },
  { value: 'corporate', label: 'Corporate', desc: 'Business-ready' },
];

const fontOptions = [
  { value: 'serif', label: 'Serif', desc: 'Classic, elegant' },
  { value: 'sans-serif', label: 'Sans-Serif', desc: 'Modern, clean' },
  { value: 'modern', label: 'Modern', desc: 'Fresh approach' },
  { value: 'playful', label: 'Playful', desc: 'Fun and creative' },
];

const colorOptions = [
  { value: 'navy', label: 'Navy Blue', color: '#1e3a5f' },
  { value: 'ocean', label: 'Ocean Blue', color: '#0077b6' },
  { value: 'forest', label: 'Forest Green', color: '#2d6a4f' },
  { value: 'sunset', label: 'Sunset Orange', color: '#e76f51' },
  { value: 'berry', label: 'Berry Purple', color: '#7b2cbf' },
  { value: 'midnight', label: 'Midnight', color: '#1a1a2e' },
  { value: 'rose', label: 'Rose Gold', color: '#b76e79' },
  { value: 'slate', label: 'Slate Gray', color: '#4a5568' },
];

const feelOptions = [
  { value: 'professional', label: 'Professional', desc: 'Business-ready' },
  { value: 'warm', label: 'Warm & Friendly', desc: 'Approachable' },
  { value: 'bold', label: 'Bold & Confident', desc: 'Strong presence' },
  { value: 'elegant', label: 'Elegant', desc: 'Sophisticated' },
  { value: 'playful', label: 'Playful', desc: 'Fun & energetic' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean & simple' },
  { value: 'creative', label: 'Creative', desc: 'Artistic flair' },
  { value: 'trustworthy', label: 'Trustworthy', desc: 'Reliable feel' },
];

const widthOptions = [
  { value: '50', label: 'Compact', desc: '50% width' },
  { value: '70', label: 'Standard', desc: '70% width' },
  { value: '100', label: 'Full Width', desc: '100% width' },
];

const borderRadiusOptions = [
  { value: 'none', label: 'None', desc: 'Sharp corners' },
  { value: 'small', label: 'Small', desc: 'Subtle rounding' },
  { value: 'medium', label: 'Medium', desc: 'Moderate rounding' },
  { value: 'large', label: 'Large', desc: 'Rounded corners' },
  { value: 'pill', label: 'Pill', desc: 'Fully rounded' },
];

const shadowOptions = [
  { value: 'none', label: 'None', desc: 'Flat design' },
  { value: 'light', label: 'Light', desc: 'Subtle shadow' },
  { value: 'medium', label: 'Medium', desc: 'Moderate depth' },
  { value: 'heavy', label: 'Heavy', desc: 'Strong depth' },
];

const spacingOptions = [
  { value: 'tight', label: 'Tight', desc: 'Compact spacing' },
  { value: 'normal', label: 'Normal', desc: 'Balanced spacing' },
  { value: 'spacious', label: 'Spacious', desc: ' airy feel' },
];

const headerStyleOptions = [
  { value: 'none', label: 'None', desc: 'No header image' },
  { value: 'banner', label: 'Banner', desc: 'Full-width banner' },
  { value: 'logo', label: 'Logo Center', desc: 'Centered logo' },
  { value: 'split', label: 'Split Design', desc: 'Text + image' },
];

const getEmailsSentCount = () => {
  const count = localStorage.getItem('emailsSentCount');
  return count ? parseInt(count, 10) : 0;
};

const incrementEmailsSentCount = () => {
  const newCount = getEmailsSentCount() + 1;
  localStorage.setItem('emailsSentCount', newCount.toString());
  return newCount;
};

// Count total recipients (toList + cc + bcc)

// Count total recipients (toList + cc + bcc)
const countRecipients = (data) => {
  const toListCount = Array.isArray(data.toList) ? data.toList.length : 0;
  const ccCount = Array.isArray(data.cc) ? data.cc.length : 0;
  const bccCount = Array.isArray(data.bcc) ? data.bcc.length : 0;
  return toListCount + ccCount + bccCount;
};

export const DetailedEmailForm = () => {
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
    tone: 'professional',
    style: 'minimal',
    font: 'serif',
    color: 'navy',
    feel: 'professional',
    emailWidth: '70',
    borderRadius: 'medium',
    shadow: 'light',
    spacing: 'normal',
    headerStyle: 'none',
    wordCountMin: 50,
    wordCountMax: 150,
    keyMessage: '',
    includeCTA: false,
    ctaText: '',
    noStyle: true,
    selectedTemplate: null,
  });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errors, setErrors] = useState({});
  const [useCustomTone, setUseCustomTone] = useState(false);
  const [customTone, setCustomTone] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Load previous emails for autocomplete
  const previousEmails = useMemo(() => {
    const cached = getPreviousEmails();
    if (cached.length === 0) {
      fetchAndCachePreviousEmails();
    }
    return cached;
  }, []);

  const handleAttachmentsAdd = (newFiles) => {
    const validated = newFiles.map(file => {
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
    setAttachments(prev => [...prev, ...validated]);

    const pendingValid = validated.filter(a => a.status === 'uploading');
    if (pendingValid.length > 0) {
      uploadPendingAttachments(pendingValid.map(a => a.file));
    }
  };

  const handleAttachmentRemove = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const uploadPendingAttachments = async (files) => {
    try {
      const response = await emailAPI.uploadAttachments(files);
      if (response.data.success) {
        const { files: uploadedFiles } = response.data;
        setAttachments(prev => prev.map(a => {
          const uploaded = uploadedFiles.find(f => f.filename === a.filename);
          return uploaded
            ? { ...a, status: 'uploaded', path: uploaded.path }
            : a;
        }));
      }
    } catch {
      setAttachments((prev) => prev.map((a) =>
        a.status === 'uploading' ? { ...a, status: 'error', error: 'Upload failed' } : a
      ));
    }
  };

  useEffect(() => {
    const historyData = location.state?.historyItem;
    if (historyData) {
      const parsedStyles = parseClientPrompt(historyData.client_prompt);
      setFormData(prev => ({
        ...prev,
        toList: Array.isArray(historyData.to_list) ? historyData.to_list : [],
        cc: Array.isArray(historyData.cc) ? historyData.cc : [],
        bcc: Array.isArray(historyData.bcc) ? historyData.bcc : [],
        recipientName: historyData.recipientName || prev.recipientName,
        subject: historyData.subject || prev.subject,
        prompt: historyData.prompt || prev.prompt,
        // Apply parsed styling fields from client_prompt
        tone: parsedStyles.tone || prev.tone,
        style: parsedStyles.style || prev.style,
        font: parsedStyles.font || prev.font,
        color: parsedStyles.color || prev.color,
        feel: parsedStyles.feel || prev.feel,
        emailWidth: parsedStyles.emailWidth || prev.emailWidth,
        borderRadius: parsedStyles.borderRadius || prev.borderRadius,
        shadow: parsedStyles.shadow || prev.shadow,
        spacing: parsedStyles.spacing || prev.spacing,
        headerStyle: parsedStyles.headerStyle || prev.headerStyle,
        wordCountMin: parsedStyles.wordCountMin || prev.wordCountMin,
        wordCountMax: parsedStyles.wordCountMax || prev.wordCountMax,
        keyMessage: parsedStyles.keyMessage || prev.keyMessage,
        noStyle: parsedStyles.noStyle !== undefined ? parsedStyles.noStyle : prev.noStyle,
      }));
      // Apply custom tone if present
      if (parsedStyles.useCustomTone) {
        setUseCustomTone(true);
        setCustomTone(parsedStyles.customTone || '');
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.get();
        setFromName(response.data.from_name || 'Anonymous');
      } catch (error) {
        console.error('Failed to load config:', error);
        setFromName('Anonymous');
      }
    };
    loadConfig();
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validators array: one fn per step, returns null when valid or an errors obj.
  // Only the basics step needs user-input validation; tone/content/preview/send
  // are gated by the underlying API call.
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
      if (!validateRequired(formData.subject, 'Subject')) errs.subject = 'Subject is required';
      if (!validateRequired(formData.prompt, 'Main message')) {
        errs.prompt = 'Please tell us what your email is about';
      }
      return Object.keys(errs).length ? errs : null;
    },
    null, // tone — no advance-time validation
    null, // content
    null, // template — always passes, optional
    null, // preview
    null, // send
  ];

  const workflow = useGraphWorkflow({ steps: detailedSteps, validators });

  const showValidationErrors = (errs) => {
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before continuing', {
        description: Object.values(errs)[0],
      });
    }
  };

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
      workflow.completeStep(1);
      workflow.nextStep();
      return;
    }
    if (workflow.currentStep === 2) {
      // Content -> Template: just advance
      workflow.completeStep(2);
      workflow.nextStep();
      return;
    }
    if (workflow.currentStep === 3) {
      // Template -> Preview: generate preview then advance
      await handleGeneratePreview();
      return;
    }
    if (workflow.currentStep === 4) {
      // Preview -> Send: just advance
      workflow.completeStep(4);
      workflow.nextStep();
      return;
    }
  };

  const handleBack = () => workflow.prevStep();

  const handleNodeClick = (index) => {
    if (workflow.canNavigateTo(index)) {
      workflow.goToStep(index);
    }
  };

  const buildClientPrompt = () => {
    let clientPrompt = '';
    const recipientName = formData.recipientName.trim();
    if (recipientName) {
      clientPrompt += `Recipient name: ${recipientName}.\n`;
    }
    clientPrompt += `Subject: ${formData.subject}.\n`;

    if (formData.selectedTemplate) {
      // Template is sent via html_template param, not client_prompt.
      // Just provide injection context here.
      clientPrompt += `Use the provided HTML template as the base layout. Fill in {{header}} with a relevant header/title based on the email content. Fill in {{body}} with the main email body content. Fill in {{footer}} with a footer (e.g., company name or unsubscribe link). Fill in {{title}} with an appropriate page title.\n`;
    }

    if (useCustomTone && customTone.trim()) {
      clientPrompt += `Tone & style: ${customTone}\n`;
    } else {
      clientPrompt += `Tone: ${formData.tone}.\n`;
      clientPrompt += `Style: ${formData.style}.\n`;
      clientPrompt += `Font: ${formData.font}.\n`;
      clientPrompt += `Color theme: ${formData.color}.\n`;
      clientPrompt += `Overall feel: ${formData.feel}.\n`;
      clientPrompt += `Email width: ${formData.emailWidth}%.\n`;
      clientPrompt += `Border radius: ${formData.borderRadius}.\n`;
      clientPrompt += `Shadow: ${formData.shadow}.\n`;
      clientPrompt += `Spacing: ${formData.spacing}.\n`;
      clientPrompt += `Header style: ${formData.headerStyle}.\n`;
    }

    if (formData.noStyle) {
      clientPrompt += `Plain text professional email, no HTML styling, no decorative elements.\n`;
    } else {
      clientPrompt += `CRITICAL: Apply ALL selected styles aggressively. The email MUST be visually impressive with rich inline CSS — bold colors, elegant fonts, proper spacing, borders, shadows where appropriate, and professional table layouts. This is not optional. Every style selection must be visibly reflected in the final email. Make it eye-catching and polished.\n`;
    }

    clientPrompt += `Word count: ${formData.wordCountMin}-${formData.wordCountMax} words.\n`;
    if (formData.keyMessage) {
      clientPrompt += `Key message: ${formData.keyMessage}.\n`;
    }
    if (formData.includeCTA && formData.ctaText) {
      clientPrompt += `Call to action: ${formData.ctaText}.\n`;
    }
    const senderName = getSenderName(user, fromName);
    clientPrompt += `Sign the email from ${senderName}.`;
    return clientPrompt;
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);

    try {
      const clientPrompt = buildClientPrompt();

      const previewPayload = {
        process: 'gen',
        prompt: formData.prompt, // User's actual input
        client_prompt: clientPrompt,
        client_category: 'detail',
        style: !formData.noStyle,
      };

      // Inject HTML template if a template is selected
      if (formData.selectedTemplate?.html) {
        previewPayload.html_template = formData.selectedTemplate.html;
      }

      const previewResponse = await emailAPI.execute(previewPayload);

      // Validate response structure before accessing
      if (!previewResponse?.data || typeof previewResponse.data !== 'object') {
        console.error('[DetailedEmailForm] Invalid preview response:', previewResponse);
        toast.error('Failed to generate preview', {
          description: 'Invalid server response. Please try again.',
        });
        return;
      }

      if (previewResponse.data.success === true) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', formData.prompt);
        workflow.completeStep(3);
        workflow.nextStep(); // Move to preview step (step 4)
        toast.success('Preview generated!');
      } else {
        const errorMsg = previewResponse.data.error || 'Failed to generate preview.';
        toast.error('Preview failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('[DetailedEmailForm] Preview generation failed:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to generate preview', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePreview = async () => {
    setIsLoading(true);

    try {
      const clientPrompt = buildClientPrompt();

      const previewPayload = {
        process: 'gen',
        prompt: formData.prompt, // User's actual input
        client_prompt: clientPrompt,
        client_category: 'detail',
        style: !formData.noStyle,
      };

      // Inject HTML template if a template is selected
      if (formData.selectedTemplate?.html) {
        previewPayload.html_template = formData.selectedTemplate.html;
      }

      const previewResponse = await emailAPI.execute(previewPayload);

      // Validate response structure before accessing
      if (!previewResponse?.data || typeof previewResponse.data !== 'object') {
        console.error('[DetailedEmailForm] Invalid regenerate response:', previewResponse);
        toast.error('Failed to regenerate preview', {
          description: 'Invalid server response. Please try again.',
        });
        return;
      }

      if (previewResponse.data.success === true) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', formData.prompt);
        toast.success('Preview regenerated!');
      } else {
        const errorMsg = previewResponse.data.error || 'Failed to regenerate preview.';
        toast.error('Regeneration failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('[DetailedEmailForm] Regenerate preview failed:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to regenerate preview', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);

    try {
      const clientPrompt = buildClientPrompt();

      const confirmPayload = {
        process: 'email',
        to_list: formData.toList,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        html: generatedHtml,
        prompt: formData.prompt, // User's actual input
        client_prompt: clientPrompt,
        client_category: 'detail',
        attachments: attachments
          .filter(a => a.status === 'uploaded')
          .map(a => ({ filename: a.filename, path: a.path })),
      };

      const sendResponse = await emailAPI.confirm(confirmPayload);

      // Validate response structure before accessing
      if (!sendResponse?.data || typeof sendResponse.data !== 'object') {
        console.error('[DetailedEmailForm] Invalid send response:', sendResponse);
        const errorMsg = 'Invalid server response. Please try again.';
        toast.error('Failed to send email', { description: errorMsg });
        navigate('/result', { state: { error: errorMsg } });
        return;
      }

      if (sendResponse.data.success) {
        sessionStorage.removeItem('pendingPrompt');
        incrementEmailsSentCount();
        setAttachments([]);
        toast.success('Email sent!');
        navigate('/result', {
          state: {
            email: generatedHtml,
            subject: formData.subject,
            to_list: formData.toList,
            cc: formData.cc,
            bcc: formData.bcc,
            mode: 'detailed',
          }
        });
        // Update previous emails cache with recipients from this email
        addEmailsToPrevious([...formData.toList, ...formData.cc, ...formData.bcc]);
      } else {
        const errorMsg = sendResponse.data.error || 'Failed to send email.';
        toast.error('Send failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('[DetailedEmailForm] Send email failed:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error('Failed to send email', {
        description: errorMessage,
      });
      navigate('/result', {
        state: { error: errorMessage }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (workflow.currentStep) {
      case 0:
        return (
          <Motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl text-text-primary mb-2">
              The Basics
            </h2>
            <p className="text-text-secondary mb-6">
              Start with who's receiving this and what it's about.
            </p>

            <div className="space-y-4">
              <ChipInput
                label="To"
                placeholder="Add recipient email..."
                value={formData.toList}
                onChange={(emails) => updateFormData('toList', emails)}
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
                      onChange={(emails) => updateFormData('cc', emails)}
                      error={errors.cc}
                      suggestions={previousEmails}
                    />

                    <ChipInput
                      label="BCC (optional)"
                      placeholder="Add BCC..."
                      value={formData.bcc}
                      onChange={(emails) => updateFormData('bcc', emails)}
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
                label="Recipient Name (optional)"
                placeholder="Jane Smith"
                value={formData.recipientName}
                onChange={(e) => updateFormData('recipientName', e.target.value)}
              />

              <Input
                label="Subject Line"
                placeholder="Quick question about..."
                value={formData.subject}
                onChange={(e) => updateFormData('subject', e.target.value)}
                error={errors.subject}
              />

              <Textarea
                label="What do you want to say?"
                placeholder="I need to reach out to the marketing team about the upcoming product launch. They need to review the deck and give their feedback by Friday..."
                value={formData.prompt}
                onChange={(e) => updateFormData('prompt', e.target.value)}
                onModalSave={(val) => updateFormData('prompt', val)}
                error={errors.prompt}
                rows={4}
                expandable
                modal
              />

              <AttachmentInput
                attachments={attachments}
                onAdd={handleAttachmentsAdd}
                onRemove={handleAttachmentRemove}
                disabled={isLoading}
              />
            </div>
          </Motion.div>
        );

      case 1:
        return (
          <Motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl text-text-primary mb-2">
              Tone & Style
            </h2>
            <p className="text-text-secondary mb-6">
              Set the mood. How do you want this email to feel?
            </p>

            <div className="space-y-8">
              {/* Tone Toggle */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-3 block">
                  Choose how to define your tone
                </label>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setUseCustomTone(false)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 p-3 border transition-all
                      ${!useCustomTone
                        ? 'border-accent bg-surface-elevated text-text-primary'
                        : 'border-border text-text-muted hover:border-text-muted'}
                    `}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">Pick presets</span>
                  </button>
                  <button
                    onClick={() => setUseCustomTone(true)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 p-3 border transition-all
                      ${useCustomTone
                        ? 'border-accent bg-surface-elevated text-text-primary'
                        : 'border-border text-text-muted hover:border-text-muted'}
                    `}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium">Describe my own</span>
                  </button>
                </div>
              </div>

              {/* Preset Tone Options */}
              <AnimatePresence>
                {!useCustomTone && (
                  <Motion.div
                    key="preset-tone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-sm font-medium text-text-secondary mb-3 block">
                      Choose a tone
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {toneOptions.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => updateFormData('tone', tone.value)}
                          className={`
                            p-3 border transition-all text-left
                            ${formData.tone === tone.value
                              ? 'border-accent bg-surface-elevated text-text-primary'
                              : 'border-border text-text-muted hover:border-text-muted'}
                          `}
                        >
                          <span className="text-sm font-medium text-text-primary block">{tone.label}</span>
                          <span className="text-xs text-text-muted">{tone.icon}</span>
                        </button>
                      ))}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Custom Tone Input */}
              <AnimatePresence>
                {useCustomTone && (
                  <Motion.div
                    key="custom-tone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-sm font-medium text-text-secondary mb-3 block">
                      Describe your desired tone & style
                    </label>
                    <Textarea
                      placeholder={customTonePlaceholder}
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      rows={5}
                      className="bg-surface-input border-border"
                    />
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* All other styling options - only show when using presets */}
              <AnimatePresence>
                {!useCustomTone && (
                  <Motion.div
                    key="all-options"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Colors */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Color theme
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateFormData('color', color.value)}
                            className={`
                              p-3 border transition-all text-left flex items-center gap-3
                              ${formData.color === color.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span
                              className="w-6 h-6 border border-border flex-shrink-0"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="text-sm font-medium text-text-primary">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feel */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Overall feel
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {feelOptions.map((feel) => (
                          <button
                            key={feel.value}
                            onClick={() => updateFormData('feel', feel.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.feel === feel.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{feel.label}</span>
                            <span className="text-xs text-text-muted">{feel.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Email Width */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Email width
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {widthOptions.map((width) => (
                          <button
                            key={width.value}
                            onClick={() => updateFormData('emailWidth', width.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.emailWidth === width.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{width.label}</span>
                            <span className="text-xs text-text-muted">{width.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Corner style
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {borderRadiusOptions.map((radius) => (
                          <button
                            key={radius.value}
                            onClick={() => updateFormData('borderRadius', radius.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.borderRadius === radius.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{radius.label}</span>
                            <span className="text-xs text-text-muted">{radius.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shadow */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Shadow depth
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {shadowOptions.map((shadow) => (
                          <button
                            key={shadow.value}
                            onClick={() => updateFormData('shadow', shadow.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.shadow === shadow.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{shadow.label}</span>
                            <span className="text-xs text-text-muted">{shadow.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Content spacing
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {spacingOptions.map((spacing) => (
                          <button
                            key={spacing.value}
                            onClick={() => updateFormData('spacing', spacing.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.spacing === spacing.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{spacing.label}</span>
                            <span className="text-xs text-text-muted">{spacing.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Header Style */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Header style
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {headerStyleOptions.map((header) => (
                          <button
                            key={header.value}
                            onClick={() => updateFormData('headerStyle', header.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.headerStyle === header.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{header.label}</span>
                            <span className="text-xs text-text-muted">{header.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Font style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {fontOptions.map((font) => (
                          <button
                            key={font.value}
                            onClick={() => updateFormData('font', font.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.font === font.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{font.label}</span>
                            <span className="text-xs text-text-muted">{font.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Style */}
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-3 block">
                        Overall style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {styleOptions.map((style) => (
                          <button
                            key={style.value}
                            onClick={() => updateFormData('style', style.value)}
                            className={`
                              p-3 border transition-all text-left
                              ${formData.style === style.value
                                ? 'border-accent bg-surface-elevated'
                                : 'border-border hover:border-text-muted'}
                            `}
                          >
                            <span className="text-sm font-medium text-text-primary block">{style.label}</span>
                            <span className="text-xs text-text-muted">{style.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </Motion.div>
        );

      case 2:
        return (
          <Motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl text-text-primary mb-2">
              Content Details
            </h2>
            <p className="text-text-secondary mb-6">
              Fine-tune the specifics.
            </p>

            <div className="space-y-6">
              {/* Word Count */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-3 block">
                  Preferred word count
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFormData('wordCountMin', Math.max(20, formData.wordCountMin - 25))}
                      className="p-2 border border-border hover:border-text-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium text-text-primary">{formData.wordCountMin}</span>
                    <button
                      onClick={() => updateFormData('wordCountMin', Math.min(formData.wordCountMax - 25, formData.wordCountMin + 25))}
                      className="p-2 border border-border hover:border-text-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-text-muted">to</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFormData('wordCountMax', Math.max(formData.wordCountMin + 25, formData.wordCountMax - 25))}
                      className="p-2 border border-border hover:border-text-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium text-text-primary">{formData.wordCountMax}</span>
                    <button
                      onClick={() => updateFormData('wordCountMax', Math.min(500, formData.wordCountMax + 25))}
                      className="p-2 border border-border hover:border-text-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Message */}
              <Textarea
                label="Key message (optional)"
                placeholder="The most important thing I want them to remember or do after reading this..."
                value={formData.keyMessage}
                onChange={(e) => updateFormData('keyMessage', e.target.value)}
                onModalSave={(val) => updateFormData('keyMessage', val)}
                rows={2}
                expandable
                modal
              />

              {/* CTA Toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-secondary">
                    Include a call-to-action button?
                  </label>
                  <button
                    onClick={() => updateFormData('includeCTA', !formData.includeCTA)}
                    className={`
                      w-12 h-6 border transition-colors relative overflow-hidden
                      ${formData.includeCTA ? 'border-accent bg-accent' : 'border-border bg-surface-elevated'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 bg-surface absolute top-0.5 transition-transform
                      ${formData.includeCTA ? 'translate-x-6' : 'translate-x-0.5'}
                    }`}
                    style={{ left: formData.includeCTA ? 'calc(100% - 20px - 2px)' : '2px' }}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {formData.includeCTA && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Input
                        placeholder="Book a call"
                        value={formData.ctaText}
                        onChange={(e) => updateFormData('ctaText', e.target.value)}
                      />
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* No Style Option */}
              <label
                htmlFor="noStyle"
                className="flex items-center gap-4 p-4 border cursor-pointer transition-all duration-150
                  border-border hover:border-text-muted"
              >
                {/* Custom checkbox */}
                <div className="relative w-5 h-5 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="noStyle"
                    checked={formData.noStyle}
                    onChange={(e) => updateFormData('noStyle', e.target.checked)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-5 h-5 border transition-all duration-150 flex items-center justify-center
                    ${formData.noStyle ? 'bg-accent border-accent' : 'border-text-secondary bg-transparent'}`}>
                    <svg
                      className={`w-3 h-3 text-surface transition-opacity duration-150 ${formData.noStyle ? 'opacity-100' : 'opacity-0'}`}
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
                {/* Label text */}
                <div className="flex-1">
                  <span className="text-sm font-medium text-text-primary block">No Style</span>
                  <span className="text-xs text-text-muted">Plain text — no colors, no decorative elements, no HTML styling. Clean and professional.</span>
                </div>
              </label>
            </div>
          </Motion.div>
        );

      case 3:
        return (
          <TemplateSelector
            onSelectTemplate={(template) => {
              setFormData((prev) => ({ ...prev, selectedTemplate: template }));
            }}
            onSkip={() => {
              setFormData((prev) => ({ ...prev, selectedTemplate: null }));
            }}
          />
        );

      case 4:
        return (
          <Motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-lg sm:text-xl text-text-primary mb-2">
              Review Your Email Preview
            </h2>
            <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
              Here's what your email looks like.
            </p>

            {/* Preview Section */}
            <div className="border border-border overflow-hidden mb-4 sm:mb-6">
              <div className="bg-surface-elevated px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Email Preview</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors min-h-10 px-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit HTML
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
                  className="relative p-4 sm:p-6 bg-gray-900 min-h-64 sm:min-h-96 overflow-auto"
                >
                  <EmailPreview html={generatedHtml || ''} />
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-3 text-sm sm:text-base">
              <div className="p-3 border border-border">
                <p className="text-xs text-text-muted mb-1">To</p>
                <p className="text-sm font-medium text-text-primary truncate">{formData.toList.join(', ')}</p>
              </div>

              {formData.cc.length > 0 && (
                <div className="p-3 border border-border">
                  <p className="text-xs text-text-muted mb-1">CC</p>
                  <p className="text-sm font-medium text-text-primary truncate">{formData.cc.join(', ')}</p>
                </div>
              )}

              {formData.bcc.length > 0 && (
                <div className="p-3 border border-border">
                  <p className="text-xs text-text-muted mb-1">BCC</p>
                  <p className="text-sm font-medium text-text-primary truncate">{formData.bcc.join(', ')}</p>
                </div>
              )}

              <div className="p-3 border border-border">
                <p className="text-xs text-text-muted mb-1">Subject</p>
                <p className="text-sm font-medium text-text-primary truncate">{formData.subject}</p>
              </div>

              <div className="p-3 border border-border">
                <p className="text-xs text-text-muted mb-1">Tone & Style</p>
                {useCustomTone && customTone.trim() ? (
                  <p className="text-sm text-text-secondary italic">Custom: {customTone.substring(0, 100)}{customTone.length > 100 ? '...' : ''}</p>
                ) : (
                  <p className="text-sm font-medium text-text-primary capitalize">
                    {formData.tone} - {formData.style}
                  </p>
                )}
              </div>

              <div className="p-3 border border-border">
                <p className="text-xs text-text-muted mb-1">Design Choices</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 border border-border text-xs">
                    <span
                      className="w-3 h-3 border border-border"
                      style={{ backgroundColor: colorOptions.find(c => c.value === formData.color)?.color || '#1e3a5f' }}
                    />
                    {colorOptions.find(c => c.value === formData.color)?.label}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 border border-border text-xs">
                    {formData.emailWidth}% width
                  </span>
                  <span className="inline-flex items-center px-2 py-1 border border-border text-xs capitalize">
                    {formData.borderRadius} corners
                  </span>
                  <span className="inline-flex items-center px-2 py-1 border border-border text-xs capitalize">
                    {formData.shadow} shadow
                  </span>
                </div>
              </div>

              <div className="p-3 border border-border">
                <p className="text-xs text-text-muted mb-1">Your message</p>
                <p className="text-sm text-text-secondary line-clamp-2">{formData.prompt}</p>
              </div>

              {attachments.filter(a => a.status === 'uploaded').length > 0 && (
                <div className="p-3 border border-border">
                  <p className="text-xs text-text-muted mb-1">Attachments</p>
                  <p className="text-sm font-medium text-text-primary">
                    {attachments.filter(a => a.status === 'uploaded').length} file(s) attached
                  </p>
                </div>
              )}
            </div>
          </Motion.div>
        );

      case 5:
        return (
          <>
            <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
              Ready to send
            </h2>
            <p className="text-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
              One last look at the design choices before this goes out.
            </p>

            <div className="space-y-3">
              <div className="p-3 sm:p-4 border border-border space-y-2">
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
                  <span className="text-text-muted">Tone</span>
                  <span className="text-text-primary font-medium capitalize">
                    {useCustomTone && customTone.trim()
                      ? `Custom: ${customTone.substring(0, 40)}${customTone.length > 40 ? '…' : ''}`
                      : formData.tone}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Style</span>
                  <span className="text-text-primary font-medium capitalize">{formData.style}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Color</span>
                  <span className="text-text-primary font-medium flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-border"
                      style={{ backgroundColor: colorOptions.find(c => c.value === formData.color)?.color }}
                    />
                    {colorOptions.find(c => c.value === formData.color)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Word count</span>
                  <span className="text-text-primary font-medium">
                    {formData.wordCountMin}–{formData.wordCountMax}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Attachments</span>
                  <span className="text-text-primary font-medium">
                    {attachments.filter(a => a.status === 'uploaded').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">No style</span>
                  <span className="text-text-primary font-medium">{formData.noStyle ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <WorkflowBackdrop />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative z-10">
          <MagicLoader
            title={workflow.currentStep === 2 ? 'Generating preview...' : 'Crafting your masterpiece...'}
            subtitle={workflow.currentStep === 2 ? 'Creating HTML email' : 'Every detail matters'}
            variant="generating"
          />
        </div>
      </Layout>
    );
  }

  const currentStepMeta = detailedSteps[workflow.currentStep];

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
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl text-text-primary">
                Craft with Care
              </h1>
              <p className="text-text-muted text-sm sm:text-base">Every detail, perfected</p>
            </div>
          </div>
        </Motion.div>

        <div className="mb-6 sm:mb-8 bg-surface-elevated/50 border border-border rounded-2xl backdrop-blur-sm">
          <GraphWorkflow
            steps={detailedSteps}
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

        <StepPanel
          stepKey={workflow.currentStep}
          accent={currentStepMeta?.accent}
          label={currentStepMeta?.label}
          stepNumber={workflow.currentStep + 1}
          totalSteps={detailedSteps.length}
        >
          {renderStep()}
        </StepPanel>

        <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 ${workflow.currentStep === 5 ? 'sm:flex-col-reverse sm:gap-4' : ''}`}>
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={workflow.currentStep === 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {workflow.currentStep === 0 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 1 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 2 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 3 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              Generate Preview
            </Button>
          )}

          {workflow.currentStep === 4 && (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Continue to Send
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {workflow.currentStep === 5 && (
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

      <HtmlEditorModal
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

export default DetailedEmailForm;
