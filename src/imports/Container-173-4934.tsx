import imgImg from "figma:asset/f9c975adfaf0ea7c5d7fe3839097685af7bb1e20.png";

function Span() {
  return (
    <div className="h-[21px] relative shrink-0 w-[73.65px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-[-0.4px] whitespace-nowrap">Marcus Jin</p>
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="bg-[rgba(127,255,0,0.1)] h-[24.9px] relative rounded-[40px] shrink-0 w-[54.487px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[8.6px] not-italic text-[11px] text-[rgba(127,255,0,0.7)] top-[4.8px] tracking-[0.88px] whitespace-nowrap">Match</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[24.9px] items-center left-0 top-0 w-[134.137px]" data-name="Container">
      <Span />
      <Span1 />
    </div>
  );
}

function Span2() {
  return (
    <div className="absolute h-[16.5px] left-[211.18px] top-[5.15px] w-[13.225px]" data-name="span">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.18)] top-[0.6px] whitespace-nowrap">2h</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[24.9px] relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Span2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[18px] left-0 not-italic text-[12px] text-[rgba(255,255,255,0.18)] top-[-0.2px] whitespace-nowrap">Looking forward to our meeting Thursday.</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3px] h-[45.9px] items-start left-[74px] top-[14px] w-[224.4px]" data-name="Container">
      <Container2 />
      <Container4 />
    </div>
  );
}

function Container5() {
  return <div className="absolute bg-[#7fff00] h-[73.9px] left-0 top-0 w-px" data-name="Container" />;
}

function Img() {
  return (
    <div className="h-[40.4px] relative shrink-0 w-full" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute left-[20px] rounded-[26843500px] size-[42px] top-[15.95px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] size-full">
        <Img />
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(127,255,0,0.05)] border-[rgba(255,255,255,0.04)] border-b-[0.8px] border-solid relative size-full" data-name="Container">
      <Container1 />
      <Container5 />
      <Container6 />
    </div>
  );
}