import clsx from "clsx";

interface SegmentedControlProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-lg bg-black/25 p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 px-2 py-1 rounded-md text-[10.5px] font-medium transition-colors whitespace-nowrap",
            value === opt.value
              ? "bg-cyan-400/20 text-cyan-200 shadow-inner"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
