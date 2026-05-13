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
import { ArrowLeft, Send, Zap, ChevronRight, Eye, RefreshCw, Code } from 'lucide-react';

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

const steps = ['Recipient', 'Details', 'Preview', 'Send'];

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

export const YoloEmailForm = () => {
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
    noStyle: true,
  });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errors, setErrors] = useState({});
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
      } catch (error) {
        console.error('Failed to load config:', error);
        setFromName('Anonymous');
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validate toList as primary recipient field
      if (!Array.isArray(formData.toList) || formData.toList.length === 0) {
        newErrors.toList = 'Please add at least one recipient';
      } else {
        // Validate each email in toList
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
    }

    if (step === 1) {
      const subjectValidation = validateRequired(formData.subject, 'Subject');
      if (!subjectValidation.valid) {
        newErrors.subject = subjectValidation.message;
      }

      const promptValidation = validateRequired(formData.prompt, 'Prompt');
      if (!promptValidation.valid) {
        newErrors.prompt = promptValidation.message;
      } else if (formData.prompt.length < 10) {
        newErrors.prompt = 'Please provide a bit more detail (at least 10 characters)';
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

  const handleGeneratePreview = async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);

    try {
      const senderName = getSenderName(user, fromName);
      const recipientName = formData.recipientName.trim();
      let enhancedPrompt = `In essence the email should say this: '${formData.prompt}'. Be very creative in delivering the best style, grammar, and beauty of the message.`;
      if (recipientName) {
        enhancedPrompt += `\n\nThe Recipient name is ${recipientName}.`;
      }
      enhancedPrompt += `\n\nCONTEXT ONLY - DO NOT INCLUDE IN EMAIL: The expected subject for this email is '${formData.subject}'. Use this subject line only as guidance for the tone and direction of your message. The actual email body must NOT contain or repeat the subject line. Write only the email body content itself — no subject, no headers indicating the subject.`;

      if (formData.noStyle) {
        enhancedPrompt += `\n\nIMPORTANT - NO STYLE MODE: This is a professional business email. Do NOT use any HTML styling, decorative elements, background colors, gradients, shadows, or fancy layouts. Format the email as plain, clean text content using only the following HTML elements: paragraphs (<p>), line breaks (<br>), bold text (<b> or <strong>), and simple lists (<ul>/<li> if needed). Use only basic inline CSS for font-family (Arial or sans-serif), font-size (14-16px), line-height (1.5), and color (black or #333333 on white background). The email should look like a simple, professional plain-text message. No headers with colored backgrounds, no colored borders, no fancy buttons, no decorative elements whatsoever. Keep it clean, minimal, and highly readable.`;
      }

      enhancedPrompt += `\n\nSign the email that it is from ${senderName}.`;

      const previewPayload = {
        process: 'gen',
        prompt: enhancedPrompt,
      };

      const previewResponse = await emailAPI.execute(previewPayload);

      if (previewResponse.data.success) {
        setGeneratedHtml(previewResponse.data.output || '');
        sessionStorage.setItem('pendingPrompt', enhancedPrompt);
        setCurrentStep(2);
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
      const senderName = getSenderName(user, fromName);
      const recipientName = formData.recipientName.trim();
      let enhancedPrompt = `In essence the email should say this: '${formData.prompt}'. Be very creative in delivering the best style, grammar, and beauty of the message.`;
      if (recipientName) {
        enhancedPrompt += `\n\nThe Recipient name is ${recipientName}.`;
      }
      enhancedPrompt += `\n\nCONTEXT ONLY - DO NOT INCLUDE IN EMAIL: The expected subject for this email is '${formData.subject}'. Use this subject line only as guidance for the tone and direction of your message. The actual email body must NOT contain or repeat the subject line. Write only the email body content itself — no subject, no headers indicating the subject.`;

      if (formData.noStyle) {
        enhancedPrompt += `\n\nIMPORTANT - NO STYLE MODE: This is a professional business email. Do NOT use any HTML styling, decorative elements, background colors, gradients, shadows, or fancy layouts. Format the email as plain, clean text content using only the following HTML elements: paragraphs (<p>), line breaks (<br>), bold text (<b> or <strong>), and simple lists (<ul>/<li> if needed). Use only basic inline CSS for font-family (Arial or sans-serif), font-size (14-16px), line-height (1.5), and color (black or #333333 on white background). The email should look like a simple, professional plain-text message. No headers with colored backgrounds, no colored borders, no fancy buttons, no decorative elements whatsoever. Keep it clean, minimal, and highly readable.`;
      }

      enhancedPrompt += `\n\nSign the email that it is from ${senderName}.`;

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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <MagicLoader
            title={currentStep === 2 ? 'Generating preview...' : 'Crafting your email...'}
            subtitle={currentStep === 2 ? 'Creating HTML email' : 'This is the fun part!'}
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
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl text-text-primary">
                YOLO Quick Send
              </h1>
              <p className="text-text-muted text-sm sm:text-base">Just tell us what you need</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <ProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <Card variant="bordered" className="p-4 sm:p-6">
          {/* Step 0: Recipient */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
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
                  onChange={(emails) => setFormData(prev => ({ ...prev, toList: emails }))}
                  error={errors.toList}
                />
                <AnimatePresence>
                  {showCcBcc && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ChipInput
                        label="CC (optional)"
                        placeholder="Add CC..."
                        value={formData.cc}
                        onChange={(emails) => setFormData(prev => ({ ...prev, cc: emails }))}
                        error={errors.cc}
                      />
                      <ChipInput
                        label="BCC (optional)"
                        placeholder="Add BCC..."
                        value={formData.bcc}
                        onChange={(emails) => setFormData(prev => ({ ...prev, bcc: emails }))}
                        error={errors.bcc}
                      />
                    </motion.div>
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
              </div>
            </motion.div>
          )}

          {/* Step 1: Details */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
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
                  error={errors.prompt}
                  rows={5}
                  maxLength={1000}
                />

                {/* No Style Checkbox */}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, noStyle: e.target.checked }))}
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
          )}

          {/* Step 2: Preview */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg sm:text-xl text-text-primary mb-3 sm:mb-4">
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
                  className="p-4 sm:p-6 bg-gray-900 max-h-64 sm:max-h-96 overflow-auto [&_table]:w-full email-preview"
                  dangerouslySetInnerHTML={{ __html: generatedHtml || '<p class="text-text-muted">No preview generated</p>' }}
                />
              </div>

              {/* Summary */}
              <div className="space-y-2 p-3 sm:p-4 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">To:</span>
                  <span className="font-medium text-text-primary truncate ml-2">{formData.toList.join(', ')}</span>
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
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 sm:mt-8 pt-6 border-t border-border ${currentStep === 2 ? 'sm:flex-col-reverse sm:gap-4' : ''}`}>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 0 && (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 1 && (
              <Button onClick={handleGeneratePreview} className="w-full sm:w-auto">
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            )}

            {currentStep === 2 && (
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

export default YoloEmailForm;
