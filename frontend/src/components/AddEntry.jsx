import { useState, useRef, useMemo } from "react";
import { FiPlus, FiUploadCloud, FiDatabase, FiTag, FiHash, FiFileText, FiCheck, FiX } from "react-icons/fi";

export default function AddEntry({ onSubmit, onBatchSubmit, loading }) {
  const [tab, setTab] = useState("single"); // "single" | "batch"
  
  // Single registration state
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordId, setRecordId] = useState("");
  const [content, setContent] = useState("");
  const [metadataJson, setMetadataJson] = useState("");

  // Batch import state
  const [file, setFile] = useState(null);
  const [batchRawContent, setBatchRawContent] = useState("");
  const [batchParsed, setBatchParsed] = useState(null);
  const [batchError, setBatchError] = useState(null);
  const [batchSource, setBatchSource] = useState("");
  const [batchType, setBatchType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const byteMetrics = useMemo(() => {
    const bytes = new TextEncoder().encode(content).length;
    return { bytes, chars: content.length };
  }, [content]);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim() || loading) return;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = content.trim();
    }

    let parsedMeta = null;
    if (metadataJson.trim()) {
      try {
        parsedMeta = JSON.parse(metadataJson);
      } catch {
        parsedMeta = { note: metadataJson.trim() };
      }
    }

    onSubmit({
      source_system: sourceSystem.trim(),
      record_type: recordType.trim(),
      record_id: recordId.trim(),
      content: parsedContent,
      metadata: parsedMeta,
    });

    setRecordId("");
    setContent("");
    setMetadataJson("");
  };

  const processBatchFile = (f) => {
    setBatchError(null);
    setBatchParsed(null);
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        setBatchRawContent(text);
        let records = [];

        if (f.name.endsWith(".json")) {
          const json = JSON.parse(text);
          const arr = Array.isArray(json) ? json : json.records ?? json.entries ?? [json];
          records = arr.map((item, i) => ({
            record_id: item.record_id || item.id || `rec-${i + 1}`,
            content: item.content ?? item.data ?? item,
            metadata: item.metadata ?? null,
          }));
        } else {
          records = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line, i) => ({
              record_id: `line-${i + 1}`,
              content: line,
            }));
        }

        if (records.length === 0) {
          setBatchError("File contains no parseable records.");
          return;
        }

        setBatchParsed(records);
      } catch {
        setBatchError("Failed to parse file. Please provide a JSON array or CSV.");
      }
    };
    reader.readAsText(f);
  };

  const handleBatchConfirm = () => {
    if (!batchParsed || !batchSource.trim() || !batchType.trim()) return;
    onBatchSubmit({
      source_system: batchSource.trim(),
      record_type: batchType.trim(),
      // The uploaded file is one external log artifact. Rows are preview-only;
      // hash the exact file content once instead of creating row proofs.
      records: [
        {
          record_id: file.name,
          content: batchRawContent,
          metadata: {
            filename: file.name,
            format: file.name.split(".").pop()?.toLowerCase() || "unknown",
            size_bytes: file.size,
            preview_rows: batchParsed.length,
          },
        },
      ],
    });
    setFile(null);
    setBatchRawContent("");
    setBatchParsed(null);
  };

  return (
    <section id="register" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            INGESTION & REGISTRATION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Register Integrity Proofs
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#242424] rounded-[4px] p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setTab("single")}
            className={`font-mono text-xs px-3.5 py-1.5 rounded-[3px] transition-colors ${
              tab === "single"
                ? "bg-[#1f1f1f] text-[#f0ece9] font-medium border border-[#2e2e2e]"
                : "text-[#8a8480] hover:text-[#f0ece9]"
            }`}
          >
            Single Stream
          </button>
          <button
            type="button"
            onClick={() => setTab("batch")}
            className={`font-mono text-xs px-3.5 py-1.5 rounded-[3px] transition-colors ${
              tab === "batch"
                ? "bg-[#1f1f1f] text-[#f0ece9] font-medium border border-[#2e2e2e]"
                : "text-[#8a8480] hover:text-[#f0ece9]"
            }`}
          >
            Batch Ingest
          </button>
        </div>
      </div>

      {tab === "single" ? (
        <div className="instrument-card p-6 sm:p-8">
          <form onSubmit={handleSingleSubmit} className="space-y-5">
            {/* Identity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                  Source System Identity *
                </label>
                <div className="relative">
                  <FiDatabase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5654] w-3.5 h-3.5" />
                  <input
                    type="text"
                    required
                    value={sourceSystem}
                    onChange={(e) => setSourceSystem(e.target.value)}
                    placeholder="e.g. postgres-orders"
                    className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] pl-9 pr-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                  Record Schema Class *
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5654] w-3.5 h-3.5" />
                  <input
                    type="text"
                    required
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    placeholder="e.g. customer_order"
                    className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] pl-9 pr-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                  External Record ID *
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5654] w-3.5 h-3.5" />
                  <input
                    type="text"
                    required
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    placeholder="e.g. ORD-2026-904"
                    className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] pl-9 pr-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Record Content Payload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] text-[#8a8480] uppercase">
                  External Payload (Hashed in-memory; 0 bytes plaintext saved) *
                </label>
                <span className="font-mono text-[9px] text-[#5a5654]">
                  {byteMetrics.bytes} bytes · {byteMetrics.chars} chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='{"order_id": "ORD-2026-904", "customer": "Starlight Corp", "total_usd": 8500.0, "status": "CONFIRMED"}'
                className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] p-3 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Optional Metadata */}
            <div>
              <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                Optional Metadata Annotations (JSON key-value)
              </label>
              <input
                type="text"
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                placeholder='{"migrated_from": "legacy_oracle", "environment": "production"}'
                className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !sourceSystem.trim() || !recordType.trim() || !recordId.trim() || !content.trim()}
                className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-[#f0ece9] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 rounded-[4px] transition-all shadow-[0_0_20px_rgba(201,121,63,0.25)]"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
                <span>Anchor Proof to Ledger</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Batch Ingestion Tab */
        <div className="instrument-card p-6 sm:p-8">
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) processBatchFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 py-12 rounded-[4px] border-2 border-dashed cursor-pointer transition-all ${
                dragOver
                  ? "border-[#c9793f] bg-[#c9793f]/5"
                  : "border-[#242424] hover:border-[#383838] hover:bg-[#111111]"
              }`}
            >
              <div className="w-12 h-12 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#c9793f]">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <p className="font-mono text-xs text-[#f0ece9]">
                Drop batch dataset here or <span className="text-[#c9793f] underline">browse files</span>
              </p>
              <p className="font-mono text-[10px] text-[#8a8480]">
                Supports JSON arrays (.json), CSV logs, or raw event streams
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#050505] border border-[#1f1f1f] rounded-[4px]">
                <div className="flex items-center gap-3">
                  <FiFileText className="w-4 h-4 text-[#c9793f]" />
                  <div>
                    <div className="font-mono text-xs text-[#f0ece9]">{file.name}</div>
                    <div className="font-mono text-[10px] text-[#8a8480]">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setBatchRawContent("");
                    setBatchParsed(null);
                  }}
                  className="p-1 rounded bg-[#161616] text-[#8a8480] hover:text-[#f0ece9]"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {batchError && <p className="text-xs text-red-400 font-mono">{batchError}</p>}

              {batchParsed && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                        Source System Batch ID *
                      </label>
                      <input
                        type="text"
                        value={batchSource}
                        onChange={(e) => setBatchSource(e.target.value)}
                        className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5">
                        Record Class *
                      </label>
                      <input
                        type="text"
                        value={batchType}
                        onChange={(e) => setBatchType(e.target.value)}
                        className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-[#1f1f1f] rounded-[4px] p-3">
                    <span className="font-mono text-[10px] text-[#8a8480] uppercase block mb-2">
                      Previewed {batchParsed.length} rows. The complete file will be stored as one proof:
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[10px] text-[#b8b2ae]">
                      {batchParsed.slice(0, 4).map((rec, i) => (
                        <div key={i} className="p-1.5 bg-[#111111] rounded truncate">
                          #{i + 1} [{rec.record_id}]: {typeof rec.content === "string" ? rec.content : JSON.stringify(rec.content)}
                        </div>
                      ))}
                      {batchParsed.length > 4 && (
                        <div className="text-[9px] text-[#5a5654] pt-1">
                          +{batchParsed.length - 4} additional records in batch...
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleBatchConfirm}
                    disabled={loading || !batchSource.trim() || !batchType.trim()}
                    className="w-full flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-[#f0ece9] hover:bg-white py-3.5 rounded-[4px] transition-colors"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheck className="w-4 h-4" />
                    )}
                    <span>Commit File Proof (1)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,.txt,.log"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) processBatchFile(f);
            }}
            className="hidden"
          />
        </div>
      )}
    </section>
  );
}


