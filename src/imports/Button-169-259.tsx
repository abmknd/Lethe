import svgPaths from "./svg-i52mznp0ca";

function MoreVertical() {
  return (
    <div className="relative shrink-0 size-[13px]" data-name="MoreVertical">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
        <g id="MoreVertical">
          <path d={svgPaths.p32dbb100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.52" strokeWidth="0.8125" />
          <path d={svgPaths.p37d30900} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.52" strokeWidth="0.8125" />
          <path d={svgPaths.pcbc1c00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.52" strokeWidth="0.8125" />
        </g>
      </svg>
    </div>
  );
}

export default function Button() {
  return (
    <div className="content-stretch flex items-center pl-[13.8px] pr-[0.8px] py-[0.8px] relative rounded-[8px] size-full" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(255,255,255,0.12)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <MoreVertical />
    </div>
  );
}