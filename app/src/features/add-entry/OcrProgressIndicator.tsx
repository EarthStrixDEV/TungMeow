import Spinner from "../../components/ui/Spinner";

type OcrStage = "reading" | "structuring";

const STAGE_LABELS: Record<OcrStage, string> = {
  reading: "Reading your slip...",
  structuring: "Organizing the details...",
};

interface OcrProgressIndicatorProps {
  stage: OcrStage | null;
}

export default function OcrProgressIndicator({ stage }: OcrProgressIndicatorProps) {
  if (stage === null) return null;

  return (
    <div className="flex items-center gap-3 bg-hover rounded-input px-4 py-3">
      <Spinner />
      <span className="text-sm text-ink-soft font-bold">{STAGE_LABELS[stage]}</span>
    </div>
  );
}
