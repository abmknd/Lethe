import { Logomark } from '../brand';

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[var(--color-blue-600)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-[clamp(20px,5vw,40px)] py-[40px] text-center sm:flex-row sm:text-left md:min-h-[152px]">
        <p className="order-2 flex-1 text-[13px] font-normal leading-[18px] text-white sm:order-1">
          RELETHE, INC · 2026
        </p>
        <div className="order-1 sm:order-2">
          <Logomark size={20} />
        </div>
        <p className="order-3 flex-1 text-[13px] font-normal leading-[18px] text-white sm:text-right">
          NETWORKING WITHOUT PERFORMANCE
        </p>
      </div>
    </footer>
  );
}
