import svgPaths from "./svg-bscr8z4k3d";

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <div className="absolute inset-[64.82%_26.64%_0_32.53%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.166 7.03567">
          <path d={svgPaths.p2c6ec980} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[44.77%_0_18.08%_58.5%]" data-name="Vector_2">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.29987 7.42927">
          <path d={svgPaths.pb8b900} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_2" />
        </svg>
      </div>
      <div className="absolute inset-[14.51%_1.34%_48.09%_64.12%]" data-name="Vector_3">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.90763 7.47848">
          <path d={svgPaths.p2d969900} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_3" />
        </svg>
      </div>
      <div className="absolute inset-[0_32.8%_64.7%_26.1%]" data-name="Vector_4">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.21956 7.06027">
          <path d={svgPaths.p11166e00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_4" />
        </svg>
      </div>
      <div className="absolute inset-[17.71%_58.37%_45.51%_0]" data-name="Vector_5">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.32665 7.35547">
          <path d={svgPaths.p279cf0b0} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_5" />
        </svg>
      </div>
      <div className="absolute inset-[47.97%_64.93%_14.76%_0.67%]" data-name="Vector_6">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.88087 7.45388">
          <path d={svgPaths.p2127af70} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_6" />
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

export default function Button() {
  return (
    <div className="relative size-full" data-name="button">
      <Div />
      <p className="-translate-x-1/2 absolute font-['Libre_Baskerville:Regular',sans-serif] leading-[20px] left-[66px] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-center top-[-1.2px] tracking-[4.2px] uppercase whitespace-nowrap">LETHE</p>
    </div>
  );
}