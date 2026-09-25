"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface IstClockProps {
  className?: string;
  showIcon?: boolean;
  showBadge?: boolean;
}

export function IstClock({
  className = "",
  showIcon = true,
  showBadge = true,
}: IstClockProps) {
  const [timeStr, setTimeStr] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Asia/Kolkata timezone (IST) with HH:mm:ss AM/PM
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-neutral-400 font-mono ${className}`}>
        {showIcon && <Clock size={13} className="animate-pulse text-amber-500" />}
        <span>--:--:-- IST</span>
      </span>
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={`inline-flex items-center gap-2 text-xs font-mono font-medium text-neutral-200 bg-neutral-900/90 border border-neutral-800/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm ${className}`}
      title="Indian Standard Time (IST)"
    >
      {showBadge && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {showIcon && <Clock size={13} className="text-amber-400 shrink-0" />}
      <span className="tracking-wide">{timeStr} IST</span>
    </span>
  );
}
