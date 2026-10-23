export default function FIXMIMark({ className = "" }: { className?: string }) {
  return (
    <div className={`fixmi-mark-wrap ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fixmi-logo.png"
        alt="FIXMI Mark"
        width={32}
        height={32}
        className="fixmi-mark__img h-7 w-7 object-contain rounded-[6px]"
      />
    </div>
  );
}
