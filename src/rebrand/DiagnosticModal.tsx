import { useEffect, useRef, useState, type FormEvent } from 'react';
import { TitlePill, Button, SegmentedBar } from './primitives';
import { signup } from '../lib/signup';
import {
  QUESTIONS,
  RESULT_COPY,
  OPT_KEYS,
  classifyCommunity,
  computeArchetype,
  type Community,
  type Archetype,
} from '../lib/diagnostic';

/**
 * Network diagnostic in the new brand.
 *
 * This is a RESKIN, not a rewrite. Every question, the scoring, and all twelve
 * result variants come from src/lib/diagnostic.ts, which was extracted verbatim
 * from the existing modal. Only the shell is new.
 *
 * The flow is ten steps, and each one earns its place:
 *   0  free text  -> classifies community (independents / epistemics / impact)
 *   1  processing
 *   2..6  five questions -> letter answers compute the archetype
 *   7  processing
 *   8  email gate -> signup(source: "diagnostic")
 *   9  result, keyed by [community][archetype]
 *
 * An earlier version of this file collapsed all of that into one fixed result
 * and paraphrased question 1. Because scoring maps by option LETTER, that
 * paraphrase silently scored the wrong archetype. Hence the single source.
 */

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmitted: (email: string) => void;
  onComplete?: () => void;
};

const FIRST_Q = 2;
const LAST_Q = 6;

