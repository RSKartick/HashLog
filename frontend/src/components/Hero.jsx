import { FiLock, FiArrowDown } from "react-icons/fi";

export default function Hero({ entryCount }) {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
      {/* subtle radial glow behind the title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-accent/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-8">
        <FiLock size={26} strokeWidth={1.8} />
      </div>

      <h1 className="relative text-5xl sm:text-6xl font-bold tracking-tight text-zinc-50">
        Hash<span className="text-accent">Log</span>
      </h1>

      <p className="relative mt-5 max-w-lg text-base sm:text-lg text-zinc-400 leading-relaxed">
        Tamper-evident audit trail. Every entry cryptographically chained to its
        predecessor — modification is mathematically impossible to hide.
      </p>

      <div className="relative mt-4 flex items-center gap-3 text-xs text-zinc-500 font-mono">
        <span>{entryCount} {entryCount === 1 ? "record" : "records"} in chain</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>SHA-256 linked</span>
      </div>

      <a
        href="#actions"
        className="relative mt-10 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        get started
        <FiArrowDown size={12} className="animate-bounce" />
      </a>
    </section>
  );
}
