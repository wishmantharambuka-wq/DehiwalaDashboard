import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 flex items-center justify-center">
          <span className="absolute inset-0 rounded-lg bg-cyan-400/10 animate-pulse-slow" />
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-cyan-300 glow-text" fill="none">
            <path
              d="M3 20 L9 6 L12 13 L15 4 L21 20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="6" r="1.4" fill="currentColor" />
            <circle cx="15" cy="4" r="1.4" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-wide leading-none">
            DEHIWALA <span className="text-cyan-300 glow-text">SPATIAL INTELLIGENCE</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 tracking-wide">
            Grama Niladhari Division Analytics · Colombo District, Western Province
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
        </span>
        LIVE DATA
      </motion.div>
    </header>
  );
}
