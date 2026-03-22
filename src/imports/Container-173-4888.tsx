import svgPaths from "./svg-6thut4hhdz";

function Textarea() {
  return (
    <div className="flex-[1_0_0] h-[29px] min-h-px min-w-px relative" data-name="textarea">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start overflow-clip py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[21px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.18)] whitespace-nowrap">Write a message…</p>
      </div>
    </div>
  );
}

function Paperclip() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Paperclip">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Paperclip">
          <path d="M8.82267 13.5013L14 8.2" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.18" />
          <path d={svgPaths.p29e0c2c0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.18" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[32px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Paperclip />
      </div>
    </div>
  );
}

function Send() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Send">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_173_4892)" id="Send">
          <path d={svgPaths.p349e6700} id="Vector" stroke="var(--stroke-0, #7FFF00)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_173_4892">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[32px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Send />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[36px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-end relative">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#0f130f] content-stretch flex gap-[10px] items-center px-[16.8px] py-[0.8px] relative rounded-[16px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Textarea />
      <Container1 />
    </div>
  );
}