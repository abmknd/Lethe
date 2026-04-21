import svgPaths from "./svg-36cmsi1215";
import imgImageWithFallback1 from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import imgImageWithFallback2 from "figma:asset/91b749ae2ed39b38d6b09e9ebf9089bb1282ea00.png";
import imgImageWithFallback3 from "figma:asset/ae452150c9e875ae34875f023d350bff334f8b87.png";
import imgImageWithFallback4 from "figma:asset/dba0c83f5f7a5668ec5a87de35c3d9ced174c343.png";
import imgImageWithFallback5 from "figma:asset/2591f4817f9f3d01035056e695035d975aabd2e0.png";
import imgRectangle from "figma:asset/8f8487078257ce2c7db83e0c3005b1e39ee814cd.png";
import imgGeneratedImage3 from "figma:asset/fe98c07725f02b23548275ef00b42b5d401a7e57.png";
import imgRectangle1 from "figma:asset/ad4f4c674c88db29136842902b4279a695b867c1.png";
import { imgImageWithFallback } from "./svg-ml2jo";

function Container() {
  return <div className="absolute h-[223px] left-[48px] top-[60px] w-[1100px]" data-name="Container" />;
}

function ImageWithFallback() {
  return (
    <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.75px_-2.75px] mask-size-[85.5px_85.5px] relative rounded-[800px] size-[80px]" data-name="ImageWithFallback" style={{ maskImage: `url('${imgImageWithFallback}')` }}>
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[800px] size-full" src={imgImageWithFallback1} />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[92px] overflow-clip relative w-full" data-name="svg">
      <div className="absolute inset-[4.35%]" data-name="Vector">
        <div className="absolute inset-[-0.89%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 85.5 85.5">
            <path d={svgPaths.p3424c170} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeDasharray="263.9 263.9" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[80px] top-1/2" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <ImageWithFallback />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[26843500px] shrink-0 w-[92px]" data-name="Container">
      <div className="flex h-[92px] items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "43" } as React.CSSProperties}>
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

function Container5() {
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
      <Container5 />
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

function Container7() {
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

function Container8() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Container">
      <Gender />
      <P1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[758px]" data-name="Container">
      <ProfileName />
      <Container6 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
      <Container3 />
      <Container4 />
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

function Container2() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-[1020px]" data-name="Container">
      <Frame2 />
      <Button />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[#0a0d0a] left-[48px] rounded-[16px] top-[80px] w-[1082px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[40px] pt-[32px] px-[24px] relative rounded-[inherit] w-full">
        <Container2 />
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Div() {
  return (
    <div className="absolute bg-black h-[1790.388px] left-0 top-0 w-[1178px]" data-name="div">
      <Container />
      <Container1 />
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[21px] py-[4px] relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] leading-[0] not-italic relative shrink-0 text-[0px] text-[rgba(255,255,255,0.9)] text-center tracking-[2.2px] uppercase w-[99px]">
          <span className="leading-[16.5px] text-[11px]">{`All Posts `}</span>
          <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">35</span>
        </p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[20px] py-[4px] relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] leading-[0] not-italic relative shrink-0 text-[0px] text-[rgba(255,255,255,0.15)] text-center tracking-[2.2px] uppercase w-[58px]">
          <span className="leading-[16.5px] text-[#3a3a3a] text-[11px]">Faded</span>
          <span className="leading-[16.5px] text-[11px]">{` `}</span>
          <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">2</span>
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[20px] py-[4px] relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] leading-[0] not-italic relative shrink-0 text-[0px] text-[rgba(255,255,255,0.15)] text-center tracking-[2.2px] uppercase w-[70.296px]">
          <span className="leading-[16.5px] text-[#3a3a3a] text-[11px]">echoes</span>
          <span className="leading-[16.5px] text-[11px]">{` `}</span>
          <span className="leading-[13.5px] text-[9px] text-[rgba(173,255,47,0.5)]">2</span>
        </p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#0a0a0a] h-[38.1px] relative rounded-[26843500px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] h-full items-start pb-[0.8px] pl-[8.8px] pr-[0.8px] pt-[6.8px] relative">
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[38.1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative size-full">
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function ImageWithFallback1() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span />
        <Span1 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container16 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback1 />
      <Container15 />
    </div>
  );
}

function MoreVertical() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button4 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame />
      <Container19 />
    </div>
  );
}

