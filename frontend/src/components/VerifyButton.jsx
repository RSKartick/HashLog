import { FiShield } from "react-icons/fi";

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
        Verify Full Ledger
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
            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center shrink-0 font-bold text-[10px]">
              !
            </div>
          )}
          <div>
            <p className="font-medium">{result.message}</p>
            <p className="text-xs opacity-60 mt-0.5 font-mono">
              {result.total_records} record{result.total_records !== 1 ? "s" : ""} in chain
              {!result.valid && result.tampered_at && (
                <> &middot; broken at #{result.tampered_at}</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
