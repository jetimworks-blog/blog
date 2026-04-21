import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;