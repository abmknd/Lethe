import svgPaths from "./svg-9x8xqlgryp";

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLeft">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLeft">
          <path d={svgPaths.p543f5c0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Span() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[16.5px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] text-center tracking-[3.3px] uppercase whitespace-nowrap">BACK</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center relative">
        <ArrowLeft />
        <Span />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative size-full" data-name="Container">
      <Button />
    </div>
  );
}