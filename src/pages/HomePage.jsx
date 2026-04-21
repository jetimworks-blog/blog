import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { Zap, Sparkles, Clock, AlertTriangle, ChevronRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { configAPI } from '../lib/api';

export const HomePage = () => {
  const { user } = useAuth();
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.get();
      const fromName = response.data.from_name || 'Anonymous';
      setShowApiKeyBanner(fromName === 'Anonymous');
      setApiKeyLoaded(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setShowApiKeyBanner(true);
      } else {
        console.error('Failed to load config:', error);
      }
      setApiKeyLoaded(true);
    }
  };

  const emailOptions = [
    {
      id: 'yolo',
      icon: Zap,
      title: 'YOLO Quick Send',
      tagline: 'Just tell us what you need',
      description: 'Drop in the recipient, subject, and your idea. We handle the rest. Perfect for sending now.',
      cta: 'Fire Away',
    },
    {
      id: 'detailed',
      icon: Sparkles,
      title: 'Craft with Care',
      tagline: 'Meticulous attention to detail',
      description: 'Control the tone, style, word count, and visual design. For when details matter.',
      cta: 'Craft Something Special',
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Welcome back, {user?.email?.split('@')[0] || 'there'}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            Choose your approach below. YOLO when you're in a rush, detailed when you want precision.
          </p>
        </motion.div>

        {/* Sender Details Warning Banner */}
        {apiKeyLoaded && showApiKeyBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-4 border border-warning-muted bg-surface-card"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary mb-1">
                  Update Your Sender Details
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  Your emails will be sent from <strong>free-email@jetimworks.com</strong> as <strong>Anonymous</strong>. Head to Settings to customize.
                </p>
                <Link to="/settings">
                  <Button variant="secondary" size="sm">
                    Go to Settings
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <button
                onClick={() => setShowApiKeyBanner(false)}
                className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Email Options */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {emailOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/send/${option.id}`}>
                  <Card
                    hoverable
                    className="h-full group"
                  >
                    <div className="flex flex-col h-full">
                      {/* Icon */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border border-accent flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-accent transition-colors">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent group-hover:text-surface" />
                      </div>

                      {/* Content */}
                      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                        {option.title}
                      </h2>
                      <p className="text-sm font-medium text-text-secondary mb-3 sm:mb-4 flex items-center gap-1">
                        <Clock size={14} />
                        {option.tagline}
                      </p>
                      <p className="text-text-secondary mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                        {option.description}
                      </p>

                      {/* CTA - pushed to bottom */}
                      <div className="mt-auto inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent font-medium group-hover:bg-accent group-hover:text-surface transition-colors w-fit">
                        <Mail size={18} />
                        {option.cta}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 sm:mt-12 text-center"
        >
          <Card className="inline-block">
            <p className="text-text-muted text-sm">
              <span className="font-semibold text-text-secondary">Pro tip:</span> Start with YOLO. You can refine later.
            </p>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default HomePage;