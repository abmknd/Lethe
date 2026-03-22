import svgPaths from "./svg-2kuzmzvp6z";

function Apple() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="apple">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="apple">
          <path d={svgPaths.p121ab980} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.07)] content-stretch flex items-center justify-center p-[10px] relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-[-1px] pointer-events-none rounded-[11px]" />
      <Apple />
    </div>
  );
}