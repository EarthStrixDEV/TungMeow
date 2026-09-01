interface CategoryIconProps {
  emoji: string;
  tone: "blue" | "orange";
  size?: number;
}

export default function CategoryIcon({ emoji, tone, size = 36 }: CategoryIconProps) {
  return (
    <div
      className={`rounded-[10px] flex items-center justify-center shrink-0 ${
        tone === "blue" ? "bg-blue-soft" : "bg-orange-soft"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}
