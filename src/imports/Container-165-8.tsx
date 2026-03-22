function P() {
  return (
    <div className="relative shrink-0" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] not-italic relative shrink-0 text-[11px] text-[rgba(173,255,47,0.72)] tracking-[0.88px] whitespace-nowrap">MEMBER</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(173,255,47,0.08)] content-stretch flex items-center justify-center relative rounded-[120px] size-full" data-name="Container">
      <P />
    </div>
  );
}