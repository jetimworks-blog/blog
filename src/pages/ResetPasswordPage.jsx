import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, getPasswordStrength } from '../lib/validation';
import { Mail, Lock, ArrowRight, Sparkles, ArrowLeft, Check, X, Edit2 } from 'lucide-react';

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'lowercase', label: 'A lowercase letter' },
  { key: 'uppercase', label: 'An uppercase letter' },
  { key: 'number', label: 'A number' },
  { key: 'special', label: 'A special character' },
];

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [savedEmail, setSavedEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    // Get saved email from sessionStorage
    const email = sessionStorage.getItem('reset_password_email');
    if (email) {
      setSavedEmail(email);
      setFormData(prev => ({ ...prev, email }));
    } else {
      // If no email saved, allow editing
      setIsEditingEmail(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'password') {
      setShowPasswordStrength(value.length > 0);
    }
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setFormData(prev => ({ ...prev, email: '' }));
  };

  const handleEmailBlur = () => {
    if (formData.email) {
      setSavedEmail(formData.email);
      sessionStorage.setItem('reset_password_email', formData.email);
      setIsEditingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(formData.email, formData.otp, formData.password);

      if (result.success) {
        // Clear saved email
        sessionStorage.removeItem('reset_password_email');
        toast.success('Password reset successful!');
        navigate('/login', { replace: true });
      } else {
        toast.error('Reset failed', {
          description: result.error || 'Invalid OTP or password. Please try again.',
        });
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColors = {
    red: 'bg-error',
    orange: 'bg-warning',
    yellow: 'bg-warning',
    lime: 'bg-success',
    green: 'bg-success',
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-surface" />
            </motion.div>
            <h1 className="text-3xl text-text-primary mb-2">
              Reset Password
            </h1>
            <p className="text-text-secondary">
              Enter the OTP from your email and create a new password
            </p>
          </div>

          {/* Form */}
          <Card variant="bordered">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                {isEditingEmail ? (
                  <Input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    error={errors.email}
                    className="pl-12"
                    autoComplete="email"
                  />
                ) : (
                  <div className="pl-12 pr-12 py-3 bg-surface-elevated rounded-lg text-text-primary flex items-center">
                    <span>{savedEmail}</span>
                    <button
                      type="button"
                      onClick={handleEditEmail}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* OTP Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) => {
                    // Only allow digits and max 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData(prev => ({ ...prev, otp: value }));
                    if (errors.otp) {
                      setErrors(prev => ({ ...prev, otp: '' }));
                    }
                  }}
                  error={errors.otp}
                  className="pl-12"
                  autoComplete="one-time-code"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Create new password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="pl-12"
                  autoComplete="new-password"
                />
              </div>

              {/* Password Strength Indicator */}
              <AnimatePresence>
                {showPasswordStrength && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-none transition-colors ${
                            i <= passwordStrength.strength
                              ? strengthColors[passwordStrength.color]
                              : 'bg-surface-elevated'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.color === 'green' ? 'text-success' :
                      passwordStrength.color === 'lime' ? 'text-success' :
                      passwordStrength.color === 'yellow' ? 'text-warning' :
                      passwordStrength.color === 'orange' ? 'text-warning' :
                      'text-error'
                    }`}>
                      {passwordStrength.label} ({passwordStrength.strength}/5)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="pl-12"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  loading={isLoading}
                >
                  <span>Reset Password</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            {/* Password Requirements */}
            <AnimatePresence>
              {showPasswordStrength && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 border border-border"
                >
                  <p className="text-xs font-medium text-text-muted mb-2">Password requirements:</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req) => (
                      <li
                        key={req.key}
                        className={`text-xs flex items-center gap-2 ${
                          passwordStrength.checks?.[req.key] ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        {passwordStrength.checks?.[req.key] ? (
                          <Check size={12} />
                        ) : (
                          <X size={12} className="text-error" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-card text-text-muted">or</span>
              </div>
            </div>

            {/* Back to Login */}
            <p className="text-center text-text-secondary text-sm">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                Sign in
              </Link>
            </p>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/features"
              className="text-sm text-text-muted hover:text-text-secondary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
