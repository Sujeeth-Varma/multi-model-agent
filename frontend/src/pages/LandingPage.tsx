import React from "react";
import { Link } from "react-router";
import { 
  Bot, 
  Terminal, 
  Database, 
  Zap, 
  Activity, 
  Shield, 
  ArrowRight,
  Server,
  Layers,
  ArrowRightLeft
} from "lucide-react";

interface LandingPageProps {
  token: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ token }) => {
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col relative overflow-hidden fade-in">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-secondary/5 blur-[100px] pointer-events-none" />
      
      {/* Hero Section */}
      <section className="flex-1 max-w-6xl w-full mx-auto px-6 pt-20 pb-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-xs font-mono select-none uppercase tracking-wider animate-pulse mx-auto">
          <Zap className="w-3.5 h-3.5" />
          <span>Multi-Model Intelligence</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-text-primary">
          Orchestrate Autonomous Agents <br/>
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            With High Observability
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Test model routers, vector search indexes, and caching memories in a single, high-fidelity developer workspace. Optimize routing paths for sub-second responses.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="btn-transition flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-semibold rounded-lg shadow-lg hover:shadow-brand-primary/20 cursor-pointer"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Enter Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#architecture"
            className="btn-transition flex items-center gap-2 px-6 py-3.5 rounded-lg border border-border-subtle bg-bg-surface-elevated/20 text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated/40 cursor-pointer"
          >
            Learn Architecture
          </a>
        </div>

        {/* Visual Mockup - Flow Diagram */}
        <div id="architecture" className="pt-20 max-w-4xl mx-auto">
          <div className="glass-panel p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="absolute top-2 right-4 text-[10px] font-mono text-text-muted select-none">
              system_pipeline_flow.sh
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 items-center gap-4 md:gap-2 text-center text-xs font-mono text-text-secondary">
              <div className="p-3.5 rounded-lg border border-border-subtle bg-bg-base/80 flex flex-col items-center gap-2">
                <Terminal className="w-5 h-5 text-brand-secondary" />
                <span className="font-semibold text-text-primary">User Prompt</span>
                <span className="text-[10px] text-text-muted">console inputs</span>
              </div>
              
              <div className="flex justify-center select-none text-brand-primary">
                <ArrowRightLeft className="w-5 h-5 rotate-90 md:rotate-0" />
              </div>

              <div className="p-3.5 rounded-lg border border-brand-primary/20 bg-brand-primary/5 flex flex-col items-center gap-2 md:col-span-1">
                <Bot className="w-5 h-5 text-brand-primary" />
                <span className="font-semibold text-text-primary">Agent Router</span>
                <span className="text-[10px] text-text-muted">decides flow</span>
              </div>

              <div className="flex justify-center select-none text-brand-primary">
                <ArrowRightLeft className="w-5 h-5 rotate-90 md:rotate-0" />
              </div>

              <div className="grid grid-rows-2 gap-2 w-full">
                <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-base/80 flex items-center justify-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-semibold text-text-primary text-[11px]">Redis Cache</div>
                    <div className="text-[9px] text-text-muted text-left">speeds identical queries</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-base/80 flex items-center justify-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-text-primary text-[11px]">ElasticSearch</div>
                    <div className="text-[9px] text-text-muted text-left">indexes catalog data</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-bg-surface/50 border-t border-border-subtle py-20 px-6 relative z-10">
        <div className="max-w-6xl w-full mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              Engineered for High-Performance Observability
            </h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
              Inspect agent routing, intermediate outputs, database states, and connection logs in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Intelligent Routing</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automatically determines query intent to select and invoke specific agent chains, optimizing costs and reliability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Vector-Driven Retrieval</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Indexes catalogs and text formats into ElasticSearch to feed relevant factual contexts back to LLM prompts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">In-Memory caching</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Identical tasks return cached results from Redis instantly, conserving server runs and database resources.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Live Activity Terminal</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Stream connection events, route decisions, and health checks as they happen in a responsive side console.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Multi-Model Backends</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Supports Ollama, HuggingFace, OpenAI, and custom API provider connections. Easily inspect what provider is running.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel p-6 space-y-4 hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Protected Environments</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Restricted dashboard panels ensure that only authorized developer logs and chats are saved and retrieved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-base py-8 px-6 text-center text-xs text-text-muted relative z-10 font-mono">
        <p>© {new Date().getFullYear()} Multi-Model Agent Platform. Redesigned with Vite, React, TS, and Tailwind CSS v4.</p>
      </footer>
    </div>
  );
};
