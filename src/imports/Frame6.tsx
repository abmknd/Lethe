function Container() {
  return (
    <div className="h-[26.4px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Cormorant_Garamond'] leading-[26.4px] left-0 not-italic text-[22px] text-[rgba(255,255,255,0.88)] top-[-0.8px] whitespace-nowrap">Elena Voss</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.25)] top-[0.6px] tracking-[0.52px] whitespace-nowrap">@elena.voss</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative size-full">
      <Container />
      <Container1 />
    </div>
  );
}