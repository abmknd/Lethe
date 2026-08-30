import { Brandmark } from '../brand';
import { Avatar, BadgeButton, Button, TabBar, ToggleButton } from '../ds';
import { Message01Icon, Notification01Icon } from '../../assets/system_icons';

/**
 * The Connect surface's top chrome.
 *
 * MOVED ONTO THE LIBRARY. This used to carry its own `HeaderIconButton`, its
 * own INVITE pill, its own nav buttons and its own logo `<img>` — four
 * re-implementations of components that exist in `../ds`, each drifting from
 * the file in its own direction. The header now composes `Brandmark`,
 * `TabBar`/`ToggleButton`, `Button` and `BadgeButton`, so a correction to any
 * of them lands here without anyone remembering to make it twice.
 *
 * Three columns on a 64px row: identity, place, self. Only the centre changes
 * between pages, which is why this is shared rather than owned by ConnectPage.
 */

export type AppSection = 'connect' | 'feed';

const SECTIONS: { key: AppSection; label: string; href: string }[] = [
  { key: 'connect', label: 'CONNECT', href: '/connect' },
  { key: 'feed', label: 'FEED', href: '/feed' },
];

export function AppHeader({
  active = 'connect',
  avatarSrc,
  person,
  unread,
  onNavigate,
  onInvite,
}: {
  active?: AppSection;
  avatarSrc?: string;
  person?: string;
  unread?: boolean;
  onNavigate?: (href: string) => void;
  onInvite?: () => void;
}) {
  return (
    <header className="flex h-[64px] shrink-0 items-center border-b border-[var(--border-neutral-default)] bg-[var(--surface-neutral-default)] px-[32px]">
      <div className="flex flex-1 items-center">
        <button
          type="button"
          aria-label="Relethe home"
          onClick={() => onNavigate?.('/feed')}
          className="flex shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--border-primary-default)]"
        >
          <Brandmark size={32} />
        </button>
      </div>

      <TabBar label="Sections">
        {SECTIONS.map((s) => (
          <ToggleButton key={s.key} active={s.key === active} onClick={() => onNavigate?.(s.href)}>
            {s.label}
          </ToggleButton>
        ))}
      </TabBar>

      <div className="flex flex-1 items-center justify-end gap-[14px]">
        <Button tone="outline" onClick={onInvite}>INVITE</Button>
        <BadgeButton label="Notifications" glyph={Notification01Icon} onClick={() => onNavigate?.('/notifications')} />
        <BadgeButton label="Messages" glyph={Message01Icon} dot={unread} onClick={() => onNavigate?.('/messages')} />
        <button
          type="button"
          aria-label="Your profile"
          onClick={() => onNavigate?.('/profile')}
          className="flex shrink-0 rounded-[var(--border-radius-round)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-primary-default)]"
        >
          <Avatar src={avatarSrc} person={person} size="sm" />
        </button>
      </div>
    </header>
  );
}

/**
 * The progress read-out beside the tabs. Ten marks, not a bar — the unit is a
 * decision, and a decision is countable, so a continuous bar would imply
 * partial progress through one.
 *
 * Matched to `bottom-bar` 918:6317, which is where the current design draws it:
 * a 13/16 Medium `DAILY GOAL` in `text/default/subtle` with a 12 gap, then 8px
 * dots at a 13 pitch.
 */
export function DailyGoal({ done, total = 10 }: { done: number; total?: number }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="text-[13px] font-medium uppercase tracking-[1px] text-[var(--text-default-subtle)]">
        Daily goal
      </span>
      <span className="flex items-center gap-[5px]" role="img" aria-label={`${done} of ${total} reviewed today`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={
              'size-[8px] rounded-full ' +
              (i < done ? 'bg-[var(--surface-primary-default)]' : 'bg-[var(--border-neutral-subtle)]')
            }
          />
        ))}
      </span>
    </div>
  );
}
