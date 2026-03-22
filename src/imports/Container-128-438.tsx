import svgPaths from "./svg-s2k5nf4vrw";

function Heart() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Heart">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Heart">
          <path d={svgPaths.p168026f2} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.25" strokeWidth="0.875" />
        </g>
      </svg>
    </div>
  );
}

function Div() {
  return (
    <div className="bg-[rgba(255,255,255,0.07)] relative rounded-[10px] shrink-0 size-[32px]" data-name="div">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[0.8px] relative size-full">
        <Heart />
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="flex-[1_0_0] h-[19.5px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.88)] top-[0.6px] whitespace-nowrap">Engagement</p>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ChevronDown">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ChevronDown">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.25" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 w-full" data-name="button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center relative w-full">
          <Div />
          <Div1 />
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start px-[28px] py-[16px] relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.07)] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
      <Button />
    </div>
  );
}