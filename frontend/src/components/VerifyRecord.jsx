import { useState } from "react";
import { FiShield, FiSearch, FiCheckCircle, FiAlertTriangle, FiCpu, FiHash, FiRefreshCw, FiCheck, FiActivity } from "react-icons/fi";
import { verifyRecord, verifyLedger } from "../api.js";

export default function VerifyRecord({ onRunFullVerify, ledgerResult, ledgerLoading }) {
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordId, setRecordId] = useState("");
  const [content, setContent] = useState("");
  const [recordResult, setRecordResult] = useState(null);
  const [recordError, setRecordError] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);

  const handleVerifyRecord = async (e) => {
    e.preventDefault();
    if (recordLoading || !sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim()) return;

    setRecordError(null);
    setRecordResult(null);
    setRecordLoading(true);

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = content.trim();
    }

    try {
      const res = await verifyRecord({
        source_system: sourceSystem.trim(),
        record_type: recordType.trim(),
        record_id: recordId.trim(),
        content: parsedContent,
      });
      setRecordResult(res);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setRecordError(typeof msg === "string" ? msg : "Verification failed");
    } finally {
      setRecordLoading(false);
    }
  };

  return (
    <section id="verify" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            CRYPTOGRAPHIC AUDITING
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Verification Studio
          </h2>
        </div>
        <p className="font-mono text-xs text-[#8a8480] max-w-md">
          Validate full hash chain continuity from Genesis to tip or run zero-trust matches against live external databases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Ledger Chain Verification Card */}
        <div className="lg:col-span-5 instrument-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <FiShield className="w-4 h-4 text-[#c9793f]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                  Global Ledger Integrity
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                RECURSIVE AUDIT
              </span>
            </div>

            <p className="text-xs text-[#b8b2ae] leading-relaxed">
              Traverses every proof block from Genesis to tip. Computes dual SHA-256 links (<code className="text-[#c9793f]">previous_ledger_hash</code> and <code className="text-[#c9793f]">previous_version_hash</code>) to certify zero tampering.
            </p>

            {ledgerResult && (
              <div
                className={`p-4 rounded-[4px] border ${
                  ledgerResult.valid
                    ? "bg-emerald-950/30 border-emerald-800/70 text-emerald-300"
                    : "bg-red-950/30 border-red-800/70 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold mb-1">
                  {ledgerResult.valid ? (
                    <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <FiAlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{ledgerResult.message}</span>
                </div>
                <div className="font-mono text-[10px] opacity-80 pl-6">
                  {ledgerResult.total_records} proofs audited ·{" "}
                  {ledgerResult.valid ? "0 anomalies detected" : `compromised at block #${ledgerResult.tampered_at}`}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onRunFullVerify}
            disabled={ledgerLoading}
            className="w-full flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-[#f0ece9] hover:bg-white py-3.5 rounded-[4px] transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(201,121,63,0.25)]"
          >
            {ledgerLoading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiShield className="w-4 h-4" />
            )}
            <span>Execute Full Ledger Audit</span>
          </button>
        </div>

        {/* External Record Verification Card */}
        <div className="lg:col-span-7 instrument-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <FiSearch className="w-4 h-4 text-[#c9793f]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                External Live Payload Validator
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
              ZERO-KNOWLEDGE
            </span>
          </div>

          <form onSubmit={handleVerifyRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-mono text-[9px] text-[#8a8480] uppercase mb-1">Source System</label>
                <input
                  type="text"
                  required
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-[#8a8480] uppercase mb-1">Record Type</label>
                <input
                  type="text"
                  required
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-[#8a8480] uppercase mb-1">Record ID</label>
                <input
                  type="text"
                  required
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] text-[#8a8480] uppercase mb-1">
                Current External Record Payload to Test:
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] p-3 font-mono text-xs text-[#f0ece9] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={recordLoading}
              className="w-full flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#b8b2ae] hover:text-[#f0ece9] bg-[#111111] hover:bg-[#161616] border border-[#242424] hover:border-[#383838] py-3 rounded-[4px] transition-colors"
            >
              {recordLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSearch className="w-3.5 h-3.5 text-[#c9793f]" />
              )}
              <span>Compare Live Payload with Ledger Proof</span>
            </button>

            {recordError && (
              <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-[4px] text-xs font-mono text-red-300">
                {recordError}
              </div>
            )}

            {recordResult && (
              <div
                className={`p-4 rounded-[4px] border font-mono text-xs space-y-2.5 ${
                  recordResult.valid
                    ? "bg-emerald-950/20 border-emerald-800/70 text-emerald-300"
                    : "bg-red-950/20 border-red-800/70 text-red-300"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    {recordResult.valid ? (
                      <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FiAlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <span>{recordResult.message}</span>
                  </div>
                  <span className="text-[10px] text-[#8a8480]">Version #{recordResult.latest_version}</span>
                </div>

                <div className="space-y-1.5 text-[10px] pt-2 border-t border-[#1f1f1f]">
                  <div className="flex items-center justify-between text-[#8a8480]">
                    <span>Expected On-Chain Hash:</span>
                    <span className="text-[#b8b2ae] truncate max-w-[240px] select-all">
                      {recordResult.expected_hash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8480]">Computed Live Hash:</span>
                    <span className={`truncate max-w-[240px] select-all font-semibold ${recordResult.valid ? "text-emerald-400" : "text-red-400"}`}>
                      {recordResult.actual_hash}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}


