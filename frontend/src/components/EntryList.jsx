import { FiInbox } from "react-icons/fi";
import EntryCard from "./EntryCard";

export default function EntryList({ records, tamperedIds }) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <FiInbox size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
        <p className="text-sm">No records yet</p>
        <p className="text-xs text-zinc-600 mt-1">
          Register your first record above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...records].reverse().map((record, i) => (
        <EntryCard
          key={record.id}
          record={record}
          tampered={tamperedIds.has(record.id)}
          isLast={i === records.length - 1}
        />
      ))}
    </div>
  );
}
