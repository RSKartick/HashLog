import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { listCheckpoints } from "../api.js";

const hhmm = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function Timeline({ records }) {
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    let alive = true;
    listCheckpoints()
      .then((list) => alive && setCheckpoints(Array.isArray(list) ? list : []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const events = [
    ...records.map((r) => ({
      id: `r${r.id}-${r.version_number}`,
      time: r.timestamp,
      label: r.version_number === 1 ? "Record registered" : `Version ${r.version_number} created`,
      detail: `${r.record_id} · block #${r.id}`,
    })),
    ...checkpoints.map((c) => ({
      id: `c${c.id}`,
      time: Date.parse(c.created_at),
      label: "Checkpoint anchored",
      detail: `snapshot #${c.id} · root ${String(c.ledger_hash ?? "").slice(0, 10)}…`,
    })),
  ].sort((a, b) => a.time - b.time);

  return (
    <section id="timeline" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            Trust Timeline
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9]">Ledger History</h2>
        </div>
        <span className="font-mono text-xs text-[#8a8480]">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <div className="instrument-card py-14 text-center font-mono text-xs text-[#8a8480]">
          No ledger activity yet.
        </div>
      ) : (
        <ol className="instrument-card p-6 relative">
          {events.map((e, i) => {
            const last = i === events.length - 1;
            return (
              <li key={e.id} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                {!last && (
                  <span aria-hidden="true" className="absolute left-[7px] top-5 bottom-0 w-px bg-[#242424]" />
                )}
                <span className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-emerald-400/40 bg-emerald-500/90 flex items-center justify-center">
                  <FiCheck className="h-2 w-2 text-black" strokeWidth={3.5} />
                </span>
                <div className="min-w-0 flex-1 flex items-baseline justify-between gap-3 pt-0.5">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-medium text-[#b8b2ae] truncate">{e.label}</p>
                    <p className="font-mono text-[10px] text-[#5a5654] truncate">{e.detail}</p>
                  </div>
                  <time dateTime={new Date(e.time).toISOString()} className="shrink-0 font-mono text-[11px] tabular-nums text-[#8a8480]">
                    {Number.isFinite(e.time) ? hhmm(e.time) : "—"}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
