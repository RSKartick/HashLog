import { FiShield, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function VerifyButton({ onClick, loading, result }) {
  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm font-medium text-zinc-200 hover:bg-zinc-800/60 hover:border-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        ) : (
          <FiShield
            size={16}
            className="text-zinc-500 group-hover:text-accent transition-colors"
          />
        )}
        Verify Chain Integrity
      </button>

      {result !== null && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
            result.valid
              ? "border-valid/20 bg-valid/5 text-valid"
              : "border-tampered/20 bg-tampered/5 text-tampered"
          }`}
        >
          {result.valid ? (
            <FiCheckCircle size={16} className="shrink-0" />
          ) : (
            <FiAlertTriangle size={16} className="shrink-0" />
          )}
          <div>
            <p className="font-medium">{result.message}</p>
            {!result.valid && result.tampered_at && (
              <p className="text-xs opacity-70 mt-0.5">
                Entry #{result.tampered_at}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