function P2() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle />
    </div>
  );
}

function ArcticonsTetherfi() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi />
    </div>
  );
}

function Div2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg1 />
    </div>
  );
}

function Button6() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div2 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button6 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button5 />
        <Container22 />
      </div>
    </div>
  );
}

function Trash() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button7 />
      </div>
    </div>
  );
}

function BarChart() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash />
        <Container24 />
        <BarChart />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Container23 />
    </div>
  );
}

function Container25() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div1() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container14 />
        <P2 />
        <Container20 />
        <Container25 />
      </div>
    </div>
  );
}

function Article() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article />
    </div>
  );
}

function ImageWithFallback2() {
  return (
    <div className="h-[217.163px] relative shrink-0 w-full" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageWithFallback3} />
    </div>
  );
}

function Div3() {
  return (
    <div className="bg-black content-stretch flex flex-col h-[192px] items-start overflow-clip relative shrink-0 w-full" data-name="div">
      <ImageWithFallback2 />
    </div>
  );
}

function ImageWithFallback3() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span3() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span2 />
        <Span3 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container30 />
        <Container31 />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container29 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback3 />
      <Container28 />
    </div>
  );
}

function MoreVertical1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical1 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button8 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame3 />
      <Container32 />
    </div>
  );
}

function P3() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle1() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle1 />
    </div>
  );
}

function ArcticonsTetherfi1() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi1 />
    </div>
  );
}

function Div5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg2 />
    </div>
  );
}

function Button10() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div5 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button10 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button9 />
        <Container35 />
      </div>
    </div>
  );
}

function Trash1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share1() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share1 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button11 />
      </div>
    </div>
  );
}

function BarChart1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash1 />
        <Container37 />
        <BarChart1 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Container36 />
    </div>
  );
}

function Container38() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div4() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container27 />
        <P3 />
        <Container33 />
        <Container38 />
      </div>
    </div>
  );
}

function Article1() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div3 />
        <Div4 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article1 />
    </div>
  );
}

function ImageWithFallback4() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span4() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span5() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span4 />
        <Span5 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container43 />
        <Container44 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container42 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback4 />
      <Container41 />
    </div>
  );
}

function MoreVertical2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical2 />
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button12 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame4 />
      <Container45 />
    </div>
  );
}

function P4() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle2() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle2 />
    </div>
  );
}

function ArcticonsTetherfi2() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi2 />
    </div>
  );
}

function Div7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg3 />
    </div>
  );
}

function Button14() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div7 />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button14 />
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button13 />
        <Container48 />
      </div>
    </div>
  );
}

function Trash2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share2() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share2 />
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button15 />
      </div>
    </div>
  );
}

function BarChart2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash2 />
        <Container50 />
        <BarChart2 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container47 />
      <Container49 />
    </div>
  );
}

function Container51() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div6() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container40 />
        <P4 />
        <Container46 />
        <Container51 />
      </div>
    </div>
  );
}

function Article2() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div6 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article2 />
    </div>
  );
}

function ImageWithFallback5() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span6() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span7() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span6 />
        <Span7 />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container56 />
        <Container57 />
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container55 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback5 />
      <Container54 />
    </div>
  );
}

function MoreVertical3() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical3 />
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button16 />
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame5 />
      <Container58 />
    </div>
  );
}

function Container61() {
  return <div className="absolute bg-[#c93] left-[10.8px] rounded-[26843500px] size-[4px] top-[9.55px]" data-name="Container" />;
}

function Span8() {
  return (
    <div className="absolute h-[13.5px] left-[20.8px] top-[4.8px] w-[102.563px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[13.5px] left-0 not-italic text-[#c93] text-[9px] top-[-0.2px] tracking-[1.8px] uppercase whitespace-nowrap">FADING IN 9mins</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="bg-[#0a0a0a] h-[24px] relative rounded-[26843500px] shrink-0 w-[134.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container61 />
        <Span8 />
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container60 />
    </div>
  );
}

