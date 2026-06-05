import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, ArrowUp, Flame, ShieldAlert, Award } from "lucide-react";

export default function TableList({
  participants,
  rankChanges = {},
  autoScrollEnabled = false,
  autoScrollSpeed = 2, // 1 to 5
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const scrollContainerRef = useRef(null);

  // Get unique departments for filter buttons
  const departments = ["ALL", ...new Set(participants.map(p => p.department))];

  const isSearchingOrFiltering = searchQuery.trim() !== "" || selectedDept !== "ALL";

  // Filter remaining participants (rank > 3) for the base view, but search across all when filtering/searching
  const listParticipants = participants.filter((p) => p.rank > 3);
  const sourceParticipants = isSearchingOrFiltering ? participants : listParticipants;

  // Apply search and department filters
  const filteredParticipants = sourceParticipants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "ALL" || p.department === selectedDept;
    return matchesSearch && matchesDept;
  });



  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 flex flex-col gap-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="table-input-search"
            type="text"
            placeholder="Search name or ID No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input text-sm"
          />
        </div>

        {/* Department Filters (Scrollable on small screens) */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 no-scrollbar justify-start md:justify-end">
          {departments.map((dept) => (
            <button
              id={`table-btn-dept-${dept.toLowerCase()}`}
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedDept === dept
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-500 shadow-lg shadow-violet-500/10"
                  : "bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="w-full glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 bg-slate-900/80 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <div className="col-span-2 md:col-span-1">Rank</div>
          <div className="col-span-5 md:col-span-6">Participant</div>
          <div className="col-span-3 md:col-span-3">ID No</div>
          <div className="col-span-2 md:col-span-2 text-right">Points</div>
        </div>

        {/* Table Rows (Scrollable Container) */}
        <div
          ref={scrollContainerRef}
          className="max-h-[400px] overflow-y-auto divide-y divide-white/5 no-scrollbar scroll-smooth"
        >
          {filteredParticipants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
              <Award className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-sm font-semibold uppercase tracking-wider">
                {listParticipants.length === 0 ? "No remaining standings yet" : "No results match filter"}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredParticipants.map((player) => {
                const rankDelta = rankChanges[player.name];
                const hasImproved = rankDelta > 0;
                
                return (
                  <motion.div
                    key={player.name}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors duration-500 ${
                      hasImproved 
                        ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent" 
                        : "hover:bg-white/5 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1 flex items-center gap-1.5">
                      <span className="font-extrabold text-sm md:text-base text-slate-300">
                        #{player.rank}
                      </span>
                      {hasImproved && (
                        <motion.div 
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-emerald-400 flex items-center"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </motion.div>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-900/80 flex-shrink-0 relative">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full bg-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-400"
                          style={{ display: player.photoUrl ? "none" : "flex" }}
                        >
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="font-bold text-white text-sm md:text-base tracking-tight truncate pr-2">
                        {player.name}
                      </div>
                    </div>

                    {/* ID No */}
                    <div className="col-span-3 md:col-span-3">
                      <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950/60 border border-white/5 text-slate-400 uppercase tracking-wider inline-block max-w-full truncate">
                        {player.department}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 md:col-span-2 text-right font-black text-sm md:text-lg text-violet-400 tracking-tighter">
                      {player.points.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats / Summary info */}
        <div className="px-6 py-3 border-t border-white/5 bg-slate-950/20 flex flex-row justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <div>Showing {filteredParticipants.length} of {isSearchingOrFiltering ? participants.length : listParticipants.length} standings</div>
        </div>
      </div>
    </div>
  );
}
