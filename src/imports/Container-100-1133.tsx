import svgPaths from "./svg-fd2jof13bg";

function Container1() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[236.65px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Cormorant_Garamond'] leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.4)] top-[0.6px] whitespace-nowrap">Product Designer</p>
      </div>
    </div>
  );
}

function P() {
  return (
    <div className="absolute h-[19.5px] left-[22px] top-0 w-[106.225px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.25)] top-[0.6px] tracking-[0.52px] whitespace-nowrap">Berlin, Germany</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[11.47%_13.56%_5.19%_19.77%]" data-name="Group">
      <div className="absolute inset-[78.14%_13.56%_5.19%_19.77%]" data-name="Vector">
        <div className="absolute inset-[-18.75%_-4.69%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6666 3.66683">
            <path d={svgPaths.p9e12390} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeLinecap="round" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[30.22%_36.48%_48.94%_42.69%]" data-name="Vector">
        <div className="absolute inset-[-15%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.33334 4.33334">
            <path d={svgPaths.p3efa4500} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[11.47%_17.72%_21.86%_23.94%]" data-name="Vector">
        <div className="absolute inset-[-4.69%_-5.36%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3344 11.667">
            <path d={svgPaths.p29119600} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <Group />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[16px] top-[1.75px]" data-name="Container">
      <Svg />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[19.5px] left-0 top-0 w-[128.225px]" data-name="Container">
      <P />
      <Container4 />
    </div>
  );
}

function P1() {
  return (
    <div className="absolute h-[19.5px] left-[22px] top-0 w-[62.425px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.25)] top-[0.6px] tracking-[0.52px] whitespace-nowrap">She / Her</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 14.5125">
        <path d={svgPaths.p3aab6280} fill="var(--fill-0, #ADFF2F)" fillOpacity="0.5" id="Vector" />
      </svg>
    </div>
  );
}

function Svg1() {
  return (
    <div className="h-[14.512px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <Group1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col h-[14.512px] items-start left-[3px] top-[2.75px] w-[10px]" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[19.5px] left-[152.22px] top-0 w-[84.425px]" data-name="Container">
      <P1 />
      <Container6 />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[236.65px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container3 />
        <Container5 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative size-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}