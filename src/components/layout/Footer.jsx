import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent flex items-center justify-center">
                <Mail className="w-5 h-5 text-surface" />
              </div>
              <span className="text-xl font-semibold text-text-primary">Email Crafter</span>
            </div>
            <p className="text-text-muted text-sm max-w-md">
              Professional email crafting for B2B outreach. Reliable, fast, automated.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/features" className="text-text-secondary hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-text-secondary hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-text-secondary hover:text-accent transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-text-secondary hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-text-secondary hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-secondary hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            2026 Email Crafter. By Jetimworks.
          </p>
          <p className="text-text-muted text-sm">
            Reliable. Futuristic. Automated.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;