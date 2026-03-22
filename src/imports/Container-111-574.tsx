import svgPaths from "./svg-6g888t6qul";

function GoogleCalendar() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="google-calendar">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_111_586)" id="google-calendar">
          <path d={svgPaths.p27205200} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_111_586">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.07)] content-stretch flex items-center justify-center p-[10px] relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-[-1px] pointer-events-none rounded-[11px]" />
      <GoogleCalendar />
    </div>
  );
}