function P5() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle3() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle3 />
    </div>
  );
}

function ArcticonsTetherfi3() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi3 />
    </div>
  );
}

function Div9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg4 />
    </div>
  );
}

function Button18() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div9 />
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button18 />
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button17 />
        <Container64 />
      </div>
    </div>
  );
}

function Trash3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share3() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share3 />
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button19 />
      </div>
    </div>
  );
}

function BarChart3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container65() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash3 />
        <Container66 />
        <BarChart3 />
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container63 />
      <Container65 />
    </div>
  );
}

function Container67() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div8() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container53 />
        <Container59 />
        <P5 />
        <Container62 />
        <Container67 />
      </div>
    </div>
  );
}

function Article3() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div8 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article3 />
    </div>
  );
}

function ImageWithFallback6() {
  return (
    <div className="h-[223.588px] relative shrink-0 w-full" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageWithFallback4} />
    </div>
  );
}

function Div10() {
  return (
    <div className="bg-black content-stretch flex flex-col h-[192px] items-start overflow-clip relative shrink-0 w-full" data-name="div">
      <ImageWithFallback6 />
    </div>
  );
}

function ImageWithFallback7() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span9() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span10() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span9 />
        <Span10 />
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container72 />
        <Container73 />
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container71 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback7 />
      <Container70 />
    </div>
  );
}

function MoreVertical4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button20() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical4 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button20 />
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame6 />
      <Container74 />
    </div>
  );
}

function Container77() {
  return <div className="absolute bg-[#c93] left-[10.8px] rounded-[26843500px] size-[4px] top-[9.55px]" data-name="Container" />;
}

function Span11() {
  return (
    <div className="absolute h-[13.5px] left-[20.8px] top-[4.8px] w-[102.563px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[13.5px] left-0 not-italic text-[#c93] text-[9px] top-[-0.2px] tracking-[1.8px] uppercase whitespace-nowrap">FADING IN 9mins</p>
    </div>
  );
}

function Container76() {
  return (
    <div className="bg-[#0a0a0a] h-[24px] relative rounded-[26843500px] shrink-0 w-[134.163px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container77 />
        <Span11 />
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex gap-[340px] items-center relative shrink-0 w-full" data-name="Container">
      <Container76 />
    </div>
  );
}

function P6() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle4() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button21() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle4 />
    </div>
  );
}

function ArcticonsTetherfi4() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi4 />
    </div>
  );
}

function Div12() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg5 />
    </div>
  );
}

function Button22() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div12 />
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button22 />
    </div>
  );
}

function Container79() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button21 />
        <Container80 />
      </div>
    </div>
  );
}

function Trash4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share4() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button23() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share4 />
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button23 />
      </div>
    </div>
  );
}

function BarChart4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container81() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash4 />
        <Container82 />
        <BarChart4 />
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container79 />
      <Container81 />
    </div>
  );
}

function Container83() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div11() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container69 />
        <Container75 />
        <P6 />
        <Container78 />
        <Container83 />
      </div>
    </div>
  );
}

function Article4() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div10 />
        <Div11 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article4 />
    </div>
  );
}

function ImageWithFallback8() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span12() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span13() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container88() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span12 />
        <Span13 />
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container88 />
        <Container89 />
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container87 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback8 />
      <Container86 />
    </div>
  );
}

function MoreVertical5() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button24() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical5 />
      </div>
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button24 />
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame7 />
      <Container90 />
    </div>
  );
}

function Container93() {
  return <div className="absolute bg-[#6b6b6b] left-[10.8px] rounded-[26843500px] size-[4px] top-[9.55px]" data-name="Container" />;
}

function Span14() {
  return (
    <div className="absolute h-[13.5px] left-[20.8px] top-[4.8px] w-[37.85px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[13.5px] left-0 not-italic text-[#6b6b6b] text-[9px] top-[-0.2px] tracking-[1.8px] uppercase whitespace-nowrap">FADED</p>
    </div>
  );
}

