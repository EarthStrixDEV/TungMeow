import Pill from "../../components/ui/Pill";

interface OcrFieldBadgeProps {
  confidence: "high" | "low" | "guessed";
}

/** High confidence = no badge; low/guessed both surface the same "verify me" nudge. */
export default function OcrFieldBadge({ confidence }: OcrFieldBadgeProps) {
  if (confidence === "high") return null;
  return <Pill tone="orange">⚠ Please check</Pill>;
}
