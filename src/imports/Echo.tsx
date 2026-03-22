import svgPaths from "./svg-eg3wff9a7d";

function Group() {
  return (
    <div className="absolute inset-[6.25%]" data-name="Group">
      <div className="absolute inset-[-3.57%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1875 1874.9">
          <g id="Group">
            <path d={svgPaths.p1709f8c0} id="Vector" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="125" />
            <path d={svgPaths.p34acf680} id="Vector_2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="125" />
            <path d={svgPaths.p351b0080} id="Vector_3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="125" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function Echo() {
  return (
    <div className="relative size-full" data-name="echo">
      <Group />
    </div>
  );
}