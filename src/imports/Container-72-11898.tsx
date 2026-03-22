function Group() {
  return (
    <div className="absolute inset-[20.83%]" data-name="Group">
      <div className="absolute inset-[-7.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
          <g id="Group">
            <path d="M0.833333 6.66667H12.5" id="Vector" stroke="var(--stroke-0, white)" strokeDasharray="13.33 13.33" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d="M6.66667 0.833333V12.5" id="Vector_2" stroke="var(--stroke-0, white)" strokeDasharray="13.33 13.33" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Add() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="add">
      <Group />
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center relative">
        <Add />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.9)] text-center tracking-[2.2px] uppercase whitespace-nowrap">Add more</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#0a0a0a] content-stretch flex items-start px-[16px] py-[6px] relative rounded-[26843500px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-[-0.8px] pointer-events-none rounded-[26843500.8px]" />
      <Button />
    </div>
  );
}