import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
const TOKEN_STORAGE_KEY = "multi-agent-starter-token";
const EMAIL_STORAGE_KEY = "multi-agent-starter-email";

interface RegisterPageProps {
  onRegisterSuccess: (token: string, email: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (email: string, password: string) => {
    setLoading(true);
    setMessage("Creating identity...");

    try {
      // 1. Register User
      const registerResponse = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        throw new Error(errorText || "Registration failed.");
      }

      setMessage("Account created. Logging in...");

      // 2. Log in User Automatically
      const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Automatic login failed. Please sign in manually.");
      }

      const data = await loginResponse.json() as { access_token: string; email: string };
      
      // Save session
      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      window.localStorage.setItem(EMAIL_STORAGE_KEY, data.email);
      
      onRegisterSuccess(data.access_token, data.email);
      setMessage("Login successful. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Registration failed.";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        loading={loading}
        message={message}
      />
    </div>
  );
};
