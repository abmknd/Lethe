import svgPaths from "./svg-lr1ae9x9de";
import imgImg from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";

function Group() {
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

function Svg() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <Group />
    </div>
  );
}

function Div() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[20px] top-0" data-name="div">
      <Svg />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[20px] relative shrink-0 w-[103.7px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Div />
        <p className="-translate-x-1/2 absolute font-['Libre_Baskerville:Regular',sans-serif] leading-[20px] left-[66px] not-italic text-[14px] text-center text-white top-[-1.2px] tracking-[4.2px] uppercase whitespace-nowrap">LETHE</p>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="absolute left-0 pointer-events-none rounded-[26843500px] size-[36px] top-0" data-name="img">
      <div aria-hidden="true" className="absolute inset-0 rounded-[26843500px]">
        <div className="absolute bg-[#1a1a1a] inset-0 rounded-[26843500px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[26843500px] size-full" src={imgImg} />
      </div>
      <div aria-hidden="true" className="absolute border-[#3a3a3a] border-[0.8px] border-solid inset-0 rounded-[26843500px]" />
    </div>
  );
}

function Button1() {
  return (
    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Img />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[42.4px] relative shrink-0 w-[36px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Button1 />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <div className="bg-black content-stretch flex items-center justify-between pb-[0.8px] px-[40px] relative size-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-b-[0.8px] border-black border-solid inset-0 pointer-events-none" />
      <Button />
      <Container />
    </div>
  );
}