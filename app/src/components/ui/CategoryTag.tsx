import type { ReactNode } from "react";

interface CategoryTagProps {
  tone: "blue" | "orange";
  children: ReactNode;
}

export default function CategoryTag({ tone, children }: CategoryTagProps) {
  return (
    <span
      className={`inline-flex items-center text-[11.5px] font-bold px-[10px] py-1 rounded-full ${
        tone === "blue" ? "bg-blue-soft text-blue-deep" : "bg-orange-soft text-orange-deep"
      }`}
    >
      {children}
    </span>
  );
}