function Container92() {
  return (
    <div className="bg-[#0a0a0a] h-[23.1px] relative rounded-[26843500px] shrink-0 w-[69.45px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container93 />
        <Span14 />
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container92 />
    </div>
  );
}

function P7() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle5() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button25() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle5 />
    </div>
  );
}

function ArcticonsTetherfi5() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg6() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi5 />
    </div>
  );
}

function Div14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg6 />
    </div>
  );
}

function Button26() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div14 />
      </div>
    </div>
  );
}

function Container96() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button26 />
    </div>
  );
}

function Container95() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button25 />
        <Container96 />
      </div>
    </div>
  );
}

function BarChart5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share5() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button27() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share5 />
      </div>
    </div>
  );
}

function Container98() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button27 />
      </div>
    </div>
  );
}

function Trash5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container97() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <BarChart5 />
        <Container98 />
        <Trash5 />
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container95 />
      <Container97 />
    </div>
  );
}

function Container99() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div13() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container85 />
        <Container91 />
        <P7 />
        <Container94 />
        <Container99 />
      </div>
    </div>
  );
}

function Article5() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div13 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container84() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article5 />
    </div>
  );
}

function ImageWithFallback9() {
  return (
    <div className="h-[617.7px] relative shrink-0 w-full" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageWithFallback5} />
    </div>
  );
}

function Div15() {
  return (
    <div className="bg-black content-stretch flex flex-col h-[192px] items-start overflow-clip relative shrink-0 w-full" data-name="div">
      <ImageWithFallback9 />
    </div>
  );
}

function ImageWithFallback10() {
  return (
    <div className="relative rounded-[26843500px] shadow-[0px_0px_0px_1px_#2a2a2a] shrink-0 size-[40px]" data-name="ImageWithFallback">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImageWithFallback2} />
      </div>
    </div>
  );
}

function Span15() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[77.162px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.4px] tracking-[0.375px] whitespace-nowrap">A. Fitch</p>
      </div>
    </div>
  );
}

function Span16() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14.25px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">1d</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-start relative size-full">
        <Span15 />
        <Span16 />
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-0 not-italic text-[#6b6b6b] text-[13px] top-[0.6px] tracking-[0.65px] whitespace-nowrap">@alabaster.f</p>
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="h-[44px] relative shrink-0 w-[227.463px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container104 />
        <Container105 />
      </div>
    </div>
  );
}

function Container102() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start justify-between relative shrink-0 w-[227.463px]" data-name="Container">
      <Container103 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <ImageWithFallback10 />
      <Container102 />
    </div>
  );
}

function MoreVertical6() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="MoreVertical">
      <div className="absolute inset-[45.83%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-37.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.33333 2.33333">
            <path d={svgPaths.padc050} id="Vector" stroke="var(--stroke-0, #3A3A3A)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button28() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <MoreVertical6 />
      </div>
    </div>
  );
}

function Container106() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[16px]" data-name="Container">
      <Button28 />
    </div>
  );
}

function Container101() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Frame8 />
      <Container106 />
    </div>
  );
}

function Container109() {
  return <div className="absolute bg-[#6b6b6b] left-[10.8px] rounded-[26843500px] size-[4px] top-[9.55px]" data-name="Container" />;
}

function Span17() {
  return (
    <div className="absolute h-[13.5px] left-[20.8px] top-[4.8px] w-[37.85px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[13.5px] left-0 not-italic text-[#6b6b6b] text-[9px] top-[-0.2px] tracking-[1.8px] uppercase whitespace-nowrap">FADED</p>
    </div>
  );
}

function Container108() {
  return (
    <div className="bg-[#0a0a0a] h-[23.1px] relative rounded-[26843500px] shrink-0 w-[69.45px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container109 />
        <Span17 />
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container108 />
    </div>
  );
}

function P8() {
  return (
    <div className="h-[46px] relative shrink-0 w-[581px]" data-name="p">
      <p className="absolute font-['Cormorant_Garamond'] leading-[23.8px] left-0 not-italic text-[#d4d4d4] text-[14px] top-[-1.6px] tracking-[0.35px] w-[581px]">We spend so much time building walls around our hearts, forgetting that bridges serve us better.</p>
    </div>
  );
}

