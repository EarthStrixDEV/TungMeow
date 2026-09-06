import { useState } from "react";
import { Paperclip } from "lucide-react";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, pre-compression cap

interface SlipUploadButtonProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function SlipUploadButton({ onFileSelected, disabled }: SlipUploadButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error/retry
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError("That file is too big — please attach a slip under 10MB.");
      return;
    }

    setError(null);
    onFileSelected(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="slip-upload-input"
        className={`flex items-center justify-center gap-2 w-full rounded-[14px] py-[15px] text-[15px] font-extrabold border-[1.5px] border-line text-ink transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-hover"
        }`}
      >
        <Paperclip size={18} />
        Attach a slip
      </label>
      <input
        id="slip-upload-input"
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
      {error && (
        <div className="bg-red-soft text-red rounded-input px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
