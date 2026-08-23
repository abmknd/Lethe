import { Bell, Mail } from 'lucide-react';
import { Avatar, Button, ICON_SIZE, iconStroke } from '../primitives';
import logomark from '../../assets/logos/logomark_blue.svg';

/**
 * The app's top chrome. Shared by every in-app surface, which is why it lives
 * here rather than inside ConnectPage — the second page to need it would
 * otherwise copy it, and then there would be two.
 *
 * Three zones on one row: identity left, place centre, self right. The centre
 * is the only part that changes between pages.
 */

export type AppSection = 'connect' | 'feed';

const SECTIONS: { key: AppSection; label: string; href: string }[] = [
  { key: 'connect', label: 'CONNECT', href: '/connect' },
  { key: 'feed', label: 'FEED', href: '/feed' },
];

/** A bordered circular control. Distinct from IconButton, which is filled:
 *  header actions sit on white and need an outline to exist at all. */
function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'grid size-[40px] shrink-0 place-items-center rounded-full border border-[var(--color-black-200)] ' +
        'text-[var(--color-black-700)] transition-colors hover:border-[var(--color-black-300)] ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
      }
    >
      {children}
    </button>
  );
}

export function AppHeader({
  active = 'connect',
  avatarSrc,
  onNavigate,
  onInvite,
}: {
  active?: AppSection;
  avatarSrc?: string;
  onNavigate?: (href: string) => void;
  onInvite?: () => void;
}) {
  return (
    <header className="flex h-[80px] shrink-0 items-center gap-[16px] border-b border-[var(--color-black-100)] bg-[var(--color-white)] px-[32px]">
      <button
        type="button"
        aria-label="Relethe home"
        onClick={() => onNavigate?.('/feed')}
        className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-blue-600)]"
      >
        <img src={logomark} alt="" className="size-[26px]" />
      </button>

      <nav className="flex flex-1 items-center justify-center gap-[36px]">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-current={s.key === active ? 'page' : undefined}
            onClick={() => onNavigate?.(s.href)}
            // Text-only hover, per the state matrix: the label steps along its
            // ramp and nothing else about the control moves.
            className={
              'text-[15px] font-medium leading-[100%] tracking-[0.5px] transition-colors ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-blue-600)] ' +
              (s.key === active
                ? 'text-[var(--color-black-700)]'
                : 'text-[var(--color-black-400)] hover:text-[var(--color-black-700)]')
            }
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-[12px]">
        <Button variant="secondary" size="lg" onClick={onInvite}>
          INVITE
        </Button>
        <HeaderIconButton label="Notifications" onClick={() => onNavigate?.('/notifications')}>
          <Bell size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
        </HeaderIconButton>
        <HeaderIconButton label="Messages" onClick={() => onNavigate?.('/messages')}>
          <Mail size={ICON_SIZE.sm} strokeWidth={iconStroke(ICON_SIZE.sm)} />
        </HeaderIconButton>
        <button
          type="button"
          aria-label="Your profile"
          onClick={() => onNavigate?.('/profile')}
          className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]"
        >
          <Avatar src={avatarSrc} alt="" size={40} onLight />
        </button>
      </div>
    </header>
  );
}

/**
 * The progress read-out beside the tabs. Dots rather than a bar because the
 * unit is a decision, and a decision is countable — a continuous fill would
 * imply partial progress through one.
 */
export function DailyGoal({ done, total = 10 }: { done: number; total?: number }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="text-[13px] font-medium uppercase leading-[120%] tracking-[1.5px] text-[var(--color-black-500)]">
        Daily goal
      </span>
      <span className="flex items-center gap-[5px]" role="img" aria-label={`${done} of ${total} reviewed today`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={
              'size-[8px] rounded-full ' +
              (i < done ? 'bg-[var(--color-blue-600)]' : 'bg-[var(--color-black-200)]')
            }
          />
        ))}
      </span>
    </div>
  );
}
