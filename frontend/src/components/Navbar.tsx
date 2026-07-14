import React from "react";
import { Link, useNavigate } from "react-router";
import { Bot, LogOut, Terminal, User } from "lucide-react";

interface NavbarProps {
  token: string;
  email: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ token, email, onLogout }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  return (
    <nav className="w-full h-16 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between transition-all duration-200">
      <Link to="/" className="flex items-center gap-2 text-brand-primary font-mono tracking-widest text-sm md:text-base font-bold uppercase transition-all duration-200 hover:opacity-90">
        <Bot className="w-5 h-5 text-brand-primary animate-pulse" />
        <span>multi-agent</span>
      </Link>

      <div className="flex items-center gap-4 md:gap-6 text-sm">
        <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors py-1">
          Features
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-1 text-brand-secondary hover:text-brand-secondary/80 transition-colors py-1 font-mono"
            >
              <Terminal className="w-4 h-4" />
              <span>Console</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-bg-surface-elevated/40 text-text-secondary text-xs font-mono">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span className="max-w-[120px] truncate">{email}</span>
            </div>
            
            <button
              onClick={() => {
                onLogout();
                navigate("/");
              }}
              className="btn-transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-500/20 hover:text-white cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="btn-transition text-text-secondary hover:text-text-primary py-2 px-3 rounded-lg border border-transparent hover:border-border-subtle"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-transition px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-medium rounded-lg shadow-sm hover:shadow-brand-primary/20"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