function MessageCircle6() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="MessageCircle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[12.47%_12.47%_8.33%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-3.95%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.3809 15.3809">
              <path d={svgPaths.pf933000} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button29() {
  return (
    <div className="absolute content-stretch flex items-center left-0 size-[18px] top-0" data-name="button">
      <MessageCircle6 />
    </div>
  );
}

function ArcticonsTetherfi6() {
  return (
    <div className="absolute contents inset-[5.21%_5.21%_11.23%_5.21%]" data-name="arcticons:tetherfi">
      <div className="absolute inset-[5.21%_5.21%_11.23%_5.21%]" data-name="Vector">
        <div className="absolute inset-[-4.99%_-4.65%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.625 16.5414">
            <path d={svgPaths.p35b0300} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[22.4%_22.4%_26.1%_22.4%]" data-name="Vector_2">
        <div className="absolute inset-[-8.09%_-7.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.4375 10.7702">
            <path d={svgPaths.p839ae40} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[39.58%]" data-name="Vector_3">
        <div className="absolute inset-[-20%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.25001 5.25007">
            <path d={svgPaths.p38c3bd00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50003" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg7() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <ArcticonsTetherfi6 />
    </div>
  );
}

function Div17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[18px] top-0" data-name="div">
      <Svg7 />
    </div>
  );
}

function Button30() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div17 />
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="absolute content-stretch flex items-start left-[38px] size-[18px] top-0" data-name="Container">
      <Button30 />
    </div>
  );
}

function Container111() {
  return (
    <div className="h-[18px] relative shrink-0 w-[56px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button29 />
        <Container112 />
      </div>
    </div>
  );
}

function Trash6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Trash2">
          <path d="M2.25 4.5H15.75" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p1af4f180} id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p25aaaf00} id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7.5 8.25V12.75" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M10.5 8.25V12.75" id="Vector_5" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Share6() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Share">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[8.33%] left-[16.67%] right-[16.67%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-7.5%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 8.625">
              <path d={svgPaths.p15fc5380} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.125 4.125">
              <path d={svgPaths.p1a715b00} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.77%_-0.56px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.125 10.875">
              <path d="M0.5625 0.5625V10.3125" id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.125" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button31() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Share6 />
      </div>
    </div>
  );
}

function Container114() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button31 />
      </div>
    </div>
  );
}

function BarChart6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="BarChart3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="BarChart3">
          <path d={svgPaths.p3c193bc0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M13.5 12.75V6.75" id="Vector_2" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M9.75 12.75V3.75" id="Vector_3" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M6 12.75V10.5" id="Vector_4" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container113() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative">
        <Trash6 />
        <Container114 />
        <BarChart6 />
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container111 />
      <Container113 />
    </div>
  );
}

function Container115() {
  return <div className="absolute h-0 left-[20px] top-[80.2px] w-[581px]" data-name="Container" />;
}

function Div16() {
  return (
    <div className="relative shrink-0 w-full" data-name="div">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <Container101 />
        <Container107 />
        <P8 />
        <Container110 />
        <Container115 />
      </div>
    </div>
  );
}

function Article6() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[16px] shrink-0 w-[660px]" data-name="article">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.8px] relative rounded-[inherit] w-full">
        <Div15 />
        <Div16 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Container100() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Article6 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-center left-0 top-[0.1px] w-[660px]" data-name="Container">
      <Container13 />
      <Container26 />
      <Container39 />
      <Container52 />
      <Container68 />
      <Container84 />
      <Container100 />
    </div>
  );
}

function Span18() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">bio</p>
      </div>
    </div>
  );
}

function Container119() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative w-full">
        <p className="flex-[1_0_0] font-['Cormorant_Garamond'] leading-[25.5px] min-h-px min-w-px not-italic relative text-[15px] text-[rgba(255,255,255,0.4)]">Writing about the spaces between things. Product at Tempo. Thinking about memory and what we owe the future.</p>
      </div>
    </div>
  );
}

