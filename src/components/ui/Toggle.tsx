import clsx from "clsx";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  swatch?: string;
}

export function Toggle({ label, checked, onChange, swatch }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-2 w-full text-left group"
    >
      <span className="flex items-center gap-1.5 text-[11px] text-slate-300 group-hover:text-slate-100 transition-colors">
        {swatch && (
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: swatch }} />
        )}
        {label}
      </span>
      <span
        className={clsx(
          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-cyan-400/70" : "bg-slate-700",
        )}
      >
        <span
          className={clsx(
            "inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
