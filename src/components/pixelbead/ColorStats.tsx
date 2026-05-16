import type { ColorStat } from "../../lib/pixelbead/types";

interface ColorStatsProps {
  stats: ColorStat[];
}

export function ColorStats({ stats }: ColorStatsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.color.hex} className="flex items-center gap-3 border border-zinc-200 bg-white px-3 py-2">
          <span
            className="h-6 w-6 shrink-0 border border-zinc-300"
            style={{ backgroundColor: stat.color.hex }}
            aria-label={stat.color.hex}
          />
          <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{stat.color.hex}</span>
          <span className="text-sm tabular-nums text-zinc-600">{stat.count}</span>
        </div>
      ))}
    </div>
  );
}
