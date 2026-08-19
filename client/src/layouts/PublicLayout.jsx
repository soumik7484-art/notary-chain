import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const PublicLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isPricingPage = location.pathname === '/pricing';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-dark bg-white/80 dark:bg-slate-950/80 shadow-sm border-b border-slate-200 dark:border-slate-800 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-white">N</div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">NotaryChain</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="/#features" className="hover:text-primary-500 transition-colors">Features</a>
            <a href="/#security" className="hover:text-primary-500 transition-colors">Security</a>
            <a href="/pricing" className="hover:text-primary-500 transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-3">
            {isPricingPage ? (
              <Link to={isAuthenticated ? "/dashboard" : "/"}>
                <Button variant="secondary" size="sm">
                  ← Back to {isAuthenticated ? "Dashboard" : "Home"}
                </Button>
              </Link>
            ) : isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Log In</Button></Link>
                <Link to="/signup"><Button variant="primary">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">NotaryChain</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} NotaryChain Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
