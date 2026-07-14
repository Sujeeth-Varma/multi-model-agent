import React from "react";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === "user";

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={`code-${index}`}
            className="inline-block px-1.5 py-0.5 rounded bg-bg-base border border-border-subtle text-brand-primary text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const renderRichText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-1.5">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={`space-${index}`} className="h-2" />;
          }

          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <div key={`bullet-${index}`} className="flex items-start gap-2 text-sm leading-relaxed pl-1">
                <span className="text-brand-primary select-none mt-1">▸</span>
                <span>{renderInlineFormatting(trimmed.slice(2))}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const spaceIndex = trimmed.indexOf(" ");
            const marker = trimmed.slice(0, spaceIndex);
            const rest = trimmed.slice(spaceIndex + 1);
            return (
              <div key={`number-${index}`} className="flex items-start gap-2 text-sm leading-relaxed pl-1">
                <span className="text-brand-primary font-mono select-none mt-0.5">{marker}</span>
                <span>{renderInlineFormatting(rest)}</span>
              </div>
            );
          }

          return (
            <p key={`paragraph-${index}`} className="text-sm leading-relaxed text-text-primary/95 m-0">
              {renderInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex gap-3 w-full fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
          <Bot className="w-4.5 h-4.5 animate-pulse" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 shadow-md border ${
          isUser
            ? "bg-brand-primary/10 border-brand-primary/20 text-text-primary rounded-tr-none"
            : "bg-bg-surface-elevated/40 border-border-subtle text-text-primary/90 rounded-tl-none"
        }`}
      >
        <div className="text-[9px] uppercase tracking-wider text-text-secondary/70 font-mono mb-1.5 select-none">
          {isUser ? "user" : "assistant"}
        </div>
        <div className="break-words font-sans">
          {renderRichText(content)}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary flex-shrink-0">
          <User className="w-4.5 h-4.5" />
        </div>
      )}
    </div>
  );
};
