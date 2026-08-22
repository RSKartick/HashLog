import { useState, useEffect } from "react";
import { FiCpu, FiPlus, FiCheckCircle, FiAlertTriangle, FiCheck, FiCopy, FiClock, FiLock, FiShield } from "react-icons/fi";
import { createCheckpoint, listCheckpoints, verifyCheckpoint, getCheckpointAnchor } from "../api.js";

export default function CheckpointButton({ onCheckpointAdded, onCheckpointCountChange }) {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyResults, setVerifyResults] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const fetchCheckpointsList = async () => {
    try {
      const data = await listCheckpoints();
      const list = Array.isArray(data) ? data : [];
      setCheckpoints(list);
      onCheckpointCountChange?.(list.length);
    } catch {
      setCheckpoints([]);
    }
  };

  useEffect(() => {
    fetchCheckpointsList();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createCheckpoint();
      await fetchCheckpointsList();
      if (onCheckpointAdded) onCheckpointAdded();
    } catch {
      // no fake fallback — checkpoint creation requires live backend
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      const res = await verifyCheckpoint(id);
      setVerifyResults((r) => ({ ...r, [id]: res }));
    } catch (err) {
      setVerifyResults((r) => ({
        ...r,
        [id]: { valid: false, message: err?.response?.data?.detail || "Checkpoint verification failed" },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  const copyHash = async (hash, id) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(hash);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Copy this checkpoint hash:", hash);
    }
  };

  const downloadAnchor = async (id) => {
    try {
      const anchor = await getCheckpointAnchor(id);
      const blob = new Blob([JSON.stringify(anchor, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hashlog-checkpoint-${id}-anchor.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // The checkpoint remains visible even if the anchor download fails.
    }
  };

  return (
    <section id="checkpoints" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            IMMUTABLE STATE CHECKPOINTS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Checkpoint Snapshots
          </h2>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-[#f0ece9] hover:bg-white disabled:opacity-40 px-5 py-3 rounded-[4px] transition-all shadow-[0_0_20px_rgba(201,121,63,0.25)]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiPlus className="w-4 h-4" />
          )}
          <span>Create Freeze Snapshot</span>
        </button>
      </div>

      {/* Checkpoints Grid */}
      {checkpoints.length === 0 ? (
        <div className="instrument-card p-10 text-center text-[#8a8480] font-mono text-xs">
          No independent checkpoints anchored yet. Create one to freeze the current ledger root.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkpoints.map((cp) => {
            const vResult = verifyResults[cp.id];
            const height = cp.ledger_height || cp.last_record_id || 1;
            const hash = cp.root_hash || cp.ledger_hash || "ROOT_HASH";

            return (
              <div
                key={cp.id}
                className="instrument-card p-5 flex flex-col justify-between space-y-4 hover:border-[#383838] transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f1f]">
                    <div className="flex items-center gap-2">
                      <FiLock className="w-3.5 h-3.5 text-[#c9793f]" />
                      <span className="font-mono text-xs font-semibold text-[#f0ece9]">
                        Checkpoint #{cp.id}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                      Height: {height} blocks
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8a8480] mb-1">
                      <span>Root Hash Commitment:</span>
                      <button
                        onClick={() => copyHash(hash, cp.id)}
                        className="text-[#c9793f] hover:underline flex items-center gap-1"
                      >
                        {copiedId === cp.id ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-[#f0ece9] bg-[#050505] p-2 rounded border border-[#1f1f1f] break-all select-all">
                      {hash}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5a5654]">
                    <FiClock className="w-3 h-3" />
                    <span>{new Date(cp.timestamp || cp.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1f1f1f]">
                  <button onClick={() => downloadAnchor(cp.id)} className="w-full mb-2 flex items-center justify-center gap-1.5 font-mono text-xs text-[#c9793f] hover:text-[#f0ece9] bg-[#111111] border border-[#242424] py-2 rounded-[4px]">
                    <FiShield className="w-3 h-3" /> Download independent anchor
                  </button>
                  {vResult ? (
                    <div
                      className={`p-2.5 rounded-[4px] border text-[11px] font-mono flex items-center gap-2 ${
                        vResult.valid
                          ? "bg-emerald-950/30 border-emerald-800/70 text-emerald-300"
                          : "bg-red-950/30 border-red-800/70 text-red-300"
                      }`}
                    >
                      {vResult.valid ? (
                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <FiAlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="truncate">{vResult.message}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVerify(cp.id)}
                      disabled={verifyingId === cp.id}
                      className="w-full flex items-center justify-center gap-1.5 font-mono text-xs text-[#b8b2ae] hover:text-[#f0ece9] bg-[#111111] hover:bg-[#161616] border border-[#242424] py-2 rounded-[4px] transition-colors"
                    >
                      {verifyingId === cp.id ? (
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FiCpu className="w-3 h-3 text-[#c9793f]" />
                      )}
                      <span>Verify Against Chain</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


