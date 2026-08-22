import { useState } from "react";
import { FiSearch, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { verifyRecord } from "../api.js";

export default function VerifyRecord({ loading }) {
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordId, setRecordId] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setResult(null);

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
      setResult(res);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setError(typeof msg === "string" ? msg : "Verification failed");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400">
          <FiSearch size={16} />
        </div>
        <span className="text-sm font-medium text-zinc-200">
          Verify External Record
        </span>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            placeholder="Source system"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <input
            type="text"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            placeholder="Record type"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="Record ID"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Current external content to verify against"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent/50 transition-colors font-mono"
        />

        <button
          type="submit"
          disabled={!sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim() || loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-800/40 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
          ) : (
            <FiSearch size={14} />
          )}
          Verify
        </button>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-tampered/20 bg-tampered/5 text-xs text-tampered">
            <FiAlertTriangle size={12} className="shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${
            result.valid
              ? "border-valid/20 bg-valid/5 text-valid"
              : "border-tampered/20 bg-tampered/5 text-tampered"
          }`}>
            {result.valid ? (
              <FiCheckCircle size={14} className="shrink-0 mt-0.5" />
            ) : (
              <FiAlertTriangle size={14} className="shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-medium">{result.message}</p>
              <p className="opacity-60 font-mono text-[10px]">
                v{result.latest_version} &middot; expected {result.expected_hash?.slice(0, 16)}... &middot; got {result.actual_hash?.slice(0, 16)}...
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
