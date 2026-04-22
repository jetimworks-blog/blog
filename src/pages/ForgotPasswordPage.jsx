import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../lib/validation';
import { Mail, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const result = await forgotPassword(formData.email);

      if (result.success) {
        // Save email to sessionStorage for the reset password page
        sessionStorage.setItem('reset_password_email', formData.email);
        toast.success('Check your email for the OTP');
        navigate('/reset-password', { replace: true });
      } else {
        toast.error('Request failed', {
          description: result.error || 'Something went wrong. Please try again.',
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
              Forgot Password?
            </h1>
            <p className="text-text-secondary">
              Enter your email and we'll send you an OTP to reset your password
            </p>
          </div>

          {/* Form */}
          <Card variant="bordered">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex justify-center">
                <Button
                  type="submit"
                  loading={isLoading}
                >
                  <span>Send OTP</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-card text-text-muted">or</span>
              </div>
            </div>

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

export default ForgotPasswordPage;
