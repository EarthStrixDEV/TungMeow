import type { Category } from "../../data";

interface CategoryChipsProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = cat.id === selected;
        return (
          <button
            type="button"
            key={cat.id}
            aria-pressed={isSelected}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-[9px] rounded-input border-[1.5px] font-bold text-sm cursor-pointer transition-colors ${
              isSelected
                ? "border-blue bg-blue-soft text-blue-deep"
                : "border-line bg-surface text-ink"
            }`}
          >
            {cat.emoji} {cat.id}
          </button>
        );
      })}
    </div>
  );
}