function Button32() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="button">
      <Span18 />
      <Container119 />
    </div>
  );
}

function Container118() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[20px] relative w-full">
        <Button32 />
      </div>
    </div>
  );
}

function Span19() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative">
        <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">284</p>
      </div>
    </div>
  );
}

function Span20() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">Followers</p>
      </div>
    </div>
  );
}

function Button33() {
  return (
    <div className="relative shrink-0 w-[160px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Span19 />
        <Span20 />
      </div>
    </div>
  );
}

function Span21() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative">
        <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">521</p>
      </div>
    </div>
  );
}

function Span22() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">Following</p>
      </div>
    </div>
  );
}

function Button34() {
  return (
    <div className="relative shrink-0 w-[160px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Span21 />
        <Span22 />
      </div>
    </div>
  );
}

function Span23() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative">
        <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">1,603</p>
      </div>
    </div>
  );
}

function Span24() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">posts</p>
      </div>
    </div>
  );
}

function Button35() {
  return (
    <div className="relative shrink-0 w-[160px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Span23 />
        <Span24 />
      </div>
    </div>
  );
}

function Span25() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative">
        <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">5,499</p>
      </div>
    </div>
  );
}

function Span26() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">faded</p>
      </div>
    </div>
  );
}

function Button36() {
  return (
    <div className="relative shrink-0 w-[160px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Span25 />
        <Span26 />
      </div>
    </div>
  );
}

function Container120() {
  return (
    <div className="bg-[#0a0a0a] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.07)] border-b-[0.8px] border-solid border-t-[0.8px] inset-0 pointer-events-none" />
      <div className="content-start flex flex-wrap gap-[32.00000762939453px_32px] items-start px-[20px] py-[20.8px] relative w-full">
        <Button33 />
        <Button34 />
        <Button35 />
        <Button36 />
      </div>
    </div>
  );
}

function Span27() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">matches</p>
      </div>
    </div>
  );
}

function Member() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute left-[-17.76%] max-w-none size-[134.74%] top-[-12.5%]" src={imgRectangle} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member1() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="generated-image (3)">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGeneratedImage3} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member2() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle1} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Members() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="Members">
      <Member />
      <Member1 />
      <Member2 />
    </div>
  );
}

function Span28() {
  return (
    <div className="content-stretch flex items-end relative shrink-0" data-name="span">
      <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">132</p>
    </div>
  );
}

function CommunityProfiles() {
  return (
    <div className="relative shrink-0" data-name="Community-profiles">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end relative">
        <Members />
        <Span28 />
      </div>
    </div>
  );
}

function Button37() {
  return (
    <div className="relative shrink-0 w-[280px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Span27 />
        <CommunityProfiles />
      </div>
    </div>
  );
}

function Span29() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">meetings</p>
      </div>
    </div>
  );
}

function Member3() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute left-[-17.76%] max-w-none size-[134.74%] top-[-12.5%]" src={imgRectangle} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member4() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="generated-image (3)">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGeneratedImage3} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member5() {
  return (
    <div className="bg-[#e2e2e2] mr-[-8px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle1} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e2e2] border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Members1() {
  return (
    <div className="content-stretch flex items-center pr-[8px] relative shrink-0" data-name="Members">
      <Member3 />
      <Member4 />
      <Member5 />
    </div>
  );
}

function Span30() {
  return (
    <div className="content-stretch flex items-end relative shrink-0" data-name="span">
      <p className="font-['Cormorant_Garamond'] leading-[22px] not-italic relative shrink-0 text-[22px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">56</p>
    </div>
  );
}

function CommunityProfiles1() {
  return (
    <div className="relative shrink-0" data-name="Community-profiles">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end relative">
        <Members1 />
        <Span30 />
      </div>
    </div>
  );
}

function Button38() {
  return (
    <div className="relative shrink-0 w-[280px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Span29 />
        <CommunityProfiles1 />
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-0 border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none" />
      <div className="content-start flex flex-wrap gap-[32.00000762939453px_32px] items-start p-[20px] relative w-full">
        <Button37 />
        <Button38 />
      </div>
    </div>
  );
}

