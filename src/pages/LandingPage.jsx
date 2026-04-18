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
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout showFooter={false}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-zinc-950">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div {...fadeInUp} className="text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6"
              >
                <Sparkles size={16} />
                AI-Powered Email Writing
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Email Writing,{' '}
                <span className="gradient-text">Reimagined</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-zinc-400 mb-10 max-w-lg mx-auto lg:mx-0"
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
                className="mt-6 text-sm text-zinc-500"
              >
                No credit card required — Free to get started
              </motion.p>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main glass card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg text-zinc-900">Email Crafter</span>
                  </div>

                  <div className="space-y-4">
                    <div className="h-3 bg-zinc-200 rounded w-full" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-200 rounded w-5/6" />
                  </div>

                  <div className="mt-6 p-4 bg-zinc-100 rounded-xl">
                    <p className="text-sm text-zinc-600 italic">
                      "Your email has been crafted with care. Ready to impress?"
                    </p>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4"
                >
                  <Zap className="w-8 h-8 text-amber-500" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm font-medium text-zinc-700">Done!</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
              Why Choose Email Crafter?
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              We've built the email writing tool we've always wanted. Simple, powerful, delightful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hoverable className="h-full text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-zinc-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-600 text-sm">
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
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-accent-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Email Game?
            </h2>
            <p className="text-xl text-zinc-400 mb-10">
              Join thousands of professionals who write better emails in seconds.
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
      <section className="py-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} Email Crafter. Crafted with care for email lovers everywhere.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
