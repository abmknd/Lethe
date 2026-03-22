import imgRectangle from "figma:asset/8f8487078257ce2c7db83e0c3005b1e39ee814cd.png";
import imgGeneratedImage3 from "figma:asset/fe98c07725f02b23548275ef00b42b5d401a7e57.png";
import imgRectangle1 from "figma:asset/ad4f4c674c88db29136842902b4279a695b867c1.png";

function Member() {
  return (
    <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute left-[-17.76%] max-w-none size-[134.74%] top-[-12.5%]" src={imgRectangle} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member1() {
  return (
    <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="generated-image (3)">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGeneratedImage3} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

function Member2() {
  return (
    <div className="bg-[#e2e2e2] mr-[-20px] relative rounded-[32px] shrink-0 size-[32px]" data-name="Member">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[32px] top-1/2" data-name="Rectangle">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle1} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-[-1px] pointer-events-none rounded-[33px]" />
    </div>
  );
}

export default function Members() {
  return (
    <div className="content-stretch flex items-center pr-[20px] relative size-full" data-name="Members">
      <Member />
      <Member1 />
      <Member2 />
    </div>
  );
}