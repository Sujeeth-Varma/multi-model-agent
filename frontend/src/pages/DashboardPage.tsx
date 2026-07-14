import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  MessageSquare, 
  Route as RouteIcon, 
  Zap, 
  Database, 
  Settings, 
  BarChart3, 
  Inbox, 
  Wrench, 
  Heart, 
  Download, 
  RefreshCw, 
  Trash2
} from "lucide-react";
import { MessageBubble } from "../components/MessageBubble";
import { Composer } from "../components/Composer";
import { StatusDot } from "../components/StatusDot";
import type { StatusTone } from "../components/StatusDot";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";


const QUICK_PROMPTS = [
  "How does LangGraph work?",
  "Explain Redis caching",
  "What is Langfuse observability?",
];

interface AgentResult {
  agent: string;
  output: string;
  metadata: Record<string, unknown>;
}

interface ChatResponse {
  conversation_id: string;
  route: string;
  answer: string;
  agents_used: string[];
  agent_results: AgentResult[];
  cached: boolean;
  context_messages?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HealthResponse {
  status: string;
  app: string;
  environment: string;
  llm_provider: string;
  redis_connected: boolean;
  elasticsearch_connected: boolean;
}

interface ActivityLog {
  id: string;
  time: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

interface DashboardPageProps {
  token: string;
  loggedInEmail: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  token,
  loggedInEmail,
  onLogout,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "✓ Ready. Test summary, search & multi-agent flows.",
    },
  ]);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);

  // Health and System state
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState("");
  const [lastHealthCheck, setLastHealthCheck] = useState("");
  const [clock, setClock] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Panel sizing
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(340);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  
  const resizeStateRef = useRef<{
    target: "left" | "right" | null;
    startX: number;
    startWidth: number;
  }>({
    target: null,
    startX: 0,
    startWidth: 0,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Time logging utility
  const appendLog = (level: ActivityLog["level"], message: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const logEntry: ActivityLog = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time,
      level,
      message,
    };

    setActivityLogs((current) => [logEntry, ...current].slice(0, 30));
  };

  // Health Check Call
  const fetchHealth = async (reason: string) => {
    setHealthLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Health check returned an unhealthy code.");
      }

      const data = await response.json() as HealthResponse;
      setHealth(data);
      setHealthError("");
      const checkedAt = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastHealthCheck(checkedAt);
      appendLog(
        "INFO",
        `${reason}: backend=${data.status}, redis=${data.redis_connected ? "online" : "offline"}, elastic=${data.elasticsearch_connected ? "online" : "offline"}, provider=${data.llm_provider}.`
      );
    } catch (error) {
      setHealth(null);
      const nextError = error instanceof Error ? error.message : "Failed to connect to backend health.";
      setHealthError(nextError);
      setLastHealthCheck(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      appendLog("ERROR", `${reason}: ${nextError}`);
    } finally {
      setHealthLoading(false);
    }
  };

  // Ingest batch sample data
  const handleIngestSample = async () => {
    if (!token || ingestLoading) return;

    setIngestLoading(true);
    appendLog("INFO", "Sample ingest triggered.");

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/ingest/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          onLogout();
          appendLog("ERROR", "Session expired during ingestion. Logging out.");
          return;
        }
        throw new Error(errorText || "Data ingestion failed.");
      }

      const data = await response.json() as {
        total_files_processed: number;
        total_documents_indexed: number;
        index_name: string;
      };

      appendLog(
        "INFO",
        `Ingest complete: indexed ${data.total_documents_indexed} docs from ${data.total_files_processed} files into ${data.index_name}.`
      );
      void fetchHealth("Post-ingest health check");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Ingest failed.";
      appendLog("ERROR", `Ingest error: ${msg}`);
    } finally {
      setIngestLoading(false);
    }
  };

  // Clear Chat History
  const handleClearHistory = async () => {
    if (!conversationId) {
      setMessages([
        { role: "assistant", content: "Workspace cleared." }
      ]);
      appendLog("WARN", "Console state reset.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${conversationId}/context`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error("Failed to clear conversation on server.");
      }

      setConversationId(null);
      setLastResponse(null);
      setMessages([
        { role: "assistant", content: "Workspace context cleared on server. Starting new session." }
      ]);
      appendLog("INFO", "Conversation context deleted from Redis/Backend memory.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Clear failed.";
      appendLog("ERROR", `Clear memory error: ${msg}`);
    }
  };

  // Send Message
  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || !token) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    appendLog("INFO", `Chat query sent: "${text.slice(0, 45)}${text.length > 45 ? "..." : ""}"`);

    const payloadHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          history: payloadHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          onLogout();
          appendLog("ERROR", "Session expired. Logging out.");
          return;
        }
        throw new Error(errorText || "Chat model response failed.");
      }

      const data = await response.json() as ChatResponse;
      setConversationId(data.conversation_id);
      setLastResponse(data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      
      appendLog(
        "INFO",
        `Chat success: route=${data.route}, agents=[${data.agents_used.join(", ")}], cache=${data.cached ? "hit" : "miss"}.`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Request failed.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}. Make sure backend is online.` },
      ]);
      appendLog("ERROR", `Chat routing fail: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial Health Probe
  useEffect(() => {
    void fetchHealth("Initial health probe");
    appendLog("INFO", `Logged in session: ${loggedInEmail}`);
  }, [loggedInEmail]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // PointerResize events
  const startResize = (target: "left" | "right", event: React.PointerEvent) => {
    resizeStateRef.current = {
      target,
      startX: event.clientX,
      startWidth: target === "left" ? leftPanelWidth : rightPanelWidth,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state.target) return;

      if (state.target === "left") {
        const delta = e.clientX - state.startX;
        setLeftPanelWidth(Math.min(Math.max(state.startWidth + delta, 200), 380));
      } else {
        const delta = state.startX - e.clientX;
        setRightPanelWidth(Math.min(Math.max(state.startWidth + delta, 250), 450));
      }
    };

    const handlePointerUp = () => {
      resizeStateRef.current = { target: null, startX: 0, startWidth: 0 };
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [leftPanelWidth, rightPanelWidth]);

  // Connection Tones
  const backendTone: StatusTone = healthError ? "offline" : health?.status === "ok" ? "online" : "neutral";
  const redisTone: StatusTone = health?.redis_connected ? "online" : "offline";
  const elasticTone: StatusTone = health?.elasticsearch_connected ? "online" : "offline";
  const modelTone: StatusTone = health?.llm_provider ? "online" : "offline";

  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 flex flex-col md:flex-row bg-bg-base overflow-hidden font-sans">
      
      {/* Left Sidebar toggler (mobile/tablet bar) */}
      <div className="md:hidden flex items-center justify-between border-b border-border-subtle bg-bg-surface px-4 py-2 text-xs font-mono text-text-secondary select-none">
        <button 
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className="flex items-center gap-1 py-1 px-2 rounded bg-bg-surface-elevated border border-border-subtle"
        >
          {showLeftSidebar ? "Hide Console" : "Show Console"}
        </button>
        <button 
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className="flex items-center gap-1 py-1 px-2 rounded bg-bg-surface-elevated border border-border-subtle"
        >
          {showRightSidebar ? "Hide Logs" : "Show Logs"}
        </button>
      </div>

      {/* 1. LEFT SIDEBAR PANEL */}
      <aside 
        style={{ width: showLeftSidebar ? `${leftPanelWidth}px` : "0px" }}
        className={`bg-bg-surface border-r border-border-subtle flex flex-col transition-all duration-300 md:duration-0 overflow-y-auto ${
          showLeftSidebar ? "block" : "hidden"
        } relative flex-shrink-0 z-20`}
      >
        <div className="p-4 space-y-6 min-w-[200px]">
          
          {/* Section: Console Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-secondary uppercase tracking-wider select-none">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Console</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            </div>

            <div className="space-y-2 text-xs font-mono text-text-secondary">
              <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                <span className="text-text-muted">User:</span>
                <span className="text-text-primary truncate max-w-[120px]">{loggedInEmail}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                <span className="text-text-muted">ID:</span>
                <span className="text-text-primary text-[10px] truncate max-w-[120px]" title={conversationId ?? "new"}>
                  {conversationId ? conversationId.slice(0, 8) + "..." : "new"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Route:</span>
                <span className="px-1.5 py-0.5 rounded bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold font-mono">
                  {lastResponse?.route ?? "direct"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: System Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 select-none">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-primary uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-brand-primary" />
                <span>System</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted">{clock || "--:--:--"}</span>
            </div>
            
            <div className="space-y-2">
              <StatusDot label="backend" tone={backendTone} />
              <StatusDot label="redis" tone={redisTone} />
              <StatusDot label="elastic" tone={elasticTone} />
              <StatusDot label="llm provider" tone={modelTone} />
            </div>
          </div>

          {/* Section: Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-[10px] font-mono text-text-secondary uppercase tracking-wider select-none">
              <Settings className="w-3.5 h-3.5" />
              <span>Actions</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleIngestSample}
                disabled={ingestLoading}
                className="btn-transition flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-brand-primary/20 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 text-xs font-semibold font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{ingestLoading ? "Ingesting..." : "Ingest Catalog"}</span>
              </button>

              <button
                type="button"
                onClick={() => void fetchHealth("Manual refresh")}
                disabled={healthLoading}
                className="btn-transition flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border-subtle bg-bg-surface-elevated/40 text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated/80 text-xs font-mono cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} />
                <span>{healthLoading ? "Checking..." : "Refresh Check"}</span>
              </button>

              <button
                type="button"
                onClick={handleClearHistory}
                className="btn-transition flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/20 bg-red-950/5 text-red-400 hover:bg-red-500/10 text-xs font-mono cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Resize handle left */}
      {showLeftSidebar && (
        <div
          onPointerDown={(e) => startResize("left", e)}
          className="hidden md:block w-1.5 hover:w-2 bg-border-subtle/30 hover:bg-brand-primary/40 cursor-col-resize select-none relative z-30 transition-colors"
        />
      )}

      {/* 2. CHAT PANEL (MIDDLE COLUMN) */}
      <section className="flex-1 flex flex-col bg-bg-base relative min-w-0 h-full overflow-hidden">
        {/* Top bar info */}
        <div className="border-b border-border-subtle bg-bg-surface/50 px-6 py-3 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-text-primary font-mono tracking-wider">WORKSPACE</span>
            <span className="h-4 w-px bg-border-subtle" />
            <div className="flex items-center gap-1 text-text-secondary">
              <Bot className="w-3.5 h-3.5 text-brand-primary" />
              <span className="font-mono text-[11px]">{health?.llm_provider ?? "ollama (running)"}</span>
            </div>
          </div>
          <div className="text-text-muted font-mono text-[10px]">
            context_messages: {lastResponse?.context_messages ?? 0}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, idx) => (
            <MessageBubble key={idx} role={message.role} content={message.content} />
          ))}

          {loading && (
            <div className="flex gap-3 w-full justify-start fade-in">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
                <Bot className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="max-w-[75%] rounded-xl p-4 bg-bg-surface-elevated/40 border border-border-subtle text-text-primary/95 rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <Composer
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          loading={loading}
          quickPrompts={QUICK_PROMPTS}
        />
      </section>

      {/* Resize handle right */}
      {showRightSidebar && (
        <div
          onPointerDown={(e) => startResize("right", e)}
          className="hidden md:block w-1.5 hover:w-2 bg-border-subtle/30 hover:bg-brand-primary/40 cursor-col-resize select-none relative z-30 transition-colors"
        />
      )}

      {/* 3. RIGHT DEVELOPER PANEL */}
      <aside 
        style={{ width: showRightSidebar ? `${rightPanelWidth}px` : "0px" }}
        className={`bg-bg-surface border-l border-border-subtle flex flex-col transition-all duration-300 md:duration-0 overflow-y-auto ${
          showRightSidebar ? "block" : "hidden"
        } relative flex-shrink-0 z-20 h-full`}
      >
        <div className="p-4 space-y-6 min-w-[250px] font-mono">
          
          {/* Section: Live Activity Logger */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-[10px] text-brand-secondary uppercase tracking-wider select-none">
              <BarChart3 className="w-4 h-4" />
              <span>Activity Terminal</span>
            </div>

            <div className="bg-bg-base/70 border border-border-subtle rounded-lg p-3 max-h-52 overflow-y-auto space-y-2 text-[10px] leading-relaxed">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-[50px_40px_1fr] gap-1.5 items-start">
                    <span className="text-text-muted">{log.time}</span>
                    <span className={`font-semibold tracking-wider ${
                      log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-yellow-400" : "text-brand-primary"
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-text-secondary break-all">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-text-muted italic py-1 select-none">Idle. Listening for events...</div>
              )}
            </div>
          </div>

          {/* Section: Diagnostics */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-[10px] text-brand-primary uppercase tracking-wider select-none">
              <Inbox className="w-4 h-4" />
              <span>Diagnostics</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-base/30 flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <RouteIcon className="w-3.5 h-3.5 text-brand-secondary" />
                  Route
                </span>
                <span className="text-text-primary text-[11px] font-bold">{lastResponse?.route ?? "--"}</span>
              </div>

              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-base/30 flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  Cache
                </span>
                <span className={`text-[11px] font-bold ${lastResponse?.cached ? "text-brand-primary" : "text-text-secondary"}`}>
                  {lastResponse ? (lastResponse.cached ? "HIT" : "MISS") : "--"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-border-subtle bg-bg-base/30 space-y-1.5">
                <div className="text-text-muted flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Agents Invoked</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lastResponse?.agents_used && lastResponse.agents_used.length > 0 ? (
                    lastResponse.agents_used.map((agent) => (
                      <span key={agent} className="px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-semibold">
                        {agent}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted italic text-[10px]">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Agent Output Stdout */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-[10px] text-text-secondary uppercase tracking-wider select-none">
              <Wrench className="w-4 h-4" />
              <span>Trace outputs</span>
            </div>

            <div className="space-y-3">
              {lastResponse?.agent_results && lastResponse.agent_results.length > 0 ? (
                lastResponse.agent_results.map((res) => (
                  <div key={res.agent} className="rounded-lg border border-border-subtle bg-bg-base/60 p-3 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1 select-none">
                      <span className="text-text-primary text-[11px] font-semibold uppercase">{res.agent}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                    </div>
                    <pre className="text-[10px] text-text-secondary whitespace-pre-wrap leading-relaxed overflow-x-auto font-mono max-h-32">
                      {res.output}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center rounded-lg border border-border-subtle/50 text-text-muted italic text-xs select-none">
                  No trace executions yet.
                </div>
              )}
            </div>
          </div>

          {/* Section: Diagnostic Health summary */}
          <div className="space-y-2 pt-2 text-[10px] text-text-muted">
            <div className="flex items-center gap-1 select-none">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>health diagnostics summary</span>
            </div>
            <div className="pl-4 space-y-1 leading-normal font-sans">
              <div>Provider: {health?.llm_provider ?? "unknown"}</div>
              <div>Environment: {health?.environment ?? "development"}</div>
              <div>Checked: {lastHealthCheck || "pending..."}</div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
};
