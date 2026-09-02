import type { MascotMood } from "../../lib/mascotMood";

interface CatLogoProps {
  size?: number;
  mood?: MascotMood;
}

const MOUTH_PATHS: Record<MascotMood, string> = {
  neutral: "M45 58 Q48 61 51 58",
  happy: "M42 58 Q48 66 54 58",
  worried: "M45 60 Q48 57 51 60",
};

export default function CatLogo({ size = 34, mood = "neutral" }: CatLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="48" cy="48" r="46" fill="var(--color-orange-soft)" />
      <path d="M28 30 L20 14 L38 24 Z" fill="#3a2f28" />
      <path d="M68 30 L76 14 L58 24 Z" fill="#3a2f28" />
      <ellipse cx="48" cy="52" rx="30" ry="27" fill="#3a2f28" />
      <ellipse cx="38" cy="48" rx="4.2" ry="5.5" fill="#fefcf9" />
      <ellipse cx="58" cy="48" rx="4.2" ry="5.5" fill="#fefcf9" />
      {mood === "worried" && (
        <>
          <path
            d="M33 40 L41 43"
            stroke="#3a2f28"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M63 40 L55 43"
            stroke="#3a2f28"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d={MOUTH_PATHS[mood]}
        stroke="#fefcf9"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="30" cy="58" r="3" fill="var(--color-orange)" />
      <circle cx="66" cy="58" r="3" fill="var(--color-blue)" />
    </svg>
  );
}
