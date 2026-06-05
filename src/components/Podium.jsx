import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, TrendingUp } from "lucide-react";

export default function Podium({ topThree, rankChanges = {} }) {
  // Build podium based on actual rank, not array index
  // This handles ties correctly — e.g. two rank-1 players both get gold
  const positionForRank = (rank) => {
    if (rank === 1) return "center";
    if (rank === 2) return "left";
    return "right";
  };

  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ player: topThree[1], index: 1, position: positionForRank(topThree[1].rank) });
  if (topThree[0]) podiumOrder.push({ player: topThree[0], index: 0, position: positionForRank(topThree[0].rank) });
  if (topThree[2]) podiumOrder.push({ player: topThree[2], index: 2, position: positionForRank(topThree[2].rank) });

  const podiumStyles = {
    center: {
      accentColor: "from-yellow-400 via-amber-400 to-yellow-500",
      glowClass: "animate-glow-gold",
      floatClass: "animate-float-gold",
      borderColor: "border-ecell/40",
      badgeColor: "bg-yellow-400 text-black",
      textGlow: "glow-text-gold",
      heightClass: "h-[340px] md:h-[420px] order-2 z-20",
      avatarSize: "w-20 h-20 md:w-28 md:h-28",
      avatarText: "text-2xl md:text-4xl",
      nameSize: "text-base md:text-xl",
      scoreSize: "text-2xl md:text-4xl",
      medal: "🥇",
      rankText: "1ST",
      showCrown: true
    },
    left: {
      accentColor: "from-slate-200 via-slate-300 to-slate-400",
      glowClass: "animate-glow-silver",
      floatClass: "animate-float-silver",
      borderColor: "border-ecell/25",
      badgeColor: "bg-slate-300 text-black",
      textGlow: "glow-text-silver",
      heightClass: "h-[260px] md:h-[310px] order-1 z-10",
      avatarSize: "w-14 h-14 md:w-20 md:h-20",
      avatarText: "text-lg md:text-2xl",
      nameSize: "text-sm md:text-base",
      scoreSize: "text-lg md:text-2xl",
      medal: "🥈",
      rankText: "2ND",
      showCrown: false
    },
    right: {
      accentColor: "from-orange-500 via-amber-600 to-orange-700",
      glowClass: "animate-glow-bronze",
      floatClass: "animate-float-bronze",
      borderColor: "border-ecell/20",
      badgeColor: "bg-orange-500 text-black",
      textGlow: "glow-text-bronze",
      heightClass: "h-[230px] md:h-[270px] order-3 z-10",
      avatarSize: "w-12 h-12 md:w-18 md:h-18",
      avatarText: "text-base md:text-xl",
      nameSize: "text-xs md:text-sm",
      scoreSize: "text-lg md:text-xl",
      medal: "🥉",
      rankText: "3RD",
      showCrown: false
    }
  };

  if (topThree.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-row items-end justify-center gap-2 md:gap-5">
      <AnimatePresence mode="popLayout">
        {podiumOrder.map(({ player, index, position }) => {
          const style = podiumStyles[position];
          const hasImproved = rankChanges[player.name] > 0;

          return (
            <motion.div
              key={`${player.name}-${player.department}`}
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
              <div className={`w-full h-full flex flex-col justify-between p-3 md:p-5 rounded-2xl bg-black/90 backdrop-blur-xl border ${style.borderColor} ${style.glowClass} ${style.floatClass} relative group`}>
                
                {/* Crown for 1st place */}
                {style.showCrown && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                    <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 fill-yellow-400/30 drop-shadow-lg" />
                  </div>
                )}

                {/* Top of Card: Medal and Image */}
                <div className="flex flex-col items-center mt-2 relative">
                  <div className="relative">
                    {/* Avatar Frame — size varies by rank */}
                    <div className={`${style.avatarSize} rounded-full p-1 bg-gradient-to-tr ${style.accentColor} shadow-md overflow-hidden relative`}>
                      {player.photoUrl ? (
                        <img 
                          src={player.photoUrl} 
                          alt={player.name} 
                          className="w-full h-full object-cover rounded-full bg-black"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full rounded-full bg-black/95 flex items-center justify-center font-bold ${style.avatarText} text-white/70`}
                        style={{ display: player.photoUrl ? 'none' : 'flex' }}
                      >
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 md:w-9 md:h-9 rounded-full ${style.badgeColor} flex items-center justify-center font-black text-sm md:text-lg border-2 border-black shadow-lg`}>
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
                <div className="text-center mt-3 flex-grow flex flex-col justify-center">
                  <h3 className={`${style.nameSize} font-bold tracking-tight text-white line-clamp-1 group-hover:text-ecell-light transition-colors`}>
                    {player.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-white/40 font-bold tracking-wide uppercase line-clamp-1 mt-0.5">
                    ID No: {player.department}
                  </p>
                </div>

                {/* Bottom of Card: Points Display */}
                <div className="text-center border-t border-white/5 pt-2 mt-2">
                  <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-white/30 block mb-0.5">
                    Score
                  </span>
                  <div className={`${style.scoreSize} font-black tracking-tighter ${style.textGlow} bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60`}>
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
