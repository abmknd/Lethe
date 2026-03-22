function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] not-italic relative shrink-0 text-[11px] text-[rgba(173,255,47,0.72)] tracking-[0.88px] whitespace-nowrap">88%</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[31.462px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.25)] top-[0.6px] whitespace-nowrap">match</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(173,255,47,0.08)] content-stretch flex gap-[6px] items-center justify-center px-[12px] py-[6px] relative rounded-[120px] size-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}