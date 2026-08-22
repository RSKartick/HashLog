import { useState, useMemo } from "react";
import { FiLink, FiCheckCircle, FiAlertTriangle, FiCopy, FiCheck, FiChevronRight, FiMaximize2, FiX, FiLayers, FiGitCommit, FiGitBranch, FiClock } from "react-icons/fi";

export default function ChainVisualization({ records, tamperedIds, logSnapshots = {} }) {
  const [viewMode, setViewMode] = useState("global"); // "global" | "lineage"
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [inspectBlock, setInspectBlock] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Group records by identity for lineage view
  const recordIdentities = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = `${r.source_system}/${r.record_type}/${r.record_id}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [records]);

  const activeIdentityKey = useMemo(() => {
    const keys = Object.keys(recordIdentities);
    if (selectedRecordId && recordIdentities[selectedRecordId]) return selectedRecordId;
    return keys[0] || null;
  }, [recordIdentities, selectedRecordId]);

  const activeLineageRecords = useMemo(() => {
    return activeIdentityKey ? recordIdentities[activeIdentityKey] || [] : [];
  }, [recordIdentities, activeIdentityKey]);

  const inspectSnapshot = inspectBlock && logSnapshots[`${inspectBlock.source_system}/${inspectBlock.record_type}/${inspectBlock.record_id}`];
  // Prefer the in-memory original/current pair (it lets us show a diff after
  // the demo tamper), but still show the row's stored raw snapshot after a
  // page reload when no in-memory snapshot exists.
  const inspectOriginal = inspectSnapshot?.original ?? inspectBlock?.raw_content;
  const inspectCurrent = inspectSnapshot?.current ?? inspectBlock?.raw_content;
  const inspectChanges = inspectOriginal !== undefined && inspectCurrent !== undefined
    ? Array.from({ length: Math.max(String(inspectOriginal).split(/\r?\n/).length, String(inspectCurrent).split(/\r?\n/).length) }, (_, index) => ({
        number: index + 1,
        original: String(inspectOriginal).split(/\r?\n/)[index] ?? "",
        current: String(inspectCurrent).split(/\r?\n/)[index] ?? "",
      })).filter((line) => line.original !== line.current)
    : [];

  if (!records || records.length === 0) {
    return (
      <div id="chain" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="instrument-card p-12 text-center">
          <FiLayers className="w-6 h-6 text-[#c9793f] mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#f0ece9] mb-2 font-normal">
            No Blocks in Ledger
          </h3>
          <p className="font-mono text-xs text-[#8a8480]">
            Register external record proofs to initialize the cryptographic chain.
          </p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text, key) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setCopiedHash(key);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      window.prompt("Copy this hash:", text);
    }
  };

  return (
    <section id="chain" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Section Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            CRYPTOGRAPHIC CHAIN GRAPH
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            {viewMode === "global" ? "Linear Proof Chain" : "Per-Record Historical DAG"}
          </h2>
        </div>

        {/* Tactile Hardware Switcher */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#242424] rounded-[4px] p-1 shadow-inner">
          <button
            onClick={() => setViewMode("global")}
            className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-[3px] transition-all ${
              viewMode === "global"
                ? "bg-[#1f1f1f] text-[#f0ece9] font-medium shadow-sm border border-[#2e2e2e]"
                : "text-[#8a8480] hover:text-[#f0ece9]"
            }`}
          >
            <FiGitCommit className="w-3.5 h-3.5 text-[#c9793f]" />
            <span>Global Spine</span>
          </button>
          <button
            onClick={() => setViewMode("lineage")}
            className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-[3px] transition-all ${
              viewMode === "lineage"
                ? "bg-[#1f1f1f] text-[#f0ece9] font-medium shadow-sm border border-[#2e2e2e]"
                : "text-[#8a8480] hover:text-[#f0ece9]"
            }`}
          >
            <FiGitBranch className="w-3.5 h-3.5 text-[#c9793f]" />
            <span>Record DAG ({Object.keys(recordIdentities).length})</span>
          </button>
        </div>
      </div>

      {viewMode === "global" ? (
        /* Global Linear Spine Graph with Blockchain Connecting Lines */
        <div className="bg-[#0a0a0a] border border-[#242424] rounded-[8px] p-6 overflow-x-auto relative">
          <div className="flex items-center min-w-max pb-4 pt-2">
            {/* Genesis Anchor Block */}
            <div className="flex items-center">
              <div className="w-36 bg-[#111111] border border-[#2e2e2e] rounded-[6px] p-4 text-center relative shadow-[0_0_15px_rgba(201,121,63,0.1)]">
                {/* Outgoing socket pin */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#c9793f] border-2 border-[#000000] shadow-[0_0_8px_#c9793f]" />
                
                <span className="font-mono text-[10px] text-[#c9793f] uppercase tracking-widest block mb-1 font-bold">
                  GENESIS BLOCK
                </span>
                <div className="font-mono text-[10px] text-[#f0ece9] font-medium">#0 ROOT</div>
                <div className="font-mono text-[8px] text-[#8a8480] mt-1">HEIGHT: 0</div>
              </div>

              {/* Connecting Blockchain Line from Genesis to Block 1 */}
              <div className="w-14 relative flex items-center justify-center -mx-[1px]">
                <svg className="w-full h-6" viewBox="0 0 56 24">
                  <line
                    x1="0"
                    y1="12"
                    x2="48"
                    y2="12"
                    stroke="#c9793f"
                    strokeWidth="2"
                    className="animate-chain-flow"
                  />
                  <polygon points="46,7 56,12 46,17" fill="#c9793f" />
                </svg>
              </div>
            </div>

            {/* Block Sequence */}
            {records.map((record, i) => {
              const isTampered = tamperedIds.has(record.id);
              const isLatest = i === records.length - 1;
              const hasNext = i < records.length - 1;
              const nextIsTampered = hasNext && tamperedIds.has(records[i + 1].id);

              return (
                <div key={record.id} className="flex items-center">
                  {/* Block Node Card */}
                  <div
                    onClick={() => setInspectBlock(record)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setInspectBlock(record);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-64 bg-[#0d0d0d] border rounded-[8px] p-4 cursor-pointer transition-all duration-200 group relative hover:scale-[1.02] ${
                      isTampered
                        ? "border-red-600/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                        : isLatest
                        ? "border-[#c9793f]/80 shadow-[0_0_20px_rgba(201,121,63,0.2)] hover:border-[#c9793f]"
                        : "border-[#242424] hover:border-[#383838]"
                    }`}
                  >
                    {/* Incoming socket pin */}
                    <div
                      className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#000000] ${
                        isTampered ? "bg-red-400 shadow-[0_0_8px_#ef4444]" : "bg-[#c9793f] shadow-[0_0_8px_#c9793f]"
                      }`}
                    />

                    {/* Outgoing socket pin (if not tip) */}
                    {!isLatest && (
                      <div
                        className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#000000] ${
                          nextIsTampered ? "bg-red-400 shadow-[0_0_8px_#ef4444]" : "bg-[#c9793f] shadow-[0_0_8px_#c9793f]"
                        }`}
                      />
                    )}

                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono text-xs font-semibold text-[#f0ece9] flex items-center gap-1.5">
                        BLOCK #{record.id}
                        <span className="text-[9px] font-normal text-[#8a8480] bg-[#161616] px-1.5 py-0.5 rounded border border-[#242424]">
                          v{record.version_number}
                        </span>
                      </span>
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded ${
                          isTampered
                            ? "bg-red-950 text-red-400 border border-red-800/60 font-semibold"
                            : isLatest
                            ? "bg-[#1a1410] text-[#c9793f] border border-[#8a5730]/60 font-semibold"
                            : "bg-[#161616] text-[#b8b2ae] border border-[#2e2e2e]"
                        }`}
                      >
                        {isTampered ? "TAMPERED" : isLatest ? "TIP" : "VERIFIED"}
                      </span>
                    </div>

                    {/* Identity Tag */}
                    <div className="mb-2.5">
                      <div className="font-mono text-[11px] text-[#f0ece9] truncate font-medium">
                        {record.record_id}
                      </div>
                      <div className="font-mono text-[10px] text-[#8a8480]">
                        {record.source_system} / {record.record_type}
                      </div>
                    </div>

                    {/* Hashes Bus Box */}
                    <div className="space-y-1 bg-[#050505] p-2 rounded border border-[#161616] font-mono text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5a5654]">prev_hash:</span>
                        <span className="text-[#8a8480] truncate max-w-[110px]">
                          {record.previous_ledger_hash ? `${record.previous_ledger_hash.slice(0, 8)}...` : "GENESIS"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#c9793f]">entry_hash:</span>
                        <span className="text-[#f0ece9] font-medium truncate max-w-[110px]">
                          {record.entry_hash ? `${record.entry_hash.slice(0, 8)}...` : "..."}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-[#5a5654] group-hover:text-[#b8b2ae]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setInspectBlock(record);
                        }}
                        className="flex items-center gap-1 text-[#c9793f] hover:text-[#f0ece9] uppercase"
                      >
                        <span>Inspect log + forensic certificate</span>
                        <FiMaximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Blockchain Connecting Line to next block */}
                  {hasNext && (
                    <div className="w-16 relative flex items-center justify-center -mx-[1px]">
                      <svg className="w-full h-8" viewBox="0 0 64 32">
                        {/* Base Line */}
                        <line
                          x1="0"
                          y1="16"
                          x2="54"
                          y2="16"
                          stroke={nextIsTampered ? "#ef4444" : "#c9793f"}
                          strokeWidth="2"
                          className={nextIsTampered ? "opacity-60" : "animate-chain-flow"}
                        />
                        {/* Directional arrow head touching edge */}
                        <polygon
                          points="54,10 64,16 54,22"
                          fill={nextIsTampered ? "#ef4444" : "#c9793f"}
                        />
                      </svg>
                      {nextIsTampered && (
                        <span className="absolute -top-1 font-mono text-[8px] bg-red-950 text-red-400 border border-red-800 px-1 rounded whitespace-nowrap">
                          FRACTURE
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Per-Record Version Lineage DAG */
        <div className="instrument-card p-6 space-y-6">
          {/* Identity Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1a1a1a]">
            <span className="font-mono text-[10px] text-[#8a8480] uppercase mr-2 shrink-0">
              Select Record Lineage:
            </span>
            {Object.keys(recordIdentities).map((key) => {
              const versions = recordIdentities[key];
              const isSelected = key === activeIdentityKey;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedRecordId(key)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-[4px] border whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isSelected
                      ? "border-[#c9793f] bg-[#1a1410] text-[#f0ece9] font-medium"
                      : "border-[#1f1f1f] bg-[#0a0a0a] text-[#8a8480] hover:text-[#f0ece9]"
                  }`}
                >
                  <span>{key}</span>
                  <span className="text-[10px] bg-[#111111] px-1.5 py-0.2 rounded border border-[#242424] text-[#c9793f]">
                    {versions.length} ver
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lineage Branching Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[1px] before:bg-[#2e2e2e]">
            {activeLineageRecords.map((versionRecord, idx) => {
              const isTampered = tamperedIds.has(versionRecord.id);
              const isLatestVersion = idx === activeLineageRecords.length - 1;

              return (
                <div key={versionRecord.id} className="relative group">
                  {/* Node Dot */}
                  <div
                    className={`absolute -left-6 top-3 w-2.5 h-2.5 rounded-full border-2 bg-[#000000] -translate-x-1/2 ${
                      isTampered
                        ? "border-red-400 bg-red-400 animate-ping"
                        : isLatestVersion
                        ? "border-[#c9793f] bg-[#c9793f]"
                        : "border-[#8a8480]"
                    }`}
                  />

                  {/* Version Detail Card */}
                  <div
                    onClick={() => setInspectBlock(versionRecord)}
                    className="bg-[#0d0d0d] border border-[#1f1f1f] hover:border-[#383838] rounded-[6px] p-4 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[#f0ece9] font-bold">
                          Version {versionRecord.version_number}.0
                        </span>
                        <span className="text-[#8a8480]">· Block #{versionRecord.id}</span>
                        {isLatestVersion && (
                          <span className="text-[9px] bg-[#1a1410] border border-[#8a5730]/50 text-[#c9793f] px-2 py-0.2 rounded">
                            CURRENT_HEAD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#5a5654]">
                        <FiClock className="w-3 h-3" />
                        <span>{new Date(versionRecord.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs bg-[#050505] p-3 rounded border border-[#161616]">
                      <div>
                        <span className="text-[#5a5654] block text-[9px] uppercase">Payload Content Hash</span>
                        <span className="text-[#b8b2ae] truncate block select-all">
                          {versionRecord.content_hash}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#c9793f] block text-[9px] uppercase">Version Sealed Hash</span>
                        <span className="text-[#f0ece9] truncate block select-all font-medium">
                          {versionRecord.entry_hash}
                        </span>
                      </div>
                    </div>

                    {versionRecord.metadata && (
                      <div className="mt-2 text-[10px] font-mono text-[#8a8480] truncate">
                        Metadata: {JSON.stringify(versionRecord.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Inspection Forensic Modal */}
      {inspectBlock && (
        <div
          onClick={() => setInspectBlock(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="instrument-card w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#f0ece9]">
                  Forensic Certificate · Block #{inspectBlock.id}
                </span>
                <span className="font-mono text-xs text-[#c9793f] bg-[#1a1410] px-2 py-0.5 rounded border border-[#8a5730]/40">
                  v{inspectBlock.version_number}
                </span>
              </div>
              <button
                onClick={() => setInspectBlock(null)}
                className="p-1 rounded bg-[#161616] text-[#8a8480] hover:text-[#f0ece9]"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 bg-[#111111] p-3 rounded border border-[#1f1f1f]">
                <div>
                  <span className="text-[#5a5654] block text-[9px] uppercase">Record Identity</span>
                  <span className="text-[#f0ece9] font-medium">{inspectBlock.record_id}</span>
                </div>
                <div>
                  <span className="text-[#5a5654] block text-[9px] uppercase">Source Origin</span>
                  <span className="text-[#f0ece9] font-medium">{inspectBlock.source_system}</span>
                </div>
                <div>
                  <span className="text-[#5a5654] block text-[9px] uppercase">Record Class</span>
                  <span className="text-[#f0ece9] font-medium">{inspectBlock.record_type}</span>
                </div>
                <div>
                  <span className="text-[#5a5654] block text-[9px] uppercase">Timestamp Epoch</span>
                  <span className="text-[#f0ece9] font-medium">{inspectBlock.timestamp}</span>
                </div>
              </div>

              {inspectCurrent !== undefined && (
                <div className="space-y-2 border border-[#2e2e2e] bg-[#080808] rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#c9793f] uppercase text-[10px]">Raw log evidence</span>
                    <span className={inspectChanges.length ? "text-red-300" : "text-emerald-300"}>{inspectChanges.length} changed lines</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><div className="text-[9px] text-[#8a8480] mb-1">TRUSTED ORIGINAL</div><pre className="max-h-40 overflow-auto whitespace-pre-wrap bg-[#050505] p-2 text-[10px] text-emerald-300">{inspectOriginal}</pre></div>
                    <div><div className="text-[9px] text-[#8a8480] mb-1">CURRENT STORED LOG</div><pre className="max-h-40 overflow-auto whitespace-pre-wrap bg-[#050505] p-2 text-[10px] text-red-300">{inspectCurrent}</pre></div>
                  </div>
                  {inspectChanges.length > 0 && <div className="space-y-1 text-[10px]"><div className="text-[#8a8480] uppercase">Detected changes</div>{inspectChanges.slice(0, 25).map((line) => <div key={line.number} className="bg-[#111111] p-1.5"><span className="text-[#c9793f] mr-2">Line {line.number}</span><span className="text-red-300">- {line.original || "(removed)"}</span><span className="mx-2 text-[#8a8480]">→</span><span className="text-emerald-300">+ {line.current || "(added)"}</span></div>)}</div>}
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[#8a8480] mb-1">
                    <span>Linear Entry Hash (Ledger Link)</span>
                    <button
                      onClick={() => copyToClipboard(inspectBlock.entry_hash, "entry")}
                      className="flex items-center gap-1 text-[#c9793f] hover:underline"
                    >
                      {copiedHash === "entry" ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#050505] border border-[#1f1f1f] rounded text-[#f0ece9] break-all select-all">
                    {inspectBlock.entry_hash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8a8480] mb-1">
                    <span>Content Hash (SHA-256 Payload)</span>
                    <button
                      onClick={() => copyToClipboard(inspectBlock.content_hash, "content")}
                      className="flex items-center gap-1 text-[#c9793f] hover:underline"
                    >
                      {copiedHash === "content" ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#050505] border border-[#1f1f1f] rounded text-[#b8b2ae] break-all select-all">
                    {inspectBlock.content_hash}
                  </div>
                </div>

                <div>
                  <span className="text-[#5a5654] block mb-1 text-[9px] uppercase">Previous Ledger Link</span>
                  <div className="p-2.5 bg-[#050505] border border-[#1f1f1f] rounded text-[#8a8480] break-all select-all">
                    {inspectBlock.previous_ledger_hash || "GENESIS"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


