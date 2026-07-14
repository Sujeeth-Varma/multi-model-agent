import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";

const TOKEN_STORAGE_KEY = "multi-agent-starter-token";
const EMAIL_STORAGE_KEY = "multi-agent-starter-email";

function App() {
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session state on mount
  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY) ?? "";
    if (savedToken) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    setToken("");
    setEmail("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-secondary flex items-center justify-center font-mono text-sm">
        <span>Initializing Console Session...</span>
      </div>
    );
  }

  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans">
        <Navbar token={token} email={email} onLogout={handleLogout} />
        
        <Routes>
          {/* Landing Route */}
          <Route path="/" element={<LandingPage token={token} />} />
          
          {/* Auth Routes: Redirect to dashboard if logged in */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterPage onRegisterSuccess={handleLoginSuccess} />
              )
            }
          />
          
          {/* Dashboard Route: Protected */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <DashboardPage
                  token={token}
                  loggedInEmail={email}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
