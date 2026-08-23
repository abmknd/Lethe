import { Avatar } from '../primitives';
import { Mail01Icon, Notification01Icon } from '../../assets/system_icons';
import { Icon } from './Icon';
import logomark from '../../assets/logos/logomark_blue.svg';

/**
 * The app's top chrome, built to `connect-default` / `connect-open` (613:2646).
 *
 * Three columns on a 64px row: identity, place, self. Only the centre changes
 * between pages, which is why this is shared rather than owned by ConnectPage.
 */

export type AppSection = 'connect' | 'feed';

const SECTIONS: { key: AppSection; label: string; href: string }[] = [
  { key: 'connect', label: 'CONNECT', href: '/connect' },
  { key: 'feed', label: 'FEED', href: '/feed' },
];

/** 32px, bordered, white. Not IconButton — that one is filled and 40px; a
 *  header action sits on white and needs an outline to exist at all. */
function HeaderIconButton({
  label,
  onClick,
  badge,
  children,
}: {
  label: string;
  onClick?: () => void;
  badge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'relative grid size-[32px] shrink-0 place-items-center rounded-full border border-[var(--color-black-200)] ' +
        'bg-[var(--surface-neutral-default)] text-[var(--icons-neutral-default)] transition-colors hover:text-[var(--icons-primary-default)] ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
      }
    >
      {children}
      {badge ? (
        <span
          aria-hidden
          className="absolute left-[13px] top-[7px] size-[6px] rounded-full border border-[var(--border-page-alpha)] bg-[var(--icons-primary-default)]"
        />
      ) : null}
    </button>
  );
}

export function AppHeader({
  active = 'connect',
  avatarSrc,
  unread,
  onNavigate,
  onInvite,
}: {
  active?: AppSection;
  avatarSrc?: string;
  unread?: boolean;
  onNavigate?: (href: string) => void;
  onInvite?: () => void;
}) {
  return (
    <header className="flex h-[64px] shrink-0 items-center border-b border-[var(--border-disabled-deep)] bg-[var(--surface-neutral-default)] px-[32px]">
      <div className="flex flex-1 items-center">
        <button
          type="button"
          aria-label="Relethe home"
          onClick={() => onNavigate?.('/feed')}
          className="grid size-[32px] shrink-0 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-blue-600)]"
        >
          <img src={logomark} alt="" className="size-[32px]" />
        </button>
      </div>

      <nav className="flex shrink-0 items-center">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-current={s.key === active ? 'page' : undefined}
            onClick={() => onNavigate?.(s.href)}
            // Button 3. Text-only hover, per the state matrix.
            className={
              'px-[16px] py-[8px] text-[13px] font-medium leading-[16px] tracking-[1px] transition-colors ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-blue-600)] ' +
              (s.key === active
                ? 'text-[var(--text-default-body)]'
                : 'text-[var(--text-default-placeholder)] hover:text-[var(--text-default-body)]')
            }
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-[10px]">
        <button
          type="button"
          onClick={onInvite}
          className={
            'rounded-[40px] border border-[var(--border-primary-default)] bg-[var(--surface-neutral-default)] px-[16px] py-[8px] ' +
            'text-[13px] font-medium leading-[16px] tracking-[1px] text-[var(--text-default-highlight-blue)] transition-colors ' +
            'hover:text-[var(--color-blue-700)] ' +
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]'
          }
        >
          INVITE
        </button>
        <HeaderIconButton label="Notifications" badge={unread} onClick={() => onNavigate?.('/notifications')}>
          <Icon as={Notification01Icon} />
        </HeaderIconButton>
        <HeaderIconButton label="Messages" onClick={() => onNavigate?.('/messages')}>
          <Icon as={Mail01Icon} />
        </HeaderIconButton>
        <button
          type="button"
          aria-label="Your profile"
          onClick={() => onNavigate?.('/profile')}
          className="size-[32px] shrink-0 overflow-hidden rounded-full border border-[var(--color-black-200)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-600)]"
        >
          <Avatar src={avatarSrc} alt="" size={32} onLight />
        </button>
      </div>
    </header>
  );
}

/**
 * The progress read-out beside the tabs. Ten 8x6 marks, not circles — the unit
 * is a decision, and a decision is countable, so a continuous bar would imply
 * partial progress through one.
 */
export function DailyGoal({ done, total = 10 }: { done: number; total?: number }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="text-[12px] font-medium uppercase leading-[16px] text-[var(--text-default-placeholder)]">Daily goal</span>
      <span className="flex items-center gap-[4px]" role="img" aria-label={`${done} of ${total} reviewed today`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={
              'h-[6px] w-[8px] rounded-[40px] ' +
              (i < done ? 'bg-[var(--icons-primary-default)]' : 'bg-[var(--color-black-200)]')
            }
          />
        ))}
      </span>
    </div>
  );
}
