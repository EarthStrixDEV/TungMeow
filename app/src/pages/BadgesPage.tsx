import BadgeCollection from "../features/badges/BadgeCollection";

export default function BadgesPage() {
  return (
    <div className="flex max-w-[900px] flex-col gap-4 desktop:gap-5">
      <header>
        <h1 className="text-[22px] desktop:text-[26px] font-extrabold">Badges</h1>
        <p className="mt-1 text-sm text-ink-soft">Collect badges by building good money habits</p>
      </header>

      <BadgeCollection />
    </div>
  );
}
