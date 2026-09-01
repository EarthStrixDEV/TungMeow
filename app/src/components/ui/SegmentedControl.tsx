interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex gap-1 bg-hover rounded-[14px] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-[10px] text-[13px] font-bold ${
            option.value === value
              ? "bg-blue text-white shadow-[0_4px_12px_-4px_rgba(58,99,196,0.5)]"
              : "text-ink-soft"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
