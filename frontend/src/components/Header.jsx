import { FiLock, FiDatabase } from "react-icons/fi";

export default function Header({ entryCount, chainValid }) {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 text-accent">
            <FiLock size={18} strokeWidth={2.2} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Hash<span className="text-accent">Log</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <FiDatabase size={14} />
            <span className="font-mono text-xs">
              {entryCount} {entryCount === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div
            className={`w-2 h-2 rounded-full ${
              chainValid === null
                ? "bg-zinc-600"
                : chainValid
                ? "bg-valid animate-pulse"
                : "bg-tampered animate-pulse"
            }`}
            title={
              chainValid === null
                ? "Not verified"
                : chainValid
                ? "Chain valid"
                : "Chain tampered"
            }
          />
        </div>
      </div>
    </header>
  );
}
