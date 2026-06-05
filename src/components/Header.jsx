import React from "react";
import { Maximize2, Minimize2, RefreshCw, Trophy, ShieldAlert } from "lucide-react";

export default function Header({
  eventName,
  logoUrl,
  lastUpdated,
  isRefreshing,
  refreshProgress, // 0 to 100
  onOpenSettings,
  onManualRefresh,
  isFullscreen,
  onToggleFullscreen,
  error
}) {
  return (
    <header className="relative w-full bg-black/95 backdrop-blur-xl border-b border-white/8 py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 z-40">
      {/* Timer progress bar running along the bottom of the header */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-ecell transition-all duration-100 ease-linear"
        style={{ width: `${refreshProgress}%` }}
      />

      {/* Left section: Logo and Titles */}
      <div className="flex items-center gap-4 flex-1">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Event Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg border border-white/10 p-1 bg-black/40"
          />
        ) : (
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-ecell/30 flex items-center justify-center bg-black text-ecell">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 animate-pulse-slow" />
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-ecell bg-ecell/10 border border-ecell/20 px-2 py-0.5 rounded uppercase">
              🏆 Live Leaderboard
            </span>
            {error && (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded">
                <ShieldAlert className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-white mt-0.5 uppercase">
            {eventName || "E-Cell Championship"}
          </h1>
        </div>
      </div>

      {/* Right section: Info & Action Buttons */}
      <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-end">
        {/* Updated timestamp */}
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">
            Standings Status
          </p>
          <p className="text-xs md:text-sm font-semibold text-white/70 flex items-center gap-1.5 justify-end">
            <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-ping' : 'bg-ecell'}`} />
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
          </p>
        </div>

        {/* Buttons Group */}
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-lg border border-white/5">
          {/* Manual Refresh */}
          <button
            id="header-btn-refresh"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="p-2 text-white/40 hover:text-ecell hover:bg-ecell/5 rounded-md transition-all duration-200 disabled:opacity-50"
            title="Force Update"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-ecell" : ""}`} />
          </button>

          {/* Toggle Full Screen */}
          <button
            id="header-btn-fullscreen"
            onClick={onToggleFullscreen}
            className="p-2 text-white/40 hover:text-ecell hover:bg-ecell/5 rounded-md transition-all duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Presentation Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-ecell" /> : <Maximize2 className="w-5 h-5" />}
          </button>


        </div>
      </div>
    </header>
  );
}
