

export type StatusTone = "online" | "offline" | "neutral";

interface StatusDotProps {
  label: string;
  tone: StatusTone;
  compact?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  label,
  tone,
  compact = false,
}) => {
  const isOnline = tone === "online";
  const isOffline = tone === "offline";


  let dotColorClass = "bg-yellow-500 pulse-neutral";
  let textColorClass = "text-yellow-400";
  let statusText = "idle";

  if (isOnline) {
    dotColorClass = "bg-brand-primary pulse-online";
    textColorClass = "text-brand-primary";
    statusText = "online";
  } else if (isOffline) {
    dotColorClass = "bg-red-500 pulse-offline";
    textColorClass = "text-red-400";
    statusText = "offline";
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className={`w-2 h-2 rounded-full ${dotColorClass}`} />
        <span className="text-text-secondary capitalize">{label}:</span>
        <span className={`${textColorClass} font-semibold uppercase text-[10px]`}>
          {statusText}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-border-subtle bg-bg-base/40 text-xs font-mono">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full ${dotColorClass}`} />
        <span className="text-text-secondary capitalize">{label}</span>
      </div>
      <span className={`${textColorClass} font-semibold uppercase text-[10px]`}>
        {statusText}
      </span>
    </div>
  );
};
