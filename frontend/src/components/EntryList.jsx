import { FiInbox } from "react-icons/fi";
import EntryCard from "./EntryCard";

export default function EntryList({ entries, tamperedIds }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <FiInbox size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
        <p className="text-sm">No entries yet</p>
        <p className="text-xs text-zinc-600 mt-1">
          Append your first log entry above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...entries].reverse().map((entry, i) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          tampered={tamperedIds.has(entry.id)}
          isLast={i === entries.length - 1}
        />
      ))}
    </div>
  );
}
