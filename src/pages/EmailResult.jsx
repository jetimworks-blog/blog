import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Copy, Check, Mail, Sparkles, ArrowLeft, Home, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export const EmailResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, subject, to, mode, error } = location.state || {};
  const [copied, setCopied] = useState(false);

  // Handle missing state or error - show error page
  if (!email || error) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="bordered" className="max-w-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl text-zinc-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-zinc-600 mb-6">
                {error || "We couldn't craft your email. Please try again."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => navigate('/home')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('Copied to clipboard!', {
        description: 'Paste it anywhere you like.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', {
        description: 'Please try selecting and copying manually.',
      });
    }
  };

  const handleSendAnother = () => {
    navigate('/home');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl text-zinc-900 mb-2">
            {mode === 'detailed' ? 'Your Masterpiece is Ready! ✨' : 'Email Crafted! 🎉'}
          </h1>
          <p className="text-lg text-zinc-600">
            {mode === 'detailed' 
              ? 'Every detail has been perfected. Review your creation below.' 
              : 'Quick and painless. Your email is ready to send.'
            }
          </p>
        </motion.div>

        {/* Email Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Email Header Info */}
            <div className="bg-zinc-50 border-b border-zinc-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700">Email Preview</span>
                {mode === 'detailed' && (
                  <span className="px-2 py-0.5 bg-primary-600/10 text-primary-600 text-xs rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    Crafted with Care
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-zinc-500 w-16 flex-shrink-0">To:</span>
                  <span className="text-zinc-800 font-medium">{to}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-zinc-500 w-16 flex-shrink-0">Subject:</span>
                  <span className="text-zinc-800 font-medium">{subject}</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-6 md:p-8">
              <div 
                className="prose prose-navy max-w-none"
                dangerouslySetInnerHTML={{ __html: email }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>

          <Button
            onClick={handleSendAnother}
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Send Another
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block">
            <p className="text-zinc-500 text-sm">
              <span className="font-medium text-zinc-700">Tip:</span> You can copy the HTML directly and paste it into your email platform for best results. Most email clients render HTML beautifully! 📧
            </p>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EmailResult;
