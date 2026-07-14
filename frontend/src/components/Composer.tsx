import type { KeyboardEvent } from "react";
import { Send, Loader2, Keyboard, Zap } from "lucide-react";

interface ComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (overrideText?: string) => void;
  loading: boolean;
  quickPrompts: string[];
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  setInput,
  onSend,
  loading,
  quickPrompts,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="border-t border-border-subtle bg-bg-surface p-4 space-y-4 shadow-lg sticky bottom-0">
      {/* Quick Prompts */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-primary uppercase tracking-wider select-none">
          <Zap className="w-3.5 h-3.5 text-brand-primary" />
          <span>Quick Prompts</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleQuickPromptClick(prompt)}
              className="btn-transition py-1.5 px-3 rounded-lg border border-border-subtle bg-bg-surface-elevated/40 text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 text-xs font-mono whitespace-nowrap cursor-pointer hover:bg-brand-primary/5"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="relative glass-panel p-2 flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message... (Cmd/Ctrl + Enter to send)"
          rows={3}
          disabled={loading}
          className="w-full bg-transparent text-text-primary placeholder:text-text-muted text-sm font-sans resize-none outline-none border-none p-2 focus:ring-0"
        />

        <div className="flex items-center justify-between border-t border-border-subtle pt-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted select-none">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Cmd/Ctrl + Enter</span>
          </div>

          <button
            onClick={() => onSend()}
            disabled={loading || !input.trim()}
            className="btn-transition flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-bg-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-brand-primary/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
