import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Zap, Sparkles, Clock, Shield, Play, Pause } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const emailImages = [
  '/email-templates/images/01-simple-text.png',
  '/email-templates/images/02-personal-thankyou.png',
  '/email-templates/images/03-corporate-announcement.png',
  '/email-templates/images/04-promotional-sale.png',
  '/email-templates/images/05-invoice.png',
  '/email-templates/images/06-proposal.png',
  '/email-templates/images/07-partnership-invitation.png',
  '/email-templates/images/08-newsletter.png',
  '/email-templates/images/09-event-invitation.png',
  '/email-templates/images/10-security-alert.png',
  '/email-templates/images/11-verification.png',
  '/email-templates/images/12-shipping-notification.png',
  '/email-templates/images/13-appointment-reminder.png',
  '/email-templates/images/14-feedback-request.png',
  '/email-templates/images/15-abandoned-cart.png',
  '/email-templates/images/16-welcome.png',
];

const backgroundImages = emailImages.slice(0, 6);

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Craft professional emails in seconds. No more staring at a blank page.',
  },
  {
    icon: Sparkles,
    title: 'Smart Templates',
    description: 'Our template engine learns from your industry to craft emails that hit the mark.',
  },
  {
    icon: Clock,
    title: 'Two Modes',
    description: 'Quick send when speed matters, or detailed customization when every word counts.',
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % emailImages.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  useEffect(() => {
    if (!isPlaying) return;
    const hideTimer = setTimeout(() => setShowControls(false), 1500);
    return () => clearTimeout(hideTimer);
  }, [isPlaying, currentIndex]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      setShowControls(false);
    } else {
      setShowControls(true);
    }
  };

  return (
    <Layout showFooter={false}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface">
        {/* Background email template images - subtle and scattered */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImages.map((img, index) => (
            <motion.div
              key={img}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="absolute"
              style={{
                top: `${10 + (index % 3) * 25}%`,
                left: `${5 + (index % 4) * 20}%`,
                width: '280px',
                height: '180px',
                transform: `rotate(${(index % 2 === 0 ? '' : '-') + (index * 7 % 15)}deg)`,
              }}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </motion.div>
          ))}
        </div>

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
                <Zap size={16} />
                Intelligent Email Automation
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight"
              >
                Email Writing,{' '}
                <span className="text-accent">Automated</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-text-secondary mb-10 max-w-lg mx-auto lg:mx-0"
              >
                Stop building emails from scratch. Our intelligent system transforms your brief
                into polished, professional emails — ready to send in seconds.
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
                        Automate Your Emails
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

            </motion.div>

            {/* Right: Carousel "video" player */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Carousel viewport - no border */}
              <div
                className="relative aspect-[4/3] cursor-pointer group overflow-hidden"
                onClick={togglePlay}
                onMouseEnter={() => setShowControls(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={emailImages[currentIndex]}
                    alt="Email template preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Play/Pause overlay */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <div className="w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center border border-border shadow-xl">
                        {isPlaying ? (
                          <Pause className="w-7 h-7 text-text-primary" />
                        ) : (
                          <Play className="w-7 h-7 text-text-primary ml-1" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Workflow text */}
              <p className="mt-6 text-center text-lg text-text-secondary font-light tracking-wide">
                <span className="text-text-primary font-medium">Describe Email</span>
                <span className="mx-3 text-accent">→</span>
                <span className="text-text-primary font-medium">Choose Template</span>
                <span className="mx-3 text-accent">→</span>
                <span className="text-text-primary font-medium">Send Email</span>
              </p>
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
              Ready to Streamline Your Outreach?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join professionals who automate their email workflow with precision.
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
            © 2026 KraftMail by <a href="https://jetimworks.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Jetimworks</a>. Reliable. Futuristic. Automated.
            </p>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;