function Span31() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">Interests</p>
      </div>
    </div>
  );
}

function Span32() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[103.625px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">social impact</p>
    </div>
  );
}

function Span33() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[52.925px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">travel</p>
    </div>
  );
}

function Span34() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[46.013px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">food</p>
    </div>
  );
}

function Span35() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[46.013px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">food</p>
    </div>
  );
}

function Span36() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[114.638px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">venture capital</p>
    </div>
  );
}

function Span37() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[58.188px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">coffee</p>
    </div>
  );
}

function Span38() {
  return (
    <div className="bg-[#1a1a1a] h-[27.5px] relative rounded-[26843500px] shrink-0 w-[60.55px]" data-name="span">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[19.5px] left-[8px] not-italic text-[#6b6b6b] text-[13px] top-[4.6px] tracking-[0.65px] whitespace-nowrap">fitness</p>
    </div>
  );
}

function Container123() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-center flex flex-wrap gap-[8px] items-center overflow-clip relative rounded-[inherit] w-full">
        <Span32 />
        <Span33 />
        <Span34 />
        <Span35 />
        <Span36 />
        <Span37 />
        <Span38 />
      </div>
    </div>
  );
}

function Button39() {
  return (
    <div className="relative shrink-0 w-full" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Span31 />
        <Container123 />
      </div>
    </div>
  );
}

function Group2() {
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
      <Group2 />
    </div>
  );
}

function Button40() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center relative">
        <Add />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.9)] text-center tracking-[2.2px] uppercase whitespace-nowrap">Add more</p>
      </div>
    </div>
  );
}

function Container124() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[26843500px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500.8px]" />
      <div className="bg-clip-padding border-[0.8px] border-[transparent] border-solid content-stretch flex items-start px-[16px] py-[6px] relative">
        <Button40 />
      </div>
    </div>
  );
}

function Container122() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.07)] border-solid border-t-[0.8px] inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[20px] pt-[20.8px] px-[20px] relative w-full">
        <Button39 />
        <Container124 />
      </div>
    </div>
  );
}

function Span39() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] tracking-[2px] uppercase whitespace-nowrap">socials</p>
      </div>
    </div>
  );
}

function Linkedin() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="linkedin">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_71_8642)" id="linkedin">
          <path d={svgPaths.p23648100} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_71_8642">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container126() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Container">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[19.5px] not-italic relative shrink-0 text-[#6b6b6b] text-[13px] tracking-[0.65px] whitespace-nowrap">LinkedIn</p>
    </div>
  );
}

function CommunityProfiles2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Community-profiles">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end relative w-full">
        <Linkedin />
        <Container126 />
      </div>
    </div>
  );
}

function Instagram() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="instagram">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_71_8636)" id="instagram">
          <path d={svgPaths.p1c756600} fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3b9c4100} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_71_8636">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container127() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Container">
      <p className="font-['Inter:Light',sans-serif] font-light leading-[19.5px] not-italic relative shrink-0 text-[#6b6b6b] text-[13px] tracking-[0.65px] whitespace-nowrap">Instagram</p>
    </div>
  );
}

function CommunityProfiles3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Community-profiles">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-end relative w-full">
        <Instagram />
        <Container127 />
      </div>
    </div>
  );
}

function Button42() {
  return (
    <div className="relative shrink-0 w-full" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10px] items-start relative w-full">
        <CommunityProfiles2 />
        <CommunityProfiles3 />
      </div>
    </div>
  );
}

function Button41() {
  return (
    <div className="relative shrink-0 w-full" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Span39 />
        <Button42 />
      </div>
    </div>
  );
}

function Group3() {
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

function Add1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="add">
      <Group3 />
    </div>
  );
}

function Button43() {
  return (
    <div className="relative rounded-[26843500px] shrink-0" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center relative">
        <Add1 />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.9)] text-center tracking-[2.2px] uppercase whitespace-nowrap">Add social link</p>
      </div>
    </div>
  );
}

