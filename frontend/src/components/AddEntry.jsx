import { useState } from "react";
import { FiPlus, FiDatabase, FiHash, FiFileText, FiTag } from "react-icons/fi";

export default function AddEntry({ onSubmit, loading }) {
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordId, setRecordId] = useState("");
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim() || loading) return;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = content.trim();
    }

    onSubmit({
      source_system: sourceSystem.trim(),
      record_type: recordType.trim(),
      record_id: recordId.trim(),
      content: parsedContent,
    });

    setContent("");
    setRecordId("");
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
            <FiPlus size={16} strokeWidth={2.2} />
          </div>
          <span className="text-sm font-medium text-zinc-200">
            Register Record
          </span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          {expanded ? "collapse" : "expand"}
        </span>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          {/* Identity fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <FiDatabase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                placeholder="Source system"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <div className="relative">
              <FiTag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                placeholder="Record type"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>

          <div className="relative">
            <FiHash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="Record ID"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="relative">
            <FiFileText size={14} className="absolute left-3 top-3 text-zinc-500" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record content (plain text or JSON)"
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent/50 transition-colors font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim() || loading}
              className="px-5 py-2 rounded-lg bg-accent text-zinc-950 text-sm font-medium hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <FiPlus size={14} strokeWidth={2.5} />
              )}
              Hash & Register
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
