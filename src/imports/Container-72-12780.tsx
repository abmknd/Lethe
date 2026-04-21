import svgPaths from "./svg-ogukw8s9yb";
import imgImageWithFallback1 from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import { imgImageWithFallback } from "./svg-9cc81";

function ImageWithFallback() {
  return (
    <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3.438px_-3.438px] mask-size-[106.875px_106.875px] relative rounded-[1000px] size-[100px]" data-name="ImageWithFallback" style={{ maskImage: `url('${imgImageWithFallback}')` }}>
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[1000px] size-full" src={imgImageWithFallback1} />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[115px] overflow-clip relative w-full" data-name="svg">
      <div className="absolute inset-[4.35%]" data-name="Vector">
        <div className="absolute inset-[-1.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108 108">
            <path d={svgPaths.pe60fb00} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeDasharray="329.88 329.88" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="3" />
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[100px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <ImageWithFallback />
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[33554376px] shrink-0 w-[115px]" data-name="Container">
      <div className="flex h-[115px] items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "43" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none w-full">
          <Svg />
        </div>
      </div>
    </div>
  );
}

function H() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="h1">
      <p className="font-['Cormorant_Garamond'] italic leading-[48.4px] relative shrink-0 text-[36px] text-[rgba(255,255,255,0.9)] tracking-[-0.88px] whitespace-nowrap">A. Fitch</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#6b6b6b] text-[14px] tracking-[1.92px]">@alabaster.f</p>
    </div>
  );
}

function ProfileName() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Profile-name">
      <H />
      <Container4 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[8.33%_16.67%]" data-name="Group">
      <div className="absolute inset-[-3.75%_-4.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.5833 17.9167">
          <g id="Group">
            <path d={svgPaths.p1fd14140} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.25" />
            <path d={svgPaths.p1b528f0} id="Vector_2" stroke="var(--stroke-0, #ADFF2F)" strokeOpacity="0.5" strokeWidth="1.25" />
            <path d={svgPaths.p312c0700} id="Vector_3" stroke="var(--stroke-0, #ADFF2F)" strokeOpacity="0.5" strokeWidth="1.25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Location() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="location">
      <Group />
    </div>
  );
}

function P() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="p">
      <p className="font-['Cormorant_Garamond'] leading-[25.5px] not-italic relative shrink-0 text-[15px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">Frankfurt, Kentucky</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Container">
      <Location />
      <P />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[12.5%_12.5%_9.37%_9.37%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.6258 15.6258">
        <g id="Group">
          <path d={svgPaths.p164a7a00} fill="var(--fill-0, #ADFF2F)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Gender() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="gender">
      <Group1 />
    </div>
  );
}

function P1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="p">
      <p className="font-['Cormorant_Garamond'] leading-[25.5px] not-italic relative shrink-0 text-[15px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">He/Him/His</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Container">
      <Gender />
      <P1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[758px]" data-name="Container">
      <ProfileName />
      <Container5 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(173,255,47,0.06)] h-[34.1px] relative rounded-[26843500px] shrink-0 w-[134px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(173,255,47,0.2)] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[67.3px] not-italic text-[11px] text-[rgba(173,255,47,0.7)] text-center top-[9.4px] tracking-[1.98px] uppercase whitespace-nowrap">Edit profile</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-[1020px]" data-name="Container">
      <Frame />
      <Button />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#0a0d0a] relative rounded-[16px] size-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[40px] pt-[32px] px-[24px] relative rounded-[inherit] size-full">
        <Container1 />
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}