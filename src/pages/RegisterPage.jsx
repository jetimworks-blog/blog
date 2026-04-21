import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, getPasswordStrength } from '../lib/validation';
import { Mail, Lock, ArrowRight, Sparkles, Check, X } from 'lucide-react';

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'lowercase', label: 'A lowercase letter' },
  { key: 'uppercase', label: 'An uppercase letter' },
  { key: 'number', label: 'A number' },
  { key: 'special', label: 'A special character' },
];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

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

  const validateForm = () => {
    const newErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation) {
      newErrors.email = 'Please enter a valid email address';
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
      const result = await register(formData.email, formData.password);

      if (result.success) {
        toast.success('Account created!');
        localStorage.setItem('justSignedUp', 'true');
        navigate('/home', { replace: true });
      } else {
        toast.error('Registration failed', {
          description: result.error || 'Please try again with a different email.',
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
              Create Your Account
            </h1>
            <p className="text-text-secondary">
              Join the email crafting revolution
            </p>
          </div>

          {/* Form */}
          <Card variant="bordered">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    className="pl-12"
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
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

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    className="pl-12"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  loading={isLoading}
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            {/* Password Requirements */}
            <div className="mt-4 p-4 border border-border">
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
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-card text-text-muted">or</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-text-secondary text-sm">
              Already have an account?{' '}
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
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RegisterPage;