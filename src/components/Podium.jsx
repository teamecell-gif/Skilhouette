import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Crown, TrendingUp } from "lucide-react";

export default function Podium({ topThree, rankChanges = {} }) {
  // Map index to podium positions: Index 0 (1st) -> Center, Index 1 (2nd) -> Left, Index 2 (3rd) -> Right
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ player: topThree[1], index: 1, position: "left" }); // 2nd Place
  if (topThree[0]) podiumOrder.push({ player: topThree[0], index: 0, position: "center" }); // 1st Place
  if (topThree[2]) podiumOrder.push({ player: topThree[2], index: 2, position: "right" }); // 3rd Place

  const podiumStyles = {
    center: {
      accentColor: "from-yellow-400 via-amber-400 to-yellow-500",
      glowClass: "animate-glow-gold shadow-yellow-500/20",
      floatClass: "animate-float-gold",
      borderColor: "border-yellow-400/40",
      badgeColor: "bg-yellow-400 text-slate-950",
      textGlow: "glow-text-gold",
      heightClass: "h-[320px] md:h-[380px] order-2 z-20",
      medal: "🥇",
      rankText: "1ST"
    },
    left: {
      accentColor: "from-slate-200 via-slate-300 to-slate-400",
      glowClass: "animate-glow-silver shadow-slate-400/10",
      floatClass: "animate-float-silver",
      borderColor: "border-slate-300/30",
      badgeColor: "bg-slate-300 text-slate-950",
      textGlow: "glow-text-silver",
      heightClass: "h-[280px] md:h-[320px] order-1 z-10",
      medal: "🥈",
      rankText: "2ND"
    },
    right: {
      accentColor: "from-orange-500 via-amber-600 to-orange-700",
      glowClass: "animate-glow-bronze shadow-orange-600/10",
      floatClass: "animate-float-bronze",
      borderColor: "border-orange-500/30",
      badgeColor: "bg-orange-500 text-slate-950",
      textGlow: "glow-text-bronze",
      heightClass: "h-[260px] md:h-[290px] order-3 z-10",
      medal: "🥉",
      rankText: "3RD"
    }
  };

  if (topThree.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-row items-end justify-center gap-2 md:gap-6">
      <AnimatePresence mode="popLayout">
        {podiumOrder.map(({ player, index, position }) => {
          const style = podiumStyles[position];
          const hasImproved = rankChanges[player.name] > 0;
          const displayRank = index + 1;

          return (
            <motion.div
              key={player.name}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 20,
                layout: { type: "spring", stiffness: 100, damping: 18 }
              }}
              className={`flex-1 flex flex-col justify-end ${style.heightClass}`}
            >
              {/* Floating Container */}
              <div className={`w-full h-full flex flex-col justify-between p-4 md:p-6 rounded-2xl glass-panel border ${style.borderColor} ${style.glowClass} ${style.floatClass} relative group`}>
                


                {/* Top of Card: Medal and Image */}
                <div className="flex flex-col items-center mt-2 relative">
                  <div className="relative">
                    {/* Avatar Frame */}
                    <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr ${style.accentColor} shadow-md overflow-hidden relative`}>
                      {player.photoUrl ? (
                        <img 
                          src={player.photoUrl} 
                          alt={player.name} 
                          className="w-full h-full object-cover rounded-full bg-slate-900"
                          onError={(e) => {
                            // Fallback to letters avatar
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full rounded-full bg-slate-900/95 flex items-center justify-center font-bold text-xl md:text-3xl text-slate-300"
                        style={{ display: player.photoUrl ? 'none' : 'flex' }}
                      >
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 md:w-9 md:h-9 rounded-full ${style.badgeColor} flex items-center justify-center font-black text-sm md:text-lg border-2 border-slate-950 shadow-lg`}>
                      {style.medal}
                    </div>
                  </div>

                  {/* Rank Improvement Indicator */}
                  {hasImproved && (
                    <div className="absolute -top-2 -right-4 bg-emerald-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-md shadow-emerald-500/20 border border-emerald-400/30 animate-pulse">
                      <TrendingUp className="w-3.5 h-3.5" /> UP
                    </div>
                  )}
                </div>

                {/* Middle of Card: Participant Info */}
                <div className="text-center mt-4 flex-grow flex flex-col justify-center">
                  <h3 className="text-sm md:text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-yellow-100 transition-colors">
                    {player.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wide uppercase line-clamp-1 mt-0.5">
                    ID No: {player.department}
                  </p>
                </div>

                {/* Bottom of Card: Points Display */}
                <div className="text-center border-t border-white/5 pt-3 mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-0.5">
                    Score
                  </span>
                  <div className={`text-xl md:text-3xl font-black tracking-tighter ${style.textGlow} bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300`}>
                    {player.points.toLocaleString()}
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
