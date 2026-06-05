import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUp, Award } from "lucide-react";

export default function TableList({
  participants,
  rankChanges = {},
  autoScrollEnabled = false,
  autoScrollSpeed = 2, // 1 to 5
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef(null);

  const isSearching = searchQuery.trim() !== "";

  // Filter remaining participants (rank > 3) for the base view, but search across all when searching
  const listParticipants = participants.filter((p) => p.rank > 3);
  const sourceParticipants = isSearching ? participants : listParticipants;

  // Apply search filter
  const filteredParticipants = sourceParticipants.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) ||
           p.department.toLowerCase().includes(query);
  });



  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 flex flex-col gap-4">
      {/* Search Bar */}
      <div className="bg-black/80 backdrop-blur-xl border border-white/8 p-3 rounded-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            id="table-input-search"
            type="text"
            placeholder="Search by name or ID No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
          />
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="w-full bg-black/80 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-white/8 bg-black/90 text-[11px] font-black uppercase tracking-widest text-white/30">
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
            <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-2">
              <Award className="w-8 h-8 text-white/20 animate-pulse" />
              <p className="text-sm font-semibold uppercase tracking-wider">
                {listParticipants.length === 0 ? "No remaining standings yet" : "No results match search"}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredParticipants.map((player) => {
                const rankDelta = rankChanges[player.name];
                const hasImproved = rankDelta > 0;
                
                return (
                  <motion.div
                    key={`${player.name}-${player.department}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors duration-500 ${
                      hasImproved 
                        ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent" 
                        : "hover:bg-white/3 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1 flex items-center gap-1.5">
                      <span className="font-extrabold text-sm md:text-base text-white/70">
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
                      <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-black/80 flex-shrink-0 relative">
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
                          className="w-full h-full bg-black flex items-center justify-center text-[10px] font-bold text-white/40"
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
                      <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 border border-white/5 text-white/40 uppercase tracking-wider inline-block max-w-full truncate">
                        {player.department}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 md:col-span-2 text-right font-black text-sm md:text-lg text-ecell tracking-tighter">
                      {player.points.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats / Summary info */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/30 flex flex-row justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/30">
          <div>Showing {filteredParticipants.length} of {sourceParticipants.length} standings</div>
        </div>
      </div>
    </div>
  );
}
