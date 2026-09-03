import type { MascotMood } from "../../lib/mascotMood";

interface CatLogoProps {
  size?: number;
  mood?: MascotMood;
}

const MOUTH_PATHS: Record<MascotMood, string> = {
  neutral: "M44 53 Q48 57 52 53",
  happy: "M42 53 Q48 61 54 53",
  worried: "M45 55 Q48 52 51 55",
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
      <path d="M25 37 19 15 39 26a34 34 0 0 1 18 0l20-11-6 22a29 29 0 0 1-4 34c-4 5-11 9-19 10-8-1-15-5-19-10a29 29 0 0 1-4-34Z" fill="#302A27" />
      <path d="m25 23 10 6-8 9-2-15Zm46 0-10 6 8 9 2-15Z" fill="#F28C4B" />
      <path d="M34 42c3-3 8-3 11 0M51 42c3-3 8-3 11 0" stroke="#F2B24D" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="38" cy="49" rx="4.7" ry="5.8" fill="#FEFCF9" />
      <ellipse cx="58" cy="49" rx="4.7" ry="5.8" fill="#FEFCF9" />
      <circle cx="38" cy="50" r="2.3" fill="#302A27" />
      <circle cx="58" cy="50" r="2.3" fill="#302A27" />
      {mood === "worried" && (
        <>
          <path
            d="M33 42 L41 45"
            stroke="#302A27"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M63 42 L55 45"
            stroke="#302A27"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d={MOUTH_PATHS[mood]}
        stroke="#FEFCF9"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M31 63c5 7 29 7 34 0l-2 10c-7 6-23 6-30 0l-2-10Z" fill="#3A63C4" />
      <circle cx="48" cy="70" r="9" fill="#F2B24D" stroke="#302A27" strokeWidth="2" />
      <path d="m43 72 3-4 3 2 4-5" stroke="#302A27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="29" cy="57" r="2.5" fill="#F28C4B" />
      <circle cx="67" cy="57" r="2.5" fill="#F28C4B" />
    </svg>
  );
}
