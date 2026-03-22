import svgPaths from "./svg-bda5lemedg";

function Group() {
  return (
    <div className="absolute inset-[6.25%_18.75%_3.12%_18.75%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 18.1249">
        <g id="Group">
          <path d={svgPaths.p96c1400} fill="var(--fill-0, #ADFF2F)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Female() {
  return (
    <div className="relative size-full" data-name="female">
      <Group />
    </div>
  );
}