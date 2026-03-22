import svgPaths from "./svg-6pgwhrpcbo";
import imgImageWithFallback1 from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";
import { imgImageWithFallback } from "./svg-xs8cs";

function ImageWithFallback() {
  return (
    <div className="mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.75px_-2.75px] mask-size-[85.5px_85.5px] relative rounded-[800px] size-[80px]" data-name="ImageWithFallback" style={{ maskImage: `url('${imgImageWithFallback}')` }}>
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[800px] size-full" src={imgImageWithFallback1} />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[92px] overflow-clip relative w-full" data-name="svg">
      <div className="absolute inset-[4.35%]" data-name="Vector">
        <div className="absolute inset-[-0.89%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 85.5 85.5">
            <path d={svgPaths.p3424c170} id="Vector" stroke="var(--stroke-0, #ADFF2F)" strokeDasharray="263.9 263.9" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[80px] top-1/2" style={{ "--transform-inner-width": "1184.796875", "--transform-inner-height": "1382" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <ImageWithFallback />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[26843500px] size-full" data-name="Container">
      <div className="flex h-[92px] items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "1184.796875", "--transform-inner-height": "1536" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none w-full">
          <Svg />
        </div>
      </div>
    </div>
  );
}