import imgImg from "figma:asset/8c692006a4e235a1e390f04abab516d1cc8c4603.png";

function Img() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[33px] top-1/2" data-name="img">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute border-[0.8px] border-[rgba(255,255,255,0.07)] border-solid left-0 overflow-clip rounded-[26843500px] size-[32px] top-0" data-name="Container">
      <Img />
    </div>
  );
}

function Container1() {
  return <div className="absolute bg-[#adff2f] border-[#0b0e0b] border-[1.6px] border-solid left-0 rounded-[26843500px] size-[9px] top-0" data-name="Container" />;
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Container />
      <Container1 />
    </div>
  );
}