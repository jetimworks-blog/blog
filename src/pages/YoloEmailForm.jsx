import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { MagicLoader } from '../components/ui/MagicLoader';
import { ProgressSteps } from '../components/ui/ProgressSteps';
import { emailAPI, configAPI } from '../lib/api';
import { validateEmail, validateRequired } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Mail, Zap, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to extract name from email address
const extractNameFromEmail = (email) => {
  if (!email) return 'User';
  const localPart = email.split('@')[0];
  // Handle common patterns like john.doe, john_doe, johndoe, john
  const nameParts = localPart.split(/[._-]/);
  // Capitalize first letter of each part
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

// Simple confetti effect using CSS animations
const ConfettiPiece = ({ delay, x }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 1, rotate: 0 }}
    animate={{ y: '100vh', opacity: 0, rotate: 720 }}
    transition={{ duration: 2, delay, ease: 'easeOut' }}
    className="absolute w-3 h-3 rounded-full"
    style={{
      backgroundColor: ['#4F46E5', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)],
      left: `${x}%`,
    }}
  />
);

export const YoloEmailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fromName, setFromName] = useState('');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    prompt: '',
  });
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [errors, setErrors] = useState({});
  const [emailsSentCount, setEmailsSentCount] = useState(getEmailsSentCount);
  const [showConfetti, setShowConfetti] = useState(false);

  // Preload form data from history if available
  useEffect(() => {
    const historyData = location.state?.historyItem;
    if (historyData) {
      setFormData({
        to: historyData.to || '',
        subject: historyData.subject || '',
        prompt: historyData.prompt || '',
      });
      // Clear the state so refreshing doesn't keep preloaded data
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
      if (!validateEmail(formData.to)) {
        newErrors.to = 'Please enter a valid email address';
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
      // Append sender name instruction to prompt
      const senderName = getSenderName(user, fromName);
      const enhancedPrompt = `${formData.prompt}\n\nSign the email that it is from ${senderName}.`;
      
      // Step 1: Generate HTML preview using process 'gen'
      const previewPayload = {
        process: 'gen',
        prompt: enhancedPrompt,
      };

      const previewResponse = await emailAPI.execute(previewPayload);
      
      if (previewResponse.data.success) {
        setGeneratedHtml(previewResponse.data.output || '');
        // Save prompt to sessionStorage for the confirm step
        sessionStorage.setItem('pendingPrompt', enhancedPrompt);
        setCurrentStep(2); // Go to Preview step
        toast.success('Preview generated!', {
          description: 'Review your email below before sending.',
        });
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
      // Append sender name instruction to prompt
      const senderName = getSenderName(user, fromName);
      const enhancedPrompt = `${formData.prompt}\n\nSign the email that it is from ${senderName}.`;
      
      const previewPayload = {
        process: 'gen',
        prompt: enhancedPrompt,
      };

      const previewResponse = await emailAPI.execute(previewPayload);
      
      if (previewResponse.data.success) {
        setGeneratedHtml(previewResponse.data.output || '');
        // Update prompt in sessionStorage for the confirm step
        sessionStorage.setItem('pendingPrompt', enhancedPrompt);
        toast.success('Preview regenerated!', {
          description: 'Check out the new version.',
        });
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
      // Get the prompt from sessionStorage
      const savedPrompt = sessionStorage.getItem('pendingPrompt') || '';

      // Step 3: Confirm and send email with pre-generated HTML
      const confirmPayload = {
        process: 'email',
        to: formData.to,
        subject: formData.subject,
        html: generatedHtml,
        prompt: savedPrompt,
      };

      const sendResponse = await emailAPI.confirm(confirmPayload);

      if (sendResponse.data.success) {
        // Clear the prompt from sessionStorage after successful send
        sessionStorage.removeItem('pendingPrompt');
        // Update emails sent counter
        const newCount = incrementEmailsSentCount();
        setEmailsSentCount(newCount);
        // Trigger confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        toast.success('Email sent! 🎉', {
          description: `Your email has been delivered to ${formData.to}.`,
        });
        navigate('/result', {
          state: {
            email: generatedHtml,
            subject: formData.subject,
            to: formData.to,
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
      {/* Confetti Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 0.05}
                x={Math.random() * 100}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-800 transition-colors mb-6"
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl text-zinc-900">
                YOLO Quick Send
              </h1>
              <p className="text-zinc-500 text-sm sm:text-base">Just tell us what you need</p>
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
              <h2 className="text-lg sm:text-xl text-zinc-800 mb-3 sm:mb-4">
                Who's getting this email? 📧
              </h2>
              <p className="text-zinc-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Enter the recipient's email address. We'll make sure they receive something worth opening.
              </p>

              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    name="to"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="friend@amazing.com"
                    value={formData.to}
                    onChange={handleChange}
                    error={errors.to}
                    className="pl-12 min-h-12 sm:min-h-0"
                    autoFocus
                  />
                </div>
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
              <h2 className="text-lg sm:text-xl text-zinc-800 mb-3 sm:mb-4">
                What's this about? 📝
              </h2>
              <p className="text-zinc-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Give us the subject line and a rough idea of what you want to say. Don't worry about perfect words — that's our job!
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
              <h2 className="text-lg sm:text-xl text-zinc-800 mb-3 sm:mb-4">
                Review Your Email Preview 👀
              </h2>
              <p className="text-zinc-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Here's what your email looks like. If it needs changes, regenerate or go back to edit.
              </p>

              {/* Preview Section */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden mb-4 sm:mb-6">
                <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600">Email Preview</span>
                  <button
                    onClick={handleRegeneratePreview}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-600/80 transition-colors min-h-10 px-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
                <div
                  className="p-4 sm:p-6 bg-white max-h-64 sm:max-h-96 overflow-auto [&_table]:w-full [&_*]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: generatedHtml || '<p class="text-zinc-400">No preview generated</p>' }}
                />
              </div>

              {/* Summary */}
              <div className="space-y-2 p-3 sm:p-4 bg-zinc-50 rounded-xl text-sm sm:text-base">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">To:</span>
                  <span className="font-medium text-zinc-800 truncate ml-2">{formData.to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Subject:</span>
                  <span className="font-medium text-zinc-800 truncate ml-2">{formData.subject}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 sm:mt-8 pt-6 border-t border-zinc-100 ${currentStep === 2 ? 'sm:flex-col-reverse sm:gap-4' : ''}`}>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto min-h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 0 && (
              <Button onClick={handleNext} className="w-full sm:w-auto min-h-11">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 1 && (
              <Button onClick={handleGeneratePreview} className="w-full sm:w-auto min-h-11">
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                variant="glow"
                size="lg"
                onClick={handleSendEmail}
                className="w-full sm:w-auto min-h-12"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Email
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default YoloEmailForm;