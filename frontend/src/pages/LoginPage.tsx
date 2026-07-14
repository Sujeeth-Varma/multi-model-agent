import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
const TOKEN_STORAGE_KEY = "multi-agent-starter-token";
const EMAIL_STORAGE_KEY = "multi-agent-starter-email";

interface LoginPageProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setMessage("Authorizing session...");

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed.");
      }

      const data = await response.json() as { access_token: string; email: string };
      
      // Save in LocalStorage
      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      window.localStorage.setItem(EMAIL_STORAGE_KEY, data.email);
      
      onLoginSuccess(data.access_token, data.email);
      setMessage("Login successful. Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Authentication failed.";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        loading={loading}
        message={message}
      />
    </div>
  );
};
