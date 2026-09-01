import type { ReactNode } from "react";

const TONES = {
  green: "bg-green-soft text-green",
  blue: "bg-blue-soft text-blue-deep",
  orange: "bg-orange-soft text-orange-deep",
} as const;

interface PillProps {
  tone: keyof typeof TONES;
  children: ReactNode;
}

export default function Pill({ tone, children }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-extrabold px-[9px] py-[3px] rounded-full ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
