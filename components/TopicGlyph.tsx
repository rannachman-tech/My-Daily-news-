"use client";

import type { TopicId } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";

interface Props {
  topic: TopicId;
  variant?: "card" | "hero";
}

export function TopicGlyph({ topic, variant = "card" }: Props) {
  const t = TOPIC_BY_ID[topic];
  const hue = t?.hue ?? "#888";
  const Icon = ICONS[topic] ?? ICONS.business;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: "rgb(var(--surface-2))",
        backgroundImage: `radial-gradient(ellipse at 80% 20%, ${hue}33 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, ${hue}22 0%, transparent 50%), linear-gradient(135deg, ${hue}10 0%, transparent 100%)`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(circle, ${hue} 0.7px, transparent 0.7px)`,
          backgroundSize: variant === "hero" ? "24px 24px" : "18px 18px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon color={hue} size={variant === "hero" ? 96 : 64} />
      </div>
   {/* Topic label, bottom-right — subtle */}
      <div className="absolute bottom-2 right-2 text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: hue, opacity: 0.4 }}>
        {t?.shortLabel ?? topic}
      </div>
    </div>
  );
}

interface IconProps { color: string; size: number; }

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
  opacity: 0.5,
});

const ICONS: Record<TopicId, (p: IconProps) => JSX.Element> = {
  ai: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="6" x2="9" y2="3" />
      <line x1="12" y1="6" x2="12" y2="3" />
      <line x1="15" y1="6" x2="15" y2="3" />
      <line x1="9" y1="21" x2="9" y2="18" />
      <line x1="12" y1="21" x2="12" y2="18" />
      <line x1="15" y1="21" x2="15" y2="18" />
      <line x1="3" y1="9" x2="6" y2="9" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="3" y1="15" x2="6" y2="15" />
      <line x1="18" y1="9" x2="21" y2="9" />
      <line x1="18" y1="12" x2="21" y2="12" />
      <line x1="18" y1="15" x2="21" y2="15" />
    </svg>
  ),
  finance: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  ),
  crypto: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
      <path d="M10 8h3.5a2 2 0 0 1 0 4H10z" />
      <path d="M10 12h4a2 2 0 0 1 0 4H10z" />
      <line x1="11" y1="6" x2="11" y2="8" />
      <line x1="13" y1="6" x2="13" y2="8" />
      <line x1="11" y1="16" x2="11" y2="18" />
      <line x1="13" y1="16" x2="13" y2="18" />
    </svg>
  ),
  politics: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <polyline points="3 11 12 4 21 11" />
      <line x1="3" y1="11" x2="21" y2="11" />
      <line x1="6" y1="11" x2="6" y2="19" />
      <line x1="10" y1="11" x2="10" y2="19" />
      <line x1="14" y1="11" x2="14" y2="19" />
      <line x1="18" y1="11" x2="18" y2="19" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  ),
  business: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  ),
  science: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <path d="M9 3h6v5l4.5 9.5a2 2 0 0 1-1.8 2.85H6.3a2 2 0 0 1-1.8-2.85L9 8z" />
      <line x1="8" y1="3" x2="16" y2="3" />
      <line x1="7.5" y1="13" x2="16.5" y2="13" />
    </svg>
  ),
};
