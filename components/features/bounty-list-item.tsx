import { Badge } from "@/components/ui/badge";
import type { GigRow } from "@/lib/api";
import { deadlineDue } from "@/lib/api";
import { CheckBadgeIcon, ChatBubbleLeftIcon, StarIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface BountyListItemProps {
  gig: GigRow;
}

export function BountyListItem({ gig }: BountyListItemProps) {
  const due = deadlineDue(gig.deadline_at);
  const isLive = gig.live && gig.status === "open";

  return (
    <Link
      href={gig.type === "bounty" ? `/bounties/${gig.slug}` : `/projects/${gig.slug}`}
      className="group relative overflow-hidden flex cursor-pointer items-center gap-3 -mx-2 rounded-xl border border-transparent py-3 px-3.5 bg-transparent hover:bg-card/70 hover:backdrop-blur-md hover:border-border hover:shadow-[0_4px_12px_rgba(15,15,15,0.03)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:translate-y-[-1px] transition-all duration-200 decoration-transparent"
    >
      <div
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[11px] font-bold shadow-sm"
        style={{ background: gig.bg ?? "#00A7B51a", color: gig.color ?? "#00A7B5" }}
      >
        {gig.initials}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <div className="mb-0.5 truncate text-[13.5px] font-semibold text-stellar-black dark:text-stellar-white group-hover:text-stellar-navy dark:group-hover:text-stellar-yellow transition-colors duration-200">
          {gig.title}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground dark:text-stellar-gray/70">
          <span className="font-medium text-stellar-black/80 dark:text-stellar-white/80">{gig.org}</span>
          <CheckBadgeIcon className="w-3.5 h-3.5 text-stellar-teal" />
          <span className="text-stellar-black/20 dark:text-stellar-gray/30">|</span>
          <Badge
            variant="outline"
            className={`h-5 px-2 text-[10px] font-medium transition-colors duration-200 ${
              gig.type === "bounty"
                ? "border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal group-hover:bg-stellar-teal/10"
                : "border-stellar-lavender/30 bg-stellar-lavender/5 text-stellar-lavender group-hover:bg-stellar-lavender/10"
            }`}
          >
            {gig.type.charAt(0).toUpperCase() + gig.type.slice(1)}
          </Badge>
          <span className="text-stellar-black/20 dark:text-stellar-gray/30">|</span>
          <span className="font-medium text-stellar-black/60 dark:text-stellar-gray/70">{due}</span>
          <span className="text-stellar-black/20 dark:text-stellar-gray/30">|</span>
          <div className="flex items-center gap-1 font-medium text-stellar-black/60 dark:text-stellar-gray/70">
            <ChatBubbleLeftIcon className="w-3.5 h-3.5 text-stellar-black/30 dark:text-stellar-gray/50" />
            <span>{gig.submissions}</span>
          </div>
          {gig.featured && (
            <div className="flex items-center gap-0.5 ml-1 text-stellar-yellow text-[9px] font-bold tracking-wider">
              <StarIcon className="w-3.5 h-3.5 animate-pulse" /> FEATURED
            </div>
          )}
          {isLive && (
            <span className="relative ml-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 flex shrink-0 items-center gap-1 bg-stellar-gray/10 dark:bg-stellar-gray/5 px-2.5 py-1 rounded-lg border border-stellar-gray/20 dark:border-stellar-gray/10 transition-all duration-200 group-hover:bg-stellar-teal/5 group-hover:border-stellar-teal/20 group-hover:text-stellar-teal shadow-xs">
        <CurrencyDollarIcon className="w-3.5 h-3.5 text-stellar-teal group-hover:scale-110 transition-transform duration-200" />
        <span className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white group-hover:text-stellar-teal transition-colors duration-200">
          {gig.prize_php.toLocaleString()}
        </span>
        <span className="text-[10px] text-stellar-black/50 dark:text-stellar-gray/70 group-hover:text-stellar-teal/80 transition-colors duration-200 font-bold">PHP</span>
      </div>
    </Link>
  );
}
