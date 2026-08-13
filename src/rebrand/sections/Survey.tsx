import { useState } from 'react';
import { Tag, SpirographFlower } from '../ui';
import DiagnosticModal from '../DiagnosticModal';

export default function Survey() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <section id="manifesto" className="w-full bg-[var(--color-blue-600)] px-[clamp(20px,8vw,277px)] py-[clamp(48px,8vw,64px)]">
      <div className="mx-auto flex w-full max-w-[886px] flex-col items-center gap-[24px]">
        <SpirographFlower size={215} />

        <div className="flex w-full flex-col items-center gap-[32px]">
          <Tag variant="depth">NETWORK DIAGNOSTIC</Tag>

          <div className="flex w-full flex-col items-center gap-[24px]">
            <h2 className="rebrand-display w-full max-w-[640px] text-center text-[clamp(30px,6vw,64px)] font-normal leading-[1.1] tracking-[1px] text-white">
              {done ? 'Your profile is saved.' : 'How healthy is your network?'}
            </h2>
            <p className="w-full max-w-[528px] text-center text-[16px] font-normal leading-[1.2] text-white">
              {done
                ? "We'll use it to find your people when matchmaking opens."
                : 'Same. But now, you can explore what lies in wait before you face it. Ready to leap, but scared of the unknown?'}
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-[40px] bg-white px-[20px] py-[12px] text-[14px] font-medium leading-[16px] tracking-[1px] text-[var(--color-blue-600)] transition-opacity hover:opacity-90"
          >
            {done ? 'RETAKE DIAGNOSTIC' : 'RUN DIAGNOSTIC'}
          </button>
        </div>
      </div>

      <DiagnosticModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onComplete={() => {
          setDone(true);
          setOpen(false);
        }}
      />
    </section>
  );
}
