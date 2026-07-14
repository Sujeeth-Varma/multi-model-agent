import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  message: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading,
  message,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email.trim() || !password.trim()) {
      setValidationError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    void onSubmit(email.trim(), password);
  };

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-md glass-panel p-8 shadow-2xl relative overflow-hidden fade-in">
      {/* Visual background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-brand-secondary/5 blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary capitalize mb-2">
          {isLogin ? "Welcome back" : "Create identity"}
        </h2>
        <p className="text-sm text-text-secondary">
          {isLogin
            ? "Enter your credentials to access the console"
            : "Sign up to begin deploying multi-agent tasks"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-subtle bg-bg-base/60 text-text-primary placeholder:text-text-muted focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all font-sans text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-subtle bg-bg-base/60 text-text-primary placeholder:text-text-muted focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all font-sans text-sm"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
        </div>

        {(validationError || message) && (
          <div className={`p-3 rounded-lg text-xs font-mono border ${
            validationError || message.toLowerCase().includes("fail") || message.toLowerCase().includes("offline") || message.toLowerCase().includes("error")
              ? "bg-red-950/20 text-red-400 border-red-500/20" 
              : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
          } transition-all`}>
            {validationError || message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-transition w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-semibold rounded-lg shadow-lg hover:shadow-brand-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{isLogin ? "Enter Workspace" : "Create & Enter"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary relative z-10">
        {isLogin ? (
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-primary hover:underline hover:text-brand-primary-hover transition-colors font-semibold"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-primary hover:underline hover:text-brand-primary-hover transition-colors font-semibold"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
