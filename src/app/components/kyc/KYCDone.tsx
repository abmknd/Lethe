import { Button } from '../../../rebrand/primitives';

/** Terminal screen, light: everything about you is now known. */
export function KYCDone({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-[16px] p-[24px] text-center">
      <div className="grid size-[72px] place-items-center rounded-full border border-[var(--color-black-100)]">
        <span className="grid size-[32px] place-items-center rounded-full bg-[var(--color-blue-600)] text-[15px] font-medium leading-none text-[var(--color-white)]">
          ✓
        </span>
      </div>

      <h2 className="rebrand-display mt-[6px] text-[40px] font-normal leading-[100%] text-[var(--color-black-700)]">
        You're <span className="text-[var(--color-blue-600)]">live.</span>
      </h2>

      <p className="max-w-[340px] text-[16px] leading-[120%] text-[var(--color-black-700)]">
        Your first match arrives next week. In the meantime, the feed is yours.
      </p>
      <p className="text-[13px] leading-[18px] text-[var(--color-black-500)]">
        You can pause matching anytime from your settings.
      </p>

      <Button size="lg" className="mt-[8px] px-[32px]" onClick={onFinish}>
        GO TO MY FEED
      </Button>
    </div>
  );
}
