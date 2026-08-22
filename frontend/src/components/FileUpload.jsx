import { useState, useRef } from "react";
import { FiUploadCloud, FiFileText, FiX, FiCheck, FiDatabase, FiTag } from "react-icons/fi";

export default function FileUpload({ onUpload, loading }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [sourceSystem, setSourceSystem] = useState("");
  const [recordType, setRecordType] = useState("");
  const inputRef = useRef(null);

  const accept = ".json,.csv,.txt,.log";

  const processFile = (f) => {
    setError(null);
    setParsed(null);
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let records = [];

        if (f.name.endsWith(".json")) {
          const json = JSON.parse(text);
          const arr = Array.isArray(json) ? json : json.entries ?? json.records ?? [json];
          records = arr.map((item, i) => ({
            record_id: item.record_id || item.id || "imported-" + (i + 1),
            content: item.content ?? item.data ?? item,
            metadata: item.metadata ?? null,
          }));
        } else {
          records = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line, i) => ({
              record_id: "line-" + (i + 1),
              content: line,
            }));
        }

        if (records.length === 0) {
          setError("File is empty or has no parseable records.");
          return;
        }

        setParsed(records);
      } catch {
        setError("Could not parse file. Use JSON or plain text.");
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleConfirm = () => {
    if (!parsed || !sourceSystem.trim() || !recordType.trim()) return;
    onUpload({
      source_system: sourceSystem.trim(),
      record_type: recordType.trim(),
      records: parsed,
    });
    setFile(null);
    setParsed(null);
    setSourceSystem("");
    setRecordType("");
  };

  const handleClear = () => {
    setFile(null);
    setParsed(null);
    setError(null);
    setSourceSystem("");
    setRecordType("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400">
            <FiUploadCloud size={16} />
          </div>
          <span className="text-sm font-medium text-zinc-200">
            Batch Import
          </span>
        </div>
        <span className="text-xs text-zinc-600 font-mono">.json .csv .txt</span>
      </div>

      <div className="px-5 pb-5">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 py-10 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? "border-accent/50 bg-accent/5"
                : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20"
            }`}
          >
            <FiUploadCloud size={24} className="text-zinc-500" />
            <p className="text-sm text-zinc-400">
              Drop a file here or <span className="text-accent">browse</span>
            </p>
            <p className="text-xs text-zinc-600">
              JSON array of records, CSV, or plain text
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <FiFileText size={16} className="text-zinc-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>

            {error && (
              <p className="text-xs text-tampered px-1">{error}</p>
            )}

            {parsed && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <FiDatabase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={sourceSystem}
                      onChange={(e) => setSourceSystem(e.target.value)}
                      placeholder="Source system *"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <FiTag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      placeholder="Record type *"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-500 px-1">
                  Parsed <span className="text-zinc-300 font-medium">{parsed.length}</span>{" "}
                  {parsed.length === 1 ? "record" : "records"} from file
                </p>

                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {parsed.slice(0, 3).map((rec, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono text-zinc-500 bg-zinc-950 rounded px-3 py-1.5 truncate"
                    >
                      {typeof rec.content === "string" ? rec.content : JSON.stringify(rec.content)}
                    </div>
                  ))}
                  {parsed.length > 3 && (
                    <p className="text-[10px] text-zinc-600 px-1">
                      +{parsed.length - 3} more
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={loading || !sourceSystem.trim() || !recordType.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-zinc-950 text-sm font-medium hover:bg-accent-dim disabled:opacity-40 transition-all"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    ) : (
                      <FiCheck size={14} strokeWidth={2.5} />
                    )}
                    Import {parsed.length} records
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) processFile(f);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}
