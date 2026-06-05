import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShieldAlert, Sparkles, X, Info } from "lucide-react";

export default function ToastContainer({ toasts, onCloseToast }) {
  // Separate top-center (celebrations) and bottom-right (notifications)
  const topCenterToasts = toasts.filter(t => t.position === "top-center");
  const bottomRightToasts = toasts.filter(t => t.position !== "top-center");

  return (
    <>
      {/* Top Center: Major Celebrations (e.g., Entering Top 3) */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center w-full max-w-lg px-4 pointer-events-none">
        <AnimatePresence>
          {topCenterToasts.map((toast) => (
            <TopCenterToast 
              key={toast.id} 
              toast={toast} 
              onClose={() => onCloseToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Right: Status updates */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 md:px-0 pointer-events-none">
        <AnimatePresence>
          {bottomRightToasts.map((toast) => (
            <BottomRightToast 
              key={toast.id} 
              toast={toast} 
              onClose={() => onCloseToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

// Celebration Toast (Top Center)
function TopCenterToast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="pointer-events-auto w-full bg-black/95 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-5 shadow-2xl shadow-yellow-500/10 flex items-center gap-4 relative overflow-hidden"
    >
      {/* Visual neon glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 animate-pulse-slow" />

      {/* Icon with glow background */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black flex-shrink-0 shadow-lg shadow-yellow-500/35 relative">
        <Award className="w-6 h-6 fill-black" />
        <span className="absolute -inset-1 rounded-full border border-yellow-400/30 animate-ping opacity-45" />
      </div>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-black tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 fill-yellow-400" /> New Top 3 Entrant!
        </div>
        <h4 className="text-white text-base md:text-lg font-black tracking-tight mt-0.5">
          {toast.message}
        </h4>
        {toast.submessage && (
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">
            {toast.submessage}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1 text-white/30 hover:text-white rounded-md hover:bg-white/5 transition-all self-start"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Info/Status Toast (Bottom Right)
function BottomRightToast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const isError = toast.type === "error";

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`pointer-events-auto w-full p-4 rounded-xl bg-black/95 backdrop-blur-xl border flex items-center gap-3 relative shadow-xl ${
        isError ? "border-rose-500/30" : "border-ecell/30"
      }`}
    >
      <div 
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isError ? "bg-rose-950/40 text-rose-400 border border-rose-800/30" : "bg-ecell/10 text-ecell border border-ecell/20"
        }`}
      >
        {isError ? <ShieldAlert className="w-4.5 h-4.5" /> : <Info className="w-4.5 h-4.5" />}
      </div>

      <div className="flex-grow">
        <h5 className="text-white text-sm font-bold truncate">
          {toast.title || (isError ? "Error Occurred" : "Notification")}
        </h5>
        <p className="text-white/40 text-xs mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="text-white/30 hover:text-white/60 transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
