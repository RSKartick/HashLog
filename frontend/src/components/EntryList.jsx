import { useState, useMemo } from "react";
import { FiInbox, FiSearch, FiFilter, FiArrowDown, FiArrowUp, FiDatabase } from "react-icons/fi";
import EntryCard from "./EntryCard.jsx";

export default function EntryList({ records, tamperedIds }) {
  const [search, setSearch] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"

  // Unique systems for filtering
  const systems = useMemo(() => {
    const set = new Set(records.map((r) => r.source_system).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [records]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSystem = selectedSystem === "all" || rec.source_system === selectedSystem;
        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q ||
          rec.record_id?.toLowerCase().includes(q) ||
          rec.source_system?.toLowerCase().includes(q) ||
          rec.record_type?.toLowerCase().includes(q) ||
          rec.entry_hash?.toLowerCase().includes(q) ||
          rec.content_hash?.toLowerCase().includes(q);
        return matchesSystem && matchesSearch;
      })
      .sort((a, b) => (sortOrder === "desc" ? b.id - a.id : a.id - b.id));
  }, [records, search, selectedSystem, sortOrder]);

  return (
    <section id="explorer" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            IMMUTABLE AUDIT LOG
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Ledger Proof Explorer
          </h2>
        </div>
        <span className="font-mono text-xs text-[#8a8480]">
          Showing {filteredRecords.length} of {records.length} records
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="instrument-card p-3 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5654] w-3.5 h-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by record ID, type, or SHA-256 hash..."
            className="w-full bg-[#080808] border border-[#1f1f1f] focus:border-[#c9793f] rounded-[4px] pl-9 pr-3 py-2 font-mono text-xs text-[#f0ece9] focus:outline-none transition-colors"
          />
        </div>

        {/* System Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <FiFilter className="w-3.5 h-3.5 text-[#5a5654] shrink-0 mr-1" />
          {systems.map((sys) => (
            <button
              key={sys}
              onClick={() => setSelectedSystem(sys)}
              className={`font-mono text-[10px] px-2.5 py-1 rounded-[3px] whitespace-nowrap transition-colors ${
                selectedSystem === sys
                  ? "bg-[#1f1f1f] text-[#f0ece9] border border-[#2e2e2e] font-medium"
                  : "text-[#8a8480] hover:text-[#f0ece9] hover:bg-[#111111]"
              }`}
            >
              {sys}
            </button>
          ))}

          {/* Sort button */}
          <button
            onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
            className="font-mono text-[10px] text-[#8a8480] hover:text-[#f0ece9] px-2.5 py-1 rounded-[3px] bg-[#111111] hover:bg-[#161616] border border-[#1f1f1f] flex items-center gap-1 ml-auto"
            title="Toggle sort order"
          >
            {sortOrder === "desc" ? <FiArrowDown className="w-3 h-3" /> : <FiArrowUp className="w-3 h-3" />}
            <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>
        </div>
      </div>

      {/* Record Cards */}
      {filteredRecords.length === 0 ? (
        <div className="instrument-card py-16 text-center">
          <FiInbox className="w-8 h-8 text-[#5a5654] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#f0ece9] font-normal mb-1">
            No Records Found
          </h3>
          <p className="font-mono text-xs text-[#8a8480]">
            {search || selectedSystem !== "all"
              ? "Try adjusting your filters or search query"
              : "Register your first external record proof above"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <EntryCard
              key={record.id}
              record={record}
              tampered={tamperedIds.has(record.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}


