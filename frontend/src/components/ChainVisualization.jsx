import { useState } from "react";
import { FiLink, FiCheckCircle, FiAlertTriangle, FiCopy, FiCheck, FiChevronRight, FiMaximize2, FiX, FiLayers, FiHash } from "react-icons/fi";

export default function ChainVisualization({ records, tamperedIds, onSelectRecord }) {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  if (!records || records.length === 0) {
    return (
      <div id="chain" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[10px] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#242424] flex items-center justify-center mx-auto mb-4 text-[#8a8480]">
            <FiLayers className="w-5 h-5 text-[#c9793f]" />
          </div>
          <h3 className="font-serif text-xl text-[#f0ece9] mb-2 font-normal">
            No Blocks in Ledger
          </h3>
          <p className="text-sm text-[#8a8480] max-w-md mx-auto">
            Register external record proofs to initialize the cryptographic chain from the Genesis root.
          </p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(key);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <section id="chain" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#8a8480] block mb-1">
            CRYPTOGRAPHIC CHAIN GRAPH
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Linear Proof Chain
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#8a8480]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c9793f]" />
            <span>Valid Link</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Compromised Link</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Chain View */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[10px] p-6 overflow-x-auto relative">
        <div className="flex items-center gap-4 min-w-max pb-2">
          {/* Genesis Node */}
          <div className="flex flex-col items-center">
            <div className="w-28 bg-[#111111] border border-[#242424] rounded-[6px] p-3 text-center shadow-sm">
              <span className="font-mono text-[10px] text-[#c9793f] uppercase tracking-wider block mb-1 font-semibold">
                GENESIS
              </span>
              <div className="font-mono text-[10px] text-[#8a8480] truncate">
                ROOT_SEED
              </div>
            </div>
          </div>

          {/* Records Chain */}
          {records.map((record, i) => {
            const isTampered = tamperedIds.has(record.id);
            const isLatest = i === records.length - 1;

            return (
              <div key={record.id} className="flex items-center">
                {/* Connecting Hash Arrow */}
                <div className="flex items-center px-1">
                  <div
                    className={`w-8 h-[1px] ${
                      isTampered ? "bg-red-500/80 shadow-[0_0_8px_#ef4444]" : "bg-[#383838]"
                    }`}
                  />
                  <FiChevronRight
                    className={`w-3 h-3 -ml-1 ${
                      isTampered ? "text-red-400" : "text-[#c9793f]"
                    }`}
                  />
                </div>

                {/* Block Card */}
                <div
                  onClick={() => setSelectedBlock(record)}
                  className={`w-64 bg-[#0d0d0d] border rounded-[8px] p-4 cursor-pointer transition-all duration-200 group relative hover:scale-[1.02] ${
                    isTampered
                      ? "border-red-600/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      : isLatest
                      ? "border-[#c9793f]/60 shadow-[0_0_15px_rgba(201,121,63,0.15)] hover:border-[#c9793f]"
                      : "border-[#242424] hover:border-[#383838]"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs font-semibold text-[#f0ece9] flex items-center gap-1.5">
                      #{record.id}
                      <span className="text-[10px] font-normal text-[#8a8480] bg-[#161616] px-1.5 py-0.5 rounded border border-[#242424]">
                        v{record.version_number}
                      </span>
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        isTampered
                          ? "bg-red-950 text-red-400 border border-red-800/60 font-semibold"
                          : "bg-[#161616] text-[#b8b2ae] border border-[#2e2e2e]"
                      }`}
                    >
                      {isTampered ? "TAMPERED" : isLatest ? "TIP" : "VERIFIED"}
                    </span>
                  </div>

                  {/* Identity Tag */}
                  <div className="mb-3">
                    <div className="font-mono text-[11px] text-[#f0ece9] truncate font-medium">
                      {record.record_id}
                    </div>
                    <div className="font-mono text-[10px] text-[#8a8480]">
                      {record.source_system} / {record.record_type}
                    </div>
                  </div>

                  {/* Hash Summary */}
                  <div className="space-y-1.5 bg-[#080808] p-2 rounded border border-[#1a1a1a]">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#5a5654]">Prev Hash:</span>
                      <span className="text-[#8a8480] truncate max-w-[120px]">
                        {record.previous_ledger_hash ? `${record.previous_ledger_hash.slice(0, 8)}...` : "GENESIS"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#c9793f]">Proof Hash:</span>
                      <span className="text-[#f0ece9] font-medium truncate max-w-[120px]">
                        {record.entry_hash ? `${record.entry_hash.slice(0, 8)}...` : "..."}
                      </span>
                    </div>
                  </div>

                  {/* Click to inspect prompt */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5a5654] group-hover:text-[#b8b2ae] transition-colors">
                    <span>Click to inspect</span>
                    <FiMaximize2 className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Inspection Modal */}
      {selectedBlock && (
        <div
          onClick={() => setSelectedBlock(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#0a0a0a] border border-[#242424] rounded-[10px] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#f0ece9]">
                  Block #{selectedBlock.id} Detail
                </span>
                <span className="font-mono text-xs text-[#c9793f] bg-[#1a1410] px-2 py-0.5 rounded border border-[#8a5730]/40">
                  v{selectedBlock.version_number}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1 rounded bg-[#161616] text-[#8a8480] hover:text-[#f0ece9]"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs font-mono">
              {/* Identity */}
              <div className="grid grid-cols-2 gap-3 bg-[#111111] p-3 rounded border border-[#1f1f1f]">
                <div>
                  <span className="text-[#8a8480] block text-[10px] uppercase">Record ID</span>
                  <span className="text-[#f0ece9] font-medium">{selectedBlock.record_id}</span>
                </div>
                <div>
                  <span className="text-[#8a8480] block text-[10px] uppercase">Source System</span>
                  <span className="text-[#f0ece9] font-medium">{selectedBlock.source_system}</span>
                </div>
                <div>
                  <span className="text-[#8a8480] block text-[10px] uppercase">Record Type</span>
                  <span className="text-[#f0ece9] font-medium">{selectedBlock.record_type}</span>
                </div>
                <div>
                  <span className="text-[#8a8480] block text-[10px] uppercase">Timestamp</span>
                  <span className="text-[#f0ece9] font-medium">
                    {new Date(selectedBlock.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Hashes */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[#8a8480] mb-1">
                    <span>Entry Hash (Ledger Link)</span>
                    <button
                      onClick={() => copyToClipboard(selectedBlock.entry_hash, "entry")}
                      className="flex items-center gap-1 text-[#c9793f] hover:underline"
                    >
                      {copiedHash === "entry" ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2 bg-[#080808] border border-[#1f1f1f] rounded text-[#f0ece9] break-all select-all">
                    {selectedBlock.entry_hash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8a8480] mb-1">
                    <span>Content Hash (SHA-256 of Payload)</span>
                    <button
                      onClick={() => copyToClipboard(selectedBlock.content_hash, "content")}
                      className="flex items-center gap-1 text-[#c9793f] hover:underline"
                    >
                      {copiedHash === "content" ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2 bg-[#080808] border border-[#1f1f1f] rounded text-[#b8b2ae] break-all select-all">
                    {selectedBlock.content_hash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8a8480] mb-1">
                    <span>Previous Ledger Hash</span>
                  </div>
                  <div className="p-2 bg-[#080808] border border-[#1f1f1f] rounded text-[#8a8480] break-all select-all">
                    {selectedBlock.previous_ledger_hash || "GENESIS"}
                  </div>
                </div>

                {selectedBlock.previous_version_hash && (
                  <div>
                    <div className="flex items-center justify-between text-[#8a8480] mb-1">
                      <span>Previous Version Hash (Record Lineage)</span>
                    </div>
                    <div className="p-2 bg-[#080808] border border-[#1f1f1f] rounded text-[#8a8480] break-all select-all">
                      {selectedBlock.previous_version_hash}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              {selectedBlock.metadata && Object.keys(selectedBlock.metadata).length > 0 && (
                <div>
                  <span className="text-[#8a8480] block mb-1">Attached Metadata</span>
                  <pre className="p-3 bg-[#080808] border border-[#1f1f1f] rounded text-[#b8b2ae] overflow-x-auto">
                    {JSON.stringify(selectedBlock.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

