import { useRef, useState } from "react";
import { FiShield, FiSearch, FiCheckCircle, FiAlertTriangle, FiCpu, FiHash, FiRefreshCw, FiCheck, FiActivity } from "react-icons/fi";
import { verifyRecord, registerRecord, verifyLedger, getAuditCertificate } from "../api.js";

export default function VerifyRecord({ onRunFullVerify, ledgerResult, ledgerLoading, onMessage, onAuthorizedVersion, onCurrentLogObserved, logSnapshots = {} }) {
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordId, setRecordId] = useState("");
  const [content, setContent] = useState("");
  const [recordResult, setRecordResult] = useState(null);
  const [recordError, setRecordError] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [authorizeLoading, setAuthorizeLoading] = useState(false);
  const [showLogComparison, setShowLogComparison] = useState(false);
  const fileInputRef = useRef(null);

  const downloadCertificate = async () => {
    try {
      const certificate = await getAuditCertificate();
      const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hashlog-audit-certificate-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onMessage?.("Signed audit certificate downloaded");
    } catch (error) {
      onMessage?.(error?.response?.data?.detail || "Could not create audit certificate");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setContent(String(loadEvent.target?.result ?? ""));
      // The filename is the identity used by file registration. Always use
      // the selected filename, including its extension, for verification.
      setRecordId(file.name);
      setRecordError(null);
      setRecordResult(null);
    };
    reader.onerror = () => setRecordError("Could not read the selected file");
    reader.readAsText(file);
  };

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
      onCurrentLogObserved?.(sourceSystem.trim(), recordType.trim(), recordId.trim(), content);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setRecordError(typeof msg === "string" ? msg : "Verification failed");
    } finally {
      setRecordLoading(false);
    }
  };

  const handleAuthorizeVersion = async () => {
    if (!recordResult || recordResult.valid || authorizeLoading) return;
    setAuthorizeLoading(true);
    setRecordError(null);
    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        parsedContent = content.trim();
      }
      const created = await registerRecord({
        source_system: sourceSystem.trim(),
        record_type: recordType.trim(),
        record_id: recordId.trim(),
        content: parsedContent,
        metadata: { change_type: "authorized_update", previous_version: recordResult.latest_version },
      });
      onMessage?.(`Authorized version ${created.version_number} registered`);
      onAuthorizedVersion?.();
      setRecordResult({
        ...recordResult,
        valid: true,
        latest_version: created.version_number,
        expected_hash: created.content_hash,
        actual_hash: created.content_hash,
        message: `Authorized version ${created.version_number} registered and linked to the previous version`,
      });
    } catch (error) {
      setRecordError(error?.response?.data?.detail || "Could not register authorized version");
    } finally {
      setAuthorizeLoading(false);
    }
  };

  const snapshotKey = `${sourceSystem.trim()}/${recordType.trim()}/${recordId.trim()}`;
  const snapshot = logSnapshots[snapshotKey];
  const originalContent = snapshot?.original ?? snapshot;
  const ledgerCompromised = Boolean(ledgerResult && !ledgerResult.valid);
  const originalLines = originalContent?.split(/\r?\n/) || [];
  const currentLines = content.split(/\r?\n/);
  const changedLines = Array.from({ length: Math.max(originalLines.length, currentLines.length) }, (_, index) => ({
    number: index + 1,
    original: originalLines[index] ?? "",
    current: currentLines[index] ?? "",
  })).filter((line) => line.original !== line.current);

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
          <button
            onClick={downloadCertificate}
            className="w-full flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[#c9793f] hover:text-[#f0ece9] border border-[#3a2a20] py-2.5 rounded-[4px] transition-all"
          >
            Download signed audit certificate
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
              SNAPSHOT + HASH CHECK
            </span>
          </div>

          <form onSubmit={handleVerifyRecord} className="space-y-4">
            {ledgerCompromised && (
              <div className="p-3 rounded-[4px] border border-amber-800/70 bg-amber-950/20 text-[11px] font-mono text-amber-300 flex items-start gap-2">
                <FiAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Global ledger is currently <span className="font-semibold">COMPROMISED</span> — {ledgerResult.message}. Payload
                  comparisons reflect the corrupted proof; restore true state in the Attack Simulator, then re-run this check.
                </span>
              </div>
            )}
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

            {recordId && (
              <div className="font-mono text-[10px] text-[#8a8480]">
                Verifying file identity: <span className="text-[#c9793f]">{recordId}</span>
              </div>
            )}
            <div className="font-mono text-[10px] text-[#8a8480]">
              Source system and record type must match the values used when this file was registered.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-[9px] text-[#8a8480] uppercase">
                  Current External Record or File to Test:
                </label>
                <div className="flex items-center gap-2">
                  {content && (
                    <button
                      type="button"
                      onClick={() => {
                        setContent("");
                        setRecordId("");
                        setRecordResult(null);
                        setRecordError(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="font-mono text-[9px] uppercase text-red-400 hover:text-red-300"
                    >
                      Clear File / Payload
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-mono text-[9px] uppercase text-[#c9793f] hover:text-[#f0ece9]"
                  >
                    Choose file
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt,.log"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the current record, or choose the edited file above"
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
                {!recordResult.valid && recordResult.latest_version && !ledgerCompromised && (
                  <button
                    type="button"
                    onClick={handleAuthorizeVersion}
                    disabled={authorizeLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1a1410] border border-[#8a5730]/70 text-[#c9793f] hover:text-[#f0ece9] py-2.5 rounded-[4px] disabled:opacity-40"
                  >
                    {authorizeLoading ? "Registering linked version..." : "Register as authorized new version"}
                  </button>
                )}
                {!recordResult.valid && ledgerCompromised && (
                  <p className="font-mono text-[10px] text-[#8a8480]">
                    Registering a new version is disabled while the global ledger is compromised.
                  </p>
                )}
              </div>
            )}

            {originalContent !== undefined && content && (
              <div className="border border-[#242424] rounded-[4px] bg-[#080808] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLogComparison((visible) => !visible)}
                  className="w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs text-[#c9793f] hover:text-[#f0ece9]"
                >
                  <span>{showLogComparison ? "Hide log comparison" : "View original and current log"}</span>
                  <span>{changedLines.length} changed line{changedLines.length === 1 ? "" : "s"}</span>
                </button>
                {showLogComparison && (
                  <div className="border-t border-[#242424] p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[#8a8480] mb-1">Original session snapshot</div>
                        <pre className="max-h-56 overflow-auto whitespace-pre-wrap bg-[#050505] border border-[#1f1f1f] p-3 text-[10px] text-emerald-300">{originalContent}</pre>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[#8a8480] mb-1">Current file</div>
                        <pre className="max-h-56 overflow-auto whitespace-pre-wrap bg-[#050505] border border-[#1f1f1f] p-3 text-[10px] text-red-300">{content}</pre>
                      </div>
                    </div>
                    {changedLines.length > 0 && (
                      <div className="font-mono text-[10px] space-y-1">
                        <div className="text-[#8a8480] uppercase">Changed lines</div>
                        {changedLines.slice(0, 50).map((line) => (
                          <div key={line.number} className="grid grid-cols-[45px_1fr] gap-2 bg-[#111111] p-1.5">
                            <span className="text-[#c9793f]">Line {line.number}</span>
                            <span><span className="text-red-300">- {line.original || "(removed)"}</span><br /><span className="text-emerald-300">+ {line.current || "(added)"}</span></span>
                          </div>
                        ))}
                        {changedLines.length > 50 && <div className="text-[#8a8480]">Showing first 50 changed lines.</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}


