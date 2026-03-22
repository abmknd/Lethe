function Container() {
  return (
    <div className="absolute h-[16.5px] right-[-0.38px] top-0 w-[468.375px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] not-italic right-[21px] text-[11px] text-[rgba(255,255,255,0.18)] top-[0.6px] tracking-[0.44px] translate-x-full whitespace-nowrap">You</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[46.2px] left-[15px] top-[11px] w-[438.375px]" data-name="Container">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[23.1px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-[-0.6px] w-[437px]">Thanks Marcus! Your thread on distributed systems was something I kept coming back to.</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[16.5px] left-[414.81px] top-[57.7px] w-[41.563px]" data-name="Container">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[16.5px] left-0 not-italic text-[10px] text-[rgba(255,255,255,0.15)] top-[-0.4px] whitespace-nowrap">11:02 AM</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[rgba(127,255,0,0.12)] h-[81.2px] right-[-0.38px] rounded-bl-[18px] rounded-br-[4px] rounded-tl-[18px] rounded-tr-[18px] top-[26.5px] w-[468.375px]" data-name="Container">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[108px] left-[0.2px] top-0 w-[689px]">
      <Container />
      <Container1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[23.1px] left-[15px] top-[11px] w-[317.55px]" data-name="Container">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[23.1px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-[-0.6px] whitespace-nowrap">Curious what drew you to that particular framing.</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[16.5px] left-[293.99px] top-[34.6px] w-[41.563px]" data-name="Container">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[16.5px] left-0 not-italic text-[10px] text-[rgba(255,255,255,0.15)] top-[-0.4px] whitespace-nowrap">11:02 AM</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[rgba(127,255,0,0.12)] h-[58.1px] left-[341.25px] rounded-bl-[18px] rounded-br-[4px] rounded-tl-[18px] rounded-tr-[18px] top-0 w-[347.55px]" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[58px] left-0 top-[114px] w-[689px]" data-name="Container">
      <Container5 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Frame1 />
      <Container4 />
    </div>
  );
}