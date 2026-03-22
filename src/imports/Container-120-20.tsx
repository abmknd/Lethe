import svgPaths from "./svg-sgrp1wrh3o";

function Google() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="google">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="google">
          <path d={svgPaths.p39d11d00} fill="var(--fill-0, white)" id="Vector" opacity="0.7" />
          <path d={svgPaths.p26c82280} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p244e9d00} fill="var(--fill-0, white)" id="Vector_3" opacity="0.5" />
          <path d={svgPaths.p241c9080} fill="var(--fill-0, white)" id="Vector_4" opacity="0.25" />
        </g>
      </svg>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.07)] content-stretch flex items-center justify-center p-[10px] relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-[-1px] pointer-events-none rounded-[11px]" />
      <Google />
    </div>
  );
}