export default function DiagnosticModal({ isOpen, onClose, onEmailSubmitted, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [freetext, setFreetext] = useState('');
  const [community, setCommunity] = useState<Community>('independents');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [archetype, setArchetype] = useState<Archetype>('signal_seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setFreetext('');
    setCommunity('independents');
    setAnswers({});
    setArchetype('signal_seeker');
    setName('');
    setEmail('');
    setSending(false);
    setDuplicate(false);
    setErr(null);
    closeRef.current?.focus();
  }, [isOpen]);

  // The two processing beats. They are not decoration: they are what makes the
  // result feel computed rather than looked up.
  useEffect(() => {
    if (!isOpen) return;
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(t);
    }
    if (step === 7) {
      const t = setTimeout(() => setStep(8), 2500);
      return () => clearTimeout(t);
    }
  }, [step, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])',
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

  const startAudit = (e: FormEvent) => {
    e.preventDefault();
    if (!freetext.trim()) return;
    setCommunity(classifyCommunity(freetext));
    setStep(1);
  };

  const answer = (qKey: string, optKey: string) => {
    const updated = { ...answers, [qKey]: optKey };
    setAnswers(updated);
    if (qKey === 'q5') setArchetype(computeArchetype(updated));
    setStep((s) => s + 1);
  };

  async function submitGate(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setErr(null);
    const res = await signup({
      email: email.trim(),
      source: 'diagnostic',
      name: name.trim() || undefined,
    });
    setSending(false);
    if (res.status === 'error') {
      setErr('Something went wrong. Try again.');
      return;
    }
    onEmailSubmitted(email.trim());
    setDuplicate(res.status === 'duplicate');
    setStep(9);
  }

  const qIndex = step >= FIRST_Q && step <= LAST_Q ? step - FIRST_Q : -1;
  const q = qIndex >= 0 ? QUESTIONS[qIndex] : null;
  // Shape is [archetype].variants[community]: the archetype owns the name and
  // tagline, the community selects which gap/who copy it renders with.
  const reading = RESULT_COPY[archetype];
  const variant = reading?.variants[community];

  const label = 'text-[13px] leading-[18px] tracking-[1px] text-[var(--color-blue-200)]';
  const heading =
    'rebrand-display mt-[12px] text-[clamp(26px,4.5vw,40px)] font-normal leading-[1.1] text-[var(--color-white)]';
  const body = 'mt-[16px] max-w-[52ch] text-[16px] leading-[1.5] text-[var(--color-white)]';

  return (
    <div
      className="rebrand-root fixed inset-0 z-50 overflow-y-auto bg-[var(--color-blue-600)]"
      role="dialog"
      aria-modal="true"
      aria-label="Network diagnostic"
    >
      <div
        ref={panelRef}
        className="mx-auto flex min-h-full w-full max-w-[720px] flex-col px-[clamp(20px,5vw,32px)] py-[clamp(24px,5vh,56px)]"
      >
        <div className="flex items-center justify-between">
          <TitlePill surface="blue">NETWORK DIAGNOSTIC</TitlePill>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close diagnostic"
            className="flex size-[40px] items-center justify-center rounded-full border border-[var(--color-white)] text-[20px] leading-none text-[var(--color-white)] transition-colors hover:text-[var(--color-blue-200)]"
          >
            ×
          </button>
        </div>

        {/* Five segments, one per question, so the bar tracks the survey. */}
        <div className="mt-[24px]">
          <SegmentedBar count={QUESTIONS.length} active={Math.min(qIndex, QUESTIONS.length - 1)} />
        </div>

        {/* 0 — free text. This is what classifies the community. */}
        {step === 0 && (
          <form onSubmit={startAudit} className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className={label}>LIFE CALIBRATION</p>
            <h2 className={heading}>
              What direction are you currently moving in, or want to move toward, in your life?
            </h2>
            <textarea
              rows={4}
              value={freetext}
              onChange={(e) => setFreetext(e.target.value)}
              aria-label="Your direction"
              placeholder="Leaving a stable career to build something… Trying to think more clearly about a hard problem… Working on something that's meant to matter beyond me…"
              className="mt-[24px] w-full resize-none rounded-[16px] border border-[var(--color-white)] bg-[var(--color-surface-base)] p-[20px] text-[16px] leading-[1.6] text-[var(--color-white)] outline-none placeholder:text-[var(--color-placeholder)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-white)]"
            />
            <div className="mt-[24px]">
              <Button type="submit" surface="blue" size="lg" disabled={!freetext.trim()}>
                BEGIN THE AUDIT
              </Button>
            </div>
          </form>
        )}

        {/* 1 and 7 — processing */}
        {(step === 1 || step === 7) && (
          <div className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]" role="status" aria-live="polite">
            <p className={label}>{step === 1 ? 'CALIBRATING' : 'RESOLVING SIGNAL'}</p>
            <h2 className={heading}>
              {step === 1 ? 'Reading your direction…' : 'Mapping your network against it…'}
            </h2>
          </div>
        )}

        {/* 2..6 — the five scored questions */}
        {q && (
          <div className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className={label}>
              {q.label} · {q.query}
            </p>
            <h2 className={heading}>{q.text}</h2>
            <div className="mt-[32px] flex flex-col gap-[12px]">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => answer(`q${qIndex + 1}`, OPT_KEYS[i])}
                  className="rounded-[16px] border border-[var(--color-white)] px-[20px] py-[16px] text-left text-[16px] leading-[1.35] text-[var(--color-white)] transition-colors hover:text-[var(--color-blue-200)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 8 — email gate */}
        {step === 8 && (
          <form onSubmit={submitGate} className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className={label}>YOUR READING IS READY</p>
            <h2 className={heading}>Where should we send it?</h2>
            <p className={body}>
              We will also use this to find your people when matchmaking opens.
            </p>

            <div className="mt-[32px] flex w-full max-w-[520px] flex-col gap-[12px]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                aria-label="Name"
                className="w-full rounded-[48px] border border-[var(--color-white)] bg-[var(--color-surface-base)] px-[24px] py-[14px] text-[13px] leading-[18px] text-[var(--color-white)] outline-none placeholder:text-[var(--color-placeholder)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-white)]"
              />
              <div className="flex items-center justify-between rounded-[48px] border border-[var(--color-white)] bg-[var(--color-surface-base)] p-[4px] pl-[24px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-white)]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] text-[var(--color-white)] outline-none placeholder:text-[var(--color-placeholder)]"
                />
                <Button type="submit" surface="blue" disabled={sending || !email.trim()} className="tracking-[1.5px]">
                  {sending ? 'SAVING…' : 'GET RESULT'}
                </Button>
              </div>
              {err && (
                <p role="alert" className="text-[13px] leading-[18px] text-[var(--color-yellow-600)]">
                  {err}
                </p>
              )}
            </div>
          </form>
        )}

        {/* 9 — the result, one of twelve */}
        {step === 9 && reading && variant && (
          <div className="flex flex-1 flex-col justify-center py-[clamp(32px,8vh,72px)]">
            <p className={label}>{duplicate ? "YOU'RE ALREADY WITH US" : 'YOUR READING'}</p>
            <p className="mt-[12px] text-[13px] leading-[18px] tracking-[1px] text-[var(--color-yellow-600)]">{reading.name}</p>
            <h2 className={heading}>{reading.tagline}</h2>
            <p className={body}>{variant.gap}</p>

            <div className="mt-[24px] rounded-[16px] border border-[var(--color-blue-500)] p-[20px]">
              <p className="text-[13px] leading-[18px] tracking-[1px] text-[var(--color-blue-200)]">WHO YOU NEED</p>
              <p className="mt-[8px] text-[16px] leading-[1.5] text-[var(--color-white)]">{variant.who}</p>
            </div>

            <div className="mt-[32px]">
              <Button
                surface="blue"
                size="lg"
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
              >
                DONE
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
