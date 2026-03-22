import svgPaths from "./svg-04rjomrozc";

function Group() {
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

export default function Gender() {
  return (
    <div className="relative size-full" data-name="gender">
      <Group />
    </div>
  );
}