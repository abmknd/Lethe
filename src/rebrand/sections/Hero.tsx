import { useState, type FormEvent } from 'react';
import { Logomark } from '../ui';
import { signup } from '../../lib/signup';
import heroArt from '../assets/hero-sanctuary.webp';

type Status = 'idle' | 'sending' | 'joined' | 'duplicate' | 'error';

/**
 * Hero email capture. Wired to the same `signup` edge function the current
 * landing page uses, with source "hero", so the rebrand collects real
 * signups rather than looking like it does.
 */
function JoinForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    const res = await signup({ email: email.trim(), source: 'hero' });
    setStatus(res.status === 'created' ? 'joined' : res.status === 'duplicate' ? 'duplicate' : 'error');
  }

  const done = status === 'joined' || status === 'duplicate';

  return (
    <div className="w-[560px] max-w-[calc(100vw-32px)] px-[16px]">
      {done ? (
        <div
          role="status"
          className="flex items-center justify-center rounded-[48px] border border-white bg-[var(--color-blue-600)] px-[24px] py-[14px] text-center text-[13px] leading-[18px] text-white"
        >
          {status === 'joined' ? "You're on the list. We'll be in touch." : "You're already on the list."}
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="flex items-center justify-between rounded-[48px] border border-white bg-[var(--color-blue-600)] py-[8px] pl-[24px] pr-[8px] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.25)]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              disabled={status === 'sending'}
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] text-white outline-none placeholder:text-[var(--color-placeholder)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              className="shrink-0 rounded-[40px] bg-white px-[16px] py-[8px] text-[13px] font-medium leading-[1.2] tracking-[1.5px] text-[var(--color-blue-600)] transition-opacity hover:opacity-90 disabled:opacity-45"
            >
              {status === 'sending' ? 'JOINING…' : 'JOIN NOW'}
            </button>
          </div>
          {status === 'error' && (
            <p role="alert" className="mt-[8px] text-center text-[13px] leading-[18px] text-[var(--color-yellow-600)]">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] max-h-[1260px] w-full flex-col items-center gap-[clamp(32px,8vh,120px)] overflow-hidden bg-[var(--color-blue-600)] pb-[clamp(24px,6vh,80px)]">
      {/* Hero art. Sits behind everything, bled to the frame. */}
      <img
        src={heroArt}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-bottom"
      />

      {/* Nav */}
      <nav className="relative z-10 flex h-[72px] w-full items-center px-[clamp(16px,4vw,40px)] py-[12px]">
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-[640px] items-center justify-between gap-[8px] rounded-[40px] p-[8px]">
            <a href="#" className="flex shrink-0 items-center gap-[6px] px-[8px] py-[6px]">
              <Logomark size={20} />
              <span className="rebrand-display text-[13px] font-semibold uppercase leading-[16px] tracking-[4px] text-white">
                RELETHE
              </span>
            </a>

            <div className="hidden flex-1 items-center justify-center gap-[12px] sm:flex">
              <a href="#story" className="p-[8px] text-[13px] font-medium leading-[1.2] tracking-[1px] text-white transition-opacity hover:opacity-70">
                COHORT
              </a>
              <a href="#manifesto" className="p-[8px] text-[13px] font-medium leading-[1.2] tracking-[1px] text-white transition-opacity hover:opacity-70">
                MANIFESTO
              </a>
            </div>

            <div className="flex shrink-0 items-center gap-[12px]">
              <button className="rounded-[40px] bg-white px-[16px] py-[8px] text-[13px] font-medium leading-[1.2] tracking-[1px] text-[var(--color-blue-600)] transition-opacity hover:opacity-90">
                JOIN NOW
              </button>
            </div>
          </div>
        </div>

        <div className="absolute right-[clamp(16px,4vw,40px)] top-1/2 hidden -translate-y-1/2 md:block">
          <button className="relative rounded-[40px] border border-white px-[16px] py-[8px] text-[13px] font-medium leading-[1.2] tracking-[1px] text-white transition-colors hover:bg-white/10">
            SIGN IN
          </button>
        </div>
      </nav>

      {/* Heading */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-[16px]">
        <h1 className="rebrand-display w-[840px] max-w-full text-center text-[clamp(40px,8vw,80px)] font-normal leading-[1.2] tracking-[1px] text-white">
          Imagine Sisyphus{' '}
          <span className="block text-[var(--color-yellow-600)]">never alone...</span>
        </h1>
      </div>

      {/* Email capture, pinned to the bottom of the art */}
      <div className="absolute bottom-[clamp(24px,6vh,80px)] left-1/2 z-10 -translate-x-1/2">
        <JoinForm />
      </div>
    </section>
  );
}
