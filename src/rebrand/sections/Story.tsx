import { Tag } from '../ui';

export default function Story() {
  return (
    <section id="story" className="w-full bg-[var(--color-blue-600)] px-[clamp(20px,6vw,220px)] py-[clamp(56px,10vw,120px)]">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-[16px]">
        <Tag variant="depth">WHY DO I NEED THIS?</Tag>
        <div className="p-[clamp(12px,3vw,24px)]">
          <p className="rebrand-display text-center text-[clamp(30px,6vw,64px)] font-normal leading-[1.1] tracking-[1px] text-white">
            Most platforms are built to keep you scrolling.
            <br />
            <span className="text-[var(--color-yellow-600)]">Relethe is built to make it worthwhile.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
