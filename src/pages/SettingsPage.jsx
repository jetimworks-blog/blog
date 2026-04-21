import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { configAPI, authAPI } from '../lib/api';
import { validateSenderEmail } from '../lib/validation';
import { Settings, Key, Eye, EyeOff, CheckCircle, AlertTriangle, ExternalLink, Trash2, User, Mail } from 'lucide-react';

export const SettingsPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showDeleteConfigModal, setShowDeleteConfigModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [senderError, setSenderError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.get();
      setHasApiKey(response.data.has_resend_key || false);
      setFromEmail(response.data.from_email || 'free-email@jetimworks.com');
      setFromName(response.data.from_name || 'Anonymous');
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (fromEmail.trim()) {
      const emailValidation = validateSenderEmail(fromEmail);
      if (!emailValidation.valid) {
        setSenderError(emailValidation.message);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = { resend_api_key: apiKey.trim() };
      if (fromEmail.trim()) {
        payload.from_email = fromEmail.trim();
      }
      if (fromName.trim()) {
        payload.from_name = fromName.trim();
      }
      await configAPI.set(payload);
      setHasApiKey(true);
      setApiKey('');
      setSenderError('');
      localStorage.setItem('settingsUpdated', 'true');
      toast.success('Settings saved!');
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Something went wrong.';

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }

      toast.error('Failed to save settings', {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSender = async () => {
    if (fromEmail.trim()) {
      const emailValidation = validateSenderEmail(fromEmail);
      if (!emailValidation.valid) {
        setSenderError(emailValidation.message);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {};
      if (fromEmail.trim()) {
        payload.from_email = fromEmail.trim();
      }
      if (fromName.trim()) {
        payload.from_name = fromName.trim();
      }
      await configAPI.set(payload);
      setSenderError('');
      localStorage.setItem('settingsUpdated', 'true');
      toast.success('Sender information saved!');
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Something went wrong.';

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }

      toast.error('Failed to save sender information', {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async () => {
    setIsDeleting(true);
    try {
      await configAPI.delete();
      setHasApiKey(false);
      setShowDeleteConfigModal(false);
      toast.success('API key deleted');
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Something went wrong.';

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }

      toast.error('Failed to delete API key', {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      localStorage.clear();
      toast.success('Account deleted');
      window.location.href = '/features';
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Something went wrong.';

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }

      toast.error('Failed to delete account', {
        description: errorMessage,
      });
    } finally {
      setIsDeletingAccount(false);
      setDeletePassword('');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size={32} />
            <p className="text-text-muted">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent flex items-center justify-center">
              <Settings className="w-6 h-6 text-surface" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl text-text-primary">
                Settings
              </h1>
              <p className="text-text-muted">Configure your email sending setup</p>
            </div>
          </div>
        </motion.div>

        {/* API Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border border-border flex items-center justify-center">
                <Key className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg text-text-primary">
                  Resend API Key
                </h2>
                <p className="text-sm text-text-muted">
                  Required for sending emails through Resend
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`mb-6 p-3 border flex items-center gap-3 ${
              hasApiKey
                ? 'border-success-muted'
                : 'border-warning-muted'
            }`}>
              {hasApiKey ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">API Key Configured</p>
                    <p className="text-xs text-text-muted">Ready to send emails</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">API Key Required</p>
                    <p className="text-xs text-text-muted">Add your Resend API key to send emails</p>
                  </div>
                </>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder={hasApiKey ? '••••••••••••••••••••' : 're_xxxxxxxxxxxxxxxxxxxxxxxxxx'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={!apiKey.trim()}
                className="w-full"
              >
                {hasApiKey ? 'Update API Key' : 'Save API Key'}
              </Button>

              {hasApiKey && (
                <Button
                  variant="ghost"
                  className="w-full text-error hover:bg-error-muted"
                  onClick={() => setShowDeleteConfigModal(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete API Key
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sender Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border border-border flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg text-text-primary">
                  Sender Information
                </h2>
                <p className="text-sm text-text-muted">
                  Customize how your emails appear to recipients
                </p>
              </div>
            </div>

            <div className="p-3 border border-border mb-4">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-muted">
                  If not set, emails will come from <strong className="text-text-secondary">free-email@jetimworks.com</strong> as <strong className="text-text-secondary">Anonymous</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 border border-warning-muted mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-secondary">
                  <strong>Important:</strong> You can only change the Sender Email if your Resend API Key is registered with that email domain.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                label="Sender Email"
                placeholder="sender@example.com"
                value={fromEmail}
                onChange={(e) => {
                  setFromEmail(e.target.value);
                  if (senderError) setSenderError('');
                }}
                error={senderError}
              />

              <Input
                type="text"
                label="Sender Name"
                placeholder="Sender Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />

              <Button
                onClick={handleSaveSender}
                loading={isSaving}
                disabled={!fromEmail.trim() && !fromName.trim()}
                className="w-full"
              >
                Save Sender Information
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border border-border">
            <h3 className="text-text-primary mb-3">
              How to get your Resend API key
            </h3>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 border border-border rounded-none flex items-center justify-center text-xs font-medium text-text-secondary flex-shrink-0">1</span>
                <span>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover">Resend <ExternalLink size={12} /></a></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 border border-border rounded-none flex items-center justify-center text-xs font-medium text-text-secondary flex-shrink-0">2</span>
                <span>Navigate to API Keys in your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 border border-border rounded-none flex items-center justify-center text-xs font-medium text-text-secondary flex-shrink-0">3</span>
                <span>Create a key and copy the one starting with <code className="bg-surface-elevated px-1">re_</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 border border-border rounded-none flex items-center justify-center text-xs font-medium text-text-secondary flex-shrink-0">4</span>
                <span>Paste it above and save.</span>
              </li>
            </ol>
          </Card>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="border border-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Your API key is secure</p>
                <p className="text-xs text-text-muted mt-1">
                  Your Resend API key is encrypted. We never share your credentials.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="border border-error-muted">
            <h3 className="text-text-primary mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Once you delete your account, there is no going back.
            </p>
            <Button
              variant="danger"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Delete Config Modal */}
      {showDeleteConfigModal && (
        <div className="fixed inset-0 bg-surface/80 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-card border border-border rounded-none p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg text-text-primary mb-2">
              Delete API Key?
            </h3>
            <p className="text-text-secondary mb-6">
              This will remove your Resend API key. You can add it again later.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfigModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfig}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-surface/80 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-card border border-border rounded-none p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg text-text-primary mb-2">
              Delete Account?
            </h3>
            <p className="text-text-secondary mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <p className="text-sm text-text-muted mb-4">
              Please enter your password to confirm.
            </p>
            <div className="relative mb-6">
              <Input
                type={showDeletePassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showDeletePassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeletePassword('');
                }}
                disabled={isDeletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={isDeletingAccount}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;