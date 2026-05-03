import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { MagicLoader } from '../components/ui/MagicLoader';
import { ProgressSteps } from '../components/ui/ProgressSteps';
import { HtmlEditorModal } from '../components/ui/HtmlEditorModal';
import { ChipInput } from '../components/ui/ChipInput';
import { emailAPI, configAPI } from '../lib/api';
import { validateEmail, validateRequired } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Sparkles, ChevronRight, ChevronLeft, Eye, RefreshCw, Pencil, List, Code } from 'lucide-react';

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

const steps = ['Basics', 'Tone & Style', 'Content', 'Preview'];

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
  const [currentStep, setCurrentStep] = useState(0);
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
  });
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errors, setErrors] = useState({});
  const [useCustomTone, setUseCustomTone] = useState(false);
  const [customTone, setCustomTone] = useState('');
  const [emailsSentCount, setEmailsSentCount] = useState(getEmailsSentCount);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
  };

  const handleSaveHtml = (editedHtml) => {
    setGeneratedHtml(editedHtml);
    toast.success('HTML updated!');
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  useEffect(() => {
    const historyData = location.state?.historyItem;
    if (historyData) {
      setFormData(prev => ({
        ...prev,
        toList: Array.isArray(historyData.to_list) ? historyData.to_list : [],
        cc: Array.isArray(historyData.cc) ? historyData.cc : [],
        bcc: Array.isArray(historyData.bcc) ? historyData.bcc : [],
        recipientName: historyData.recipientName || prev.recipientName,
        subject: historyData.subject || prev.subject,
        prompt: historyData.prompt || prev.prompt,
      }));
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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validate toList as primary recipient field
      if (!Array.isArray(formData.toList) || formData.toList.length === 0) {
        newErrors.toList = 'Please add at least one recipient';
      } else {
        // Validate each email in arrays
        const validateArrayEmails = (arr, fieldName) => {
          if (!Array.isArray(arr)) return '';
          for (const email of arr) {
            if (!validateEmail(email)) {
              return `Invalid email in ${fieldName}: ${email}`;
            }
          }
          return '';
        };

        const toListError = validateArrayEmails(formData.toList, 'To List');
        if (toListError) newErrors.toList = toListError;

        const ccError = validateArrayEmails(formData.cc, 'CC');
        if (ccError) newErrors.cc = ccError;

        const bccError = validateArrayEmails(formData.bcc, 'BCC');
        if (bccError) newErrors.bcc = bccError;

        const totalRecipients = countRecipients(formData);
        if (totalRecipients > 50) {
          newErrors.toList = `Too many recipients (${totalRecipients}). Maximum is 50.`;
        }
      }

      if (!validateRequired(formData.subject, 'Subject')) {
        newErrors.subject = 'Subject is required';
      }
      if (!validateRequired(formData.prompt, 'Main message')) {
        newErrors.prompt = 'Please tell us what your email is about';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const buildEnhancedPrompt = () => {
    let enhancedPrompt = `In essence the email should say this: '${formData.prompt}'. Be very creative in delivering the best style, grammar, and beauty of the message.`;

    const recipientName = formData.recipientName.trim() || extractNameFromEmail(formData.toList[0] || '');
    enhancedPrompt += `\n\nThe Recipient name is ${recipientName}.`;
    enhancedPrompt += `\n\nCONTEXT ONLY - DO NOT INCLUDE IN EMAIL: The expected subject for this email is '${formData.subject}'. Use this subject line only as guidance for the tone and direction of your message. The actual email body must NOT contain or repeat the subject line. Write only the email body content itself — no subject, no headers indicating the subject.`;

    if (formData.noStyle) {
      enhancedPrompt += `\n\nIMPORTANT - NO STYLE MODE: This is a professional business email. Do NOT use any HTML styling, decorative elements, background colors, gradients, shadows, or fancy layouts. Format the email as plain, clean text content using only the following HTML elements: paragraphs (<p>), line breaks (<br>), bold text (<b> or <strong>), and simple lists (<ul>/<li> if needed). Use only basic inline CSS for font-family (Arial or sans-serif), font-size (14-16px), line-height (1.5), and color (black or #333333 on white background). The email should look like a simple, professional plain-text message. No headers with colored backgrounds, no colored borders, no fancy buttons, no decorative elements whatsoever. Keep it clean, minimal, and highly readable.`;
    } else {
      if (useCustomTone && customTone.trim()) {
        enhancedPrompt += `\n\nTone & Style Description: ${customTone}`;
      } else {
        enhancedPrompt += `\n\nTone: ${formData.tone}`;
        enhancedPrompt += `\nStyle: ${formData.style}`;
        enhancedPrompt += `\nFont preference: ${formData.font}`;
        enhancedPrompt += `\nColor theme: ${formData.color}`;
        enhancedPrompt += `\nOverall feel: ${formData.feel}`;
        enhancedPrompt += `\nEmail width: ${formData.emailWidth}%`;
        enhancedPrompt += `\nBorder radius: ${formData.borderRadius}`;
        enhancedPrompt += `\nShadow depth: ${formData.shadow}`;
        enhancedPrompt += `\nContent spacing: ${formData.spacing}`;
        enhancedPrompt += `\nHeader style: ${formData.headerStyle}`;
      }
    }

    enhancedPrompt += `\nWord count: ${formData.wordCountMin}-${formData.wordCountMax} words`;
    if (formData.keyMessage) {
      enhancedPrompt += `\n\nIn essence the key message should say this: '${formData.keyMessage}'. Be very creative in delivering the best style, grammar, and beauty of the key message.`;
    }
    if (formData.includeCTA && formData.ctaText) {
      enhancedPrompt += `\nCall to action: ${formData.ctaText}`;
    }
    const senderName = getSenderName(user, fromName);
    enhancedPrompt += `\n\nSign the email that it is from ${senderName}.`;
    return enhancedPrompt;
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);

    try {
      const enhancedPrompt = buildEnhancedPrompt();

      const previewPayload = {
        process: 'gen',
        prompt: enhancedPrompt,
      };

      const previewResponse = await emailAPI.execute(previewPayload);

      if (previewResponse.data.success) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', enhancedPrompt);
        setCurrentStep(3);
        toast.success('Preview generated!');
      } else {
        const errorMsg = previewResponse.data.error || 'Failed to generate preview.';
        toast.error('Preview failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
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
      const enhancedPrompt = buildEnhancedPrompt();

      const previewPayload = {
        process: 'gen',
        prompt: enhancedPrompt,
      };

      const previewResponse = await emailAPI.execute(previewPayload);

      if (previewResponse.data.success) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', enhancedPrompt);
        toast.success('Preview regenerated!');
      } else {
        const errorMsg = previewResponse.data.error || 'Failed to regenerate preview.';
        toast.error('Regeneration failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
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
      const savedPrompt = sessionStorage.getItem('pendingPrompt') || '';

      const confirmPayload = {
        process: 'email',
        to_list: formData.toList,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        html: generatedHtml,
        prompt: savedPrompt,
      };

      const sendResponse = await emailAPI.confirm(confirmPayload);

      if (sendResponse.data.success) {
        sessionStorage.removeItem('pendingPrompt');
        const newCount = incrementEmailsSentCount();
        setEmailsSentCount(newCount);
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
      } else {
        const errorMsg = sendResponse.data.error || 'Failed to send email.';
        toast.error('Send failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
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
    switch (currentStep) {
      case 0:
        return (
          <motion.div
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
              />

              <ChipInput
                label="CC (optional)"
                placeholder="Add CC..."
                value={formData.cc}
                onChange={(emails) => updateFormData('cc', emails)}
                error={errors.cc}
              />

              <ChipInput
                label="BCC (optional)"
                placeholder="Add BCC..."
                value={formData.bcc}
                onChange={(emails) => updateFormData('bcc', emails)}
                error={errors.bcc}
              />

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
                error={errors.prompt}
                rows={4}
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
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
                  <motion.div
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Tone Input */}
              <AnimatePresence>
                {useCustomTone && (
                  <motion.div
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* All other styling options - only show when using presets */}
              <AnimatePresence>
                {!useCustomTone && (
                  <motion.div
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
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
                rows={2}
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Input
                        placeholder="Book a call"
                        value={formData.ctaText}
                        onChange={(e) => updateFormData('ctaText', e.target.value)}
                      />
                    </motion.div>
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
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
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
                    onClick={handleOpenEditor}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors min-h-10 px-2"
                  >
                    <Code className="w-4 h-4" />
                    Edit HTML
                  </button>
                  <button
                    onClick={handleRegeneratePreview}
                    className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors min-h-10 px-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              </div>
              <div
                className="p-4 sm:p-6 bg-surface-card max-h-64 sm:max-h-96 overflow-auto [&_table]:w-full email-preview"
                dangerouslySetInnerHTML={{ __html: generatedHtml || '<p class="text-text-muted">No preview generated</p>' }}
              />
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
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <MagicLoader
            title={currentStep === 3 ? 'Generating preview...' : 'Crafting your masterpiece...'}
            subtitle={currentStep === 3 ? 'Creating HTML email' : 'Every detail matters'}
            variant="generating"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
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
        </motion.div>

        {/* Progress */}
        <div className="mb-6 sm:mb-8">
          <ProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <Card variant="bordered" className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 sm:mt-8 pt-6 border-t border-border ${currentStep === 3 ? 'sm:flex-col-reverse sm:gap-4' : ''}`}>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 0 && (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 1 && (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button onClick={handleGeneratePreview} className="w-full sm:w-auto">
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            )}

            {currentStep === 3 && (
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
        </Card>
      </div>

      {/* HTML Editor Modal */}
      <HtmlEditorModal
        isOpen={isEditorOpen}
        html={generatedHtml}
        onSave={handleSaveHtml}
        onClose={handleCloseEditor}
      />
    </Layout>
  );
};

export default DetailedEmailForm;
