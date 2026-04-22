import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Zap, Sparkles, Clock, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Craft professional emails in seconds. No more staring at a blank page.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Magic',
    description: 'Our intelligent system understands your intent and creates emails that resonate.',
  },
  {
    icon: Clock,
    title: 'Two Modes',
    description: 'Quick YOLO send when speed matters, or detailed crafting when perfection counts.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your emails and data are encrypted and protected. Always.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout showFooter={false}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface">
        {/* Dot grid pattern - subtle */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div {...fadeInUp} className="text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent text-sm font-medium mb-6"
              >
                <Sparkles size={16} />
                AI-Powered Email Writing
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight"
              >
                Email Writing,{' '}
                <span className="text-accent">Reimagined</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-text-secondary mb-10 max-w-lg mx-auto lg:mx-0"
              >
                Stop struggling with the perfect words. Our AI-powered email crafter
                transforms your ideas into compelling, professional emails in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                {isAuthenticated ? (
                  <Link to="/home">
                    <Button size="lg" className="w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="w-full sm:w-auto">
                        Start Crafting for Free
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-sm text-text-muted"
              >
                No credit card required — Free to get started
              </motion.p>
            </motion.div>

            {/* Right: Visual - Technical terminal aesthetic */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative border border-border bg-surface-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-surface" />
                  </div>
                  <span className="font-semibold text-lg text-text-primary">KraftMail</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="h-3 bg-surface-elevated rounded w-full" />
                  <div className="h-3 bg-surface-elevated rounded w-3/4" />
                  <div className="h-3 bg-surface-elevated rounded w-5/6" />
                </div>

                <div className="p-4 bg-surface-elevated border border-border">
                  <p className="text-sm text-text-secondary">
                    "Your email has been crafted with care. Ready to impress?"
                  </p>
                </div>
              </div>

              {/* Floating terminal lines */}
              <div className="absolute -top-4 -right-4 bg-surface-card border border-border px-4 py-2 text-xs text-text-muted font-mono">
                <span className="text-accent">$</span> email craft --send
              </div>

              <div className="absolute -bottom-4 -left-4 bg-surface-card border border-border px-4 py-2 text-xs text-text-muted font-mono">
                <span className="text-success">✓</span> ready to send
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Why Choose KraftMail?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Built for professionals who send polished B2B outreach at scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hoverable className="h-full text-center">
                    <div className="w-14 h-14 border border-border flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface relative overflow-hidden">
        {/* Subtle accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Ready to Transform Your Email Game?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join professionals who send better emails in seconds.
            </p>
            <Link to="/register">
              <Button size="lg">
                Get Started — It's Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 bg-surface-elevated border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-text-muted text-sm">
            © 2026 KraftMail by Jetimworks. Reliable. Futuristic. Automated.
            </p>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;