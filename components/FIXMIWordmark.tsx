export default function FIXMIWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`fixmi-wordmark-wrap ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.svg"
        alt="FIXMI Service Center"
        width={140}
        height={28}
        className="fixmi-wordmark__img h-5 w-auto object-contain"
      />
    </div>
  );
}
