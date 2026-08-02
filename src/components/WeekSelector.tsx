import Link from "next/link";
import type { Week } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  weeks: Week[];
  currentWeekNumber: number;
  basePath?: string;
};

export function WeekSelector({
  weeks,
  currentWeekNumber,
  basePath = "/week",
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {weeks.map((week) => {
        const isActive = week.week_number === currentWeekNumber;
        return (
          <Link
            key={week.id}
            href={
              basePath === "/"
                ? week.week_number === currentWeekNumber
                  ? "/"
                  : `/week/${week.week_number}`
                : `${basePath}/${week.week_number}`
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-nfl-green)] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {week.label}
          </Link>
        );
      })}
    </div>
  );
}
