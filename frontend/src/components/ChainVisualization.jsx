import { FiLink } from "react-icons/fi";

export default function ChainVisualization({ entries, tamperedIds }) {
  if (entries.length === 0) return null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 px-1">
      {entries.map((entry, i) => {
        const isTampered = tamperedIds.has(entry.id);
        const color = isTampered ? "bg-tampered" : "bg-accent/70";
        const textColor = isTampered ? "text-tampered" : "text-accent/60";

        return (
          <div key={entry.id} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3 h-3 rounded-full ${color} ${
                  isTampered ? "animate-pulse" : ""
                }`}
              />
              <span className={`font-mono text-[10px] ${textColor}`}>
                #{entry.id}
              </span>
            </div>

            {/* Link */}
            {i < entries.length - 1 && (
              <div className="flex items-center mx-1">
                <div
                  className={`w-8 h-px ${
                    isTampered ? "bg-tampered/40" : "bg-zinc-700"
                  }`}
                />
                <FiLink
                  size={10}
                  className={`-mx-0.5 ${
                    isTampered ? "text-tampered/50" : "text-zinc-600"
                  }`}
                />
                <div
                  className={`w-8 h-px ${
                    tamperedIds.has(entries[i + 1].id)
                      ? "bg-tampered/40"
                      : "bg-zinc-700"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
