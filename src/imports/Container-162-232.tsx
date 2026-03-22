function Button() {
  return (
    <div className="absolute h-[24.5px] left-[9px] rounded-[26843500px] top-[7px] w-[146.387px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[73.5px] not-italic text-[0px] text-[rgba(255,255,255,0.9)] text-center top-[4.6px] tracking-[2.2px] uppercase whitespace-nowrap">
        <span className="leading-[16.5px] text-[11px]">{`All Posts `}</span>
        <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">35</span>
      </p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[24.5px] left-[159.39px] rounded-[26843500px] top-[7px] w-[103.688px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[52px] not-italic text-[#3a3a3a] text-[0px] text-center top-[4.6px] tracking-[2.2px] uppercase whitespace-nowrap">
        <span className="leading-[16.5px] text-[11px]">{`Faded `}</span>
        <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">2</span>
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[24.5px] left-[267.07px] rounded-[26843500px] top-[7px] w-[115.15px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[58.5px] not-italic text-[#3a3a3a] text-[0px] text-center top-[4.6px] tracking-[2.2px] uppercase whitespace-nowrap">
        <span className="leading-[16.5px] text-[11px]">{`echoes `}</span>
        <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">2</span>
      </p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#0a0a0a] border-[#1a1a1a] border-[0.8px] border-solid relative rounded-[26843500px] size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}