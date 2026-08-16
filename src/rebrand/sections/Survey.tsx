import { useState } from 'react';
import { TitlePill, Button } from '../primitives';
import { SpirographFlower } from '../brand';
import DiagnosticModal from '../DiagnosticModal';

export default function Survey() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  // Held so a later section can prefill it, matching the current landing page.
  const [, setEmail] = useState('');

  return (
    <section id="manifesto" className="w-full bg-[var(--color-blue-600)] px-[clamp(20px,8vw,277px)] py-[clamp(48px,8vw,64px)]">
      <div className="mx-auto flex w-full max-w-[886px] flex-col items-center gap-[24px]">
        <span className="text-[var(--color-white)]"><SpirographFlower size={215} /></span>

        <div className="flex w-full flex-col items-center gap-[32px]">
          <TitlePill surface="blue">NETWORK DIAGNOSTIC</TitlePill>

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

          <Button surface="blue" size="lg" onClick={() => setOpen(true)}>
            {done ? 'RETAKE DIAGNOSTIC' : 'RUN DIAGNOSTIC'}
          </Button>
        </div>
      </div>

      <DiagnosticModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onEmailSubmitted={setEmail}
        onComplete={() => {
          setDone(true);
          setOpen(false);
        }}
      />
    </section>
  );
}
