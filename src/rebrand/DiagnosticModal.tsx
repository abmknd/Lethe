import { useEffect, useRef, useState, type FormEvent } from 'react';
import { TitlePill, Button } from './ui';
import { signup } from '../lib/signup';

/**
 * Network diagnostic, rebuilt in the new brand.
 *
 * The questions are carried over verbatim from the current landing page's
 * DiagnosticModal so the survey itself is unchanged; what is new is the shell,
 * which is built from the rebrand tokens rather than the old chartreuse layer.
 * Email lands on the same `signup` edge function, source "diagnostic".
 */
const QUESTIONS = [
  {
    label: 'THE ASK',
    text: "When you need something you can't get alone, what actually happens?",
    options: [
      'I have someone. It works.',
      'I reach out and get something polite and empty.',
      "I don't ask. I figure it out alone.",
      'I would not know who to ask.',
    ],
  },
  {
    label: 'THE ROOM CHECK',
    text: 'Think about the last professional or intellectual gathering you were in. What did you leave with?',
    options: [
      'Nothing. It was the wrong room entirely.',
      'A few contacts I never followed up on.',
      'One interesting exchange that went nowhere.',
      "I've stopped going to these things.",
    ],
  },
  {
    label: 'THE PLATFORM SIGNAL',
    text: 'When you open LinkedIn right now, what is your honest reaction?',
    options: [
      'Noise. I scroll and leave with nothing.',
      "FOMO. Everyone looks like they're further ahead.",
      'Invisible. I post, but nothing lands.',
      "Irrelevant. The people I actually need aren't there.",
    ],
  },
  {
    label: 'THE LAST REAL CONVERSATION',
    text: 'The last conversation that genuinely changed how you think: how long ago was it?',
    options: [
      "I can't remember one.",
      'Over a year ago.',
      'A few months back, but it was luck, not system.',
      'Recently, but it took years to get to that person.',
    ],
  },
  {
    label: 'THE GAP',
    text: 'If you could add one type of person to your life right now, who would they be?',
    options: [
      "Someone who has already navigated what I'm navigating.",
      'Someone who thinks in a way that sharpens how I think.',
      'Someone building something adjacent who actually gets the work.',
      "Someone with access to the rooms I haven't reached yet.",
    ],
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function DiagnosticModal({ isOpen, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0); // 0..4 questions, 5 = email
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset whenever it reopens, so a second run does not resume mid-survey.
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers([]);
      setEmail('');
      setErr(null);
      closeRef.current?.focus();
    }
  }, [isOpen]);

  // Escape to close, and the page behind must not scroll while this is up.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      // Focus trap: a modal that lets you tab into the page behind it is a bug.
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const answer = (i: number) => {
    setAnswers((a) => [...a, i]);
    setStep((s) => s + 1);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setErr(null);
    const res = await signup({ email: email.trim(), source: 'diagnostic' });
    setSending(false);
    if (res.status === 'error') {
      setErr('Something went wrong. Try again.');
      return;
    }
    onComplete();
  }

  const q = QUESTIONS[step];
  const pct = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div
      className="rebrand-root fixed inset-0 z-50 overflow-y-auto bg-[var(--color-blue-600)]"
      role="dialog"
      aria-modal="true"
      aria-label="Network diagnostic"
    >
      <div ref={panelRef} className="mx-auto flex min-h-full w-full max-w-[720px] flex-col px-[clamp(20px,5vw,32px)] py-[clamp(24px,5vh,56px)]">
        <div className="flex items-center justify-between">
          <TitlePill surface="blue">NETWORK DIAGNOSTIC</TitlePill>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close diagnostic"
            className="flex size-[40px] items-center justify-center rounded-full border border-[var(--color-white)] text-[20px] leading-none text-[var(--color-white)] transition-colors hover:bg-[var(--color-surface-raised)]"
          >
            ×
          </button>
        </div>

        {/* Progress, using the same bar language as the cohort scroller. */}
        <div className="mt-[24px] flex w-full items-center gap-[4px]" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={
                'h-[4px] flex-1 transition-colors duration-300 ' +
                (i === 0 ? 'rounded-l-[8px] ' : '') +
                (i === QUESTIONS.length - 1 ? 'rounded-r-[8px] ' : '') +
                (i < step ? 'bg-[var(--color-yellow-600)]' : 'bg-[var(--color-surface-raised)]')
              }
            />
          ))}
        </div>

        {q ? (
          <div className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className="text-[13px] leading-[18px] tracking-[1px] text-[var(--color-blue-200)]">
              {q.label} · {step + 1}/{QUESTIONS.length}
            </p>
            <h2 className="rebrand-display mt-[12px] text-[clamp(26px,4.5vw,40px)] font-normal leading-[1.1] text-white">
              {q.text}
            </h2>

            <div className="mt-[32px] flex flex-col gap-[12px]">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => answer(q.options.indexOf(opt))}
                  className="rounded-[16px] border border-[var(--color-white)] px-[20px] py-[16px] text-left text-[16px] leading-[1.35] text-[var(--color-white)] transition-colors hover:bg-[var(--color-white)] hover:text-[var(--color-blue-600)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className="text-[13px] leading-[18px] tracking-[1px] text-[var(--color-blue-200)]">RESULT READY · {pct}% MAPPED</p>
            <h2 className="rebrand-display mt-[12px] text-[clamp(26px,4.5vw,40px)] font-normal leading-[1.1] text-white">
              Your network has a <span className="text-[var(--color-yellow-600)]">proximity problem</span>, not a
              capability one.
            </h2>
            <p className="mt-[16px] max-w-[52ch] text-[16px] leading-[1.5] text-[var(--color-white)]">
              The people who could open the right doors are not in your current orbit. Leave your email and we will use
              this to find your people when matchmaking opens.
            </p>

            <form onSubmit={submit} noValidate className="mt-[32px] w-full max-w-[520px]">
              <div className="flex items-center justify-between rounded-[48px] border border-white bg-[var(--color-blue-600)] p-[4px] pl-[24px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-white)]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  disabled={sending}
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] text-white outline-none placeholder:text-[var(--color-placeholder)]"
                />
                <Button type="submit" surface="blue" disabled={sending || !email.trim()} className="tracking-[1.5px]">
                  {sending ? 'SAVING…' : 'GET RESULT'}
                </Button>
              </div>
              {err && (
                <p role="alert" className="mt-[8px] text-[13px] leading-[18px] text-[var(--color-yellow-600)]">
                  {err}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
