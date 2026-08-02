import type { UserStanding } from "@/lib/types";
import { formatPct } from "@/lib/utils";

type Props = {
  standings: UserStanding[];
  highlightUserId?: string;
};

export function StandingsTable({ standings, highlightUserId }: Props) {
  if (standings.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8">No standings yet.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 w-10">#</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">P</th>
            <th className="px-4 py-3 text-right">Win %</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => {
            const isHighlighted = row.user_id === highlightUserId;
            return (
              <tr
                key={row.user_id}
                className={
                  isHighlighted
                    ? "bg-blue-50 font-medium"
                    : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/50"
                }
              >
                <td className="px-4 py-3 text-slate-400 tabular-nums">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-slate-900">{row.display_name}</td>
                <td className="px-4 py-3 text-center tabular-nums text-emerald-600 font-semibold">
                  {row.wins}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-red-600 font-semibold">
                  {row.losses}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-slate-500 hidden sm:table-cell">
                  {row.pushes}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">
                  {formatPct(row.win_pct)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