function Container128() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[26843500px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#1a1a1a] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[26843500.8px]" />
      <div className="bg-clip-padding border-[0.8px] border-[transparent] border-solid content-stretch flex items-start px-[16px] py-[6px] relative">
        <Button43 />
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.07)] border-solid border-t-[0.8px] inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[20px] pt-[20.8px] px-[20px] relative w-full">
        <Button41 />
        <Container128 />
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="bg-[#0a0d0a] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.8px] relative w-full">
          <Container118 />
          <Container120 />
          <Container121 />
          <Container122 />
          <Container125 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container116() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-0 top-0 w-[400px]" data-name="Container">
      <Container117 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[2580px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container116 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-[48px] top-[311px] w-[1080px]">
      <Container9 />
      <Container11 />
    </div>
  );
}

function Body() {
  return (
    <div className="absolute bg-black h-[3550px] left-0 overflow-clip top-0 w-[1178px]" data-name="Body">
      <Div />
      <Frame1 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <div className="absolute inset-[64.82%_26.64%_0_32.53%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.166 7.03567">
          <path d={svgPaths.p2c6ec980} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[44.77%_0_18.08%_58.5%]" data-name="Vector_2">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.29987 7.42927">
          <path d={svgPaths.pb8b900} fill="var(--fill-0, white)" id="Vector_2" />
        </svg>
      </div>
      <div className="absolute inset-[14.51%_1.34%_48.09%_64.12%]" data-name="Vector_3">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.90763 7.47848">
          <path d={svgPaths.p2d969900} fill="var(--fill-0, white)" id="Vector_3" />
        </svg>
      </div>
      <div className="absolute inset-[0_32.8%_64.7%_26.1%]" data-name="Vector_4">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.21956 7.06027">
          <path d={svgPaths.p11166e00} fill="var(--fill-0, white)" id="Vector_4" />
        </svg>
      </div>
      <div className="absolute inset-[17.71%_58.37%_45.51%_0]" data-name="Vector_5">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.32665 7.35547">
          <path d={svgPaths.p279cf0b0} fill="var(--fill-0, white)" id="Vector_5" />
        </svg>
      </div>
      <div className="absolute inset-[47.97%_64.93%_14.76%_0.67%]" data-name="Vector_6">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.88087 7.45388">
          <path d={svgPaths.p2127af70} fill="var(--fill-0, white)" id="Vector_6" />
        </svg>
      </div>
    </div>
  );
}

function Svg8() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <Group4 />
    </div>
  );
}

function Div19() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[20px] top-0" data-name="div">
      <Svg8 />
    </div>
  );
}

function Button44() {
  return (
    <div className="h-[20px] relative shrink-0 w-[103.7px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div19 />
        <p className="-translate-x-1/2 absolute font-['Cormorant_Garamond'] leading-[20px] left-[66px] not-italic text-[14px] text-center text-white top-[-1.2px] tracking-[4.2px] uppercase whitespace-nowrap">LETHE</p>
      </div>
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="ArrowLeft">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="ArrowLeft">
          <path d={svgPaths.p543f5c0} id="Vector" stroke="var(--stroke-0, #6B6B6B)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Span40() {
  return (
    <div className="relative shrink-0" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[16.5px] not-italic relative shrink-0 text-[#6b6b6b] text-[11px] text-center tracking-[3.3px] uppercase whitespace-nowrap">BACK</p>
      </div>
    </div>
  );
}

function Button45() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] h-full items-center relative">
        <ArrowLeft />
        <Span40 />
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[103px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end justify-center relative size-full">
        <Button45 />
      </div>
    </div>
  );
}

function Div18() {
  return (
    <div className="absolute bg-black content-stretch flex h-[56px] items-center justify-between left-0 pb-[0.8px] px-[40px] top-0 w-[1178px]" data-name="div">
      <div aria-hidden="true" className="absolute border-b-[0.8px] border-black border-solid inset-0 pointer-events-none" />
      <Button44 />
      <Container129 />
    </div>
  );
}

export default function LetheSocial() {
  return (
    <div className="bg-white relative size-full" data-name="Lethe Social">
      <Body />
      <Div18 />
    </div>
  );
}