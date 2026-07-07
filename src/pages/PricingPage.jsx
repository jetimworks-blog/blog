import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, Zap, Crown, Globe, CreditCard, Sparkles, Shield, Calendar } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const freeFeatures = [
  { icon: Zap, text: '20 email generations per day', highlight: true },
  { icon: Globe, text: 'Free jetimworks.com email subdomain', highlight: true },
  { icon: Shield, text: 'No credit card needed', highlight: true },
  { icon: Sparkles, text: 'Name customization', highlight: false },
  { icon: Calendar, text: 'Perfect for personal use', highlight: false },
  { icon: Shield, text: 'No commitment required', highlight: false },
];

const premiumFeatures = [
  { icon: Globe, text: 'Use your own custom domain', highlight: true },
  { icon: Zap, text: '100 email generations per day', highlight: true },
  { icon: Crown, text: '$5 per month', highlight: true },
  { icon: Sparkles, text: 'Great for professional use', highlight: false },
  { icon: Calendar, text: 'Early access to new features', highlight: false },
  { icon: CreditCard, text: 'Join our free email consulting list', highlight: false },
];

export const PricingPage = () => {
  return (
    <Layout showFooter={false}>
      {/* Hero Section */}
      <section className="relative py-24 bg-surface overflow-hidden">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight">
              Choose Your <span className="text-accent">Plan</span>
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto"
          >
            {/* Free Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full relative group">
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-border" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 border border-border flex items-center justify-center">
                        <Zap className="w-6 h-6 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                        Free
                      </h2>
                    </div>

                    <div className="mb-2">
                      <span className="text-5xl font-bold text-text-primary">$0</span>
                      <span className="text-text-secondary ml-2">/month</span>
                    </div>
                    <p className="text-text-muted text-sm">Forever free, no credit card required</p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border mb-8" />

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {freeFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 flex items-center justify-center ${feature.highlight ? 'text-accent' : 'text-text-muted'}`}>
                            <Check className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${feature.highlight ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <Link to="/register" className="block">
                    <Button variant="secondary" size="lg" className="w-full text-center">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div variants={fadeInUp} className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 bg-accent/5 rounded-lg blur-xl" />

              <Card className="h-full relative group border-accent/30">
                {/* Corner accent - more prominent */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-accent" />
                <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-accent" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-accent" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-accent" />

                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-accent text-surface text-xs font-bold uppercase tracking-wider">
                    Best Value
                  </div>
                </div>

                <div className="relative z-10 pt-4">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 border border-accent flex items-center justify-center">
                        <Crown className="w-6 h-6 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                        Premium
                      </h2>
                    </div>

                    <div className="mb-2">
                      <span className="text-5xl font-bold text-text-primary">$5</span>
                      <span className="text-text-secondary ml-2">/month</span>
                    </div>
                    <p className="text-text-muted text-sm">Unlock your professional potential</p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-border via-accent/50 to-border mb-8" />

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {premiumFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 flex items-center justify-center ${feature.highlight ? 'text-accent' : 'text-text-muted'}`}>
                            <Check className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${feature.highlight ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <Link to="/register?plan=premium" className="block">
                    <Button size="lg" className="w-full text-center">
                      Go Premium
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-text-muted text-sm">
              All plans include access to our core email generation features.
              <br />
              Questions? <a href="mailto:support@jetimworks.com" className="text-accent hover:text-accent-hover transition-colors">Contact us</a> — we're here to help.
            </p>
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

export default PricingPage;
