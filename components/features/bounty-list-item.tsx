import { Badge } from "@/components/ui/badge";
import type { Bounty } from "@/lib/data";
import { CheckBadgeIcon, ChatBubbleLeftIcon, StarIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface BountyListItemProps {
  bounty: Bounty;
}

export function BountyListItem({ bounty }: BountyListItemProps) {
  return (
    <Link
      href={`/opportunities/${bounty.slug}`}
      className="flex cursor-pointer items-center gap-3 -mx-2 rounded-xl border border-transparent py-3 px-3.5 hover:bg-white/50 hover:backdrop-blur-sm hover:border-zinc-200/30 hover:shadow-sm transition-all duration-200 decoration-transparent"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-[11px] font-semibold"
        style={{ background: bounty.bg, color: bounty.color }}
      >
        {bounty.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 truncate text-[13px] font-medium text-zinc-950">
          {bounty.title}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          <span>{bounty.org}</span>
          <CheckBadgeIcon className="w-3.5 h-3.5 text-[#00A7B5]" />
          <span className="text-zinc-300">|</span>
          <Badge
            variant="outline"
            className={`h-5 px-2 text-[10px] font-normal ${
              bounty.type === "bounty"
                ? "border-[#00A7B5]/20 bg-[#00A7B5]/5 text-[#00A7B5]"
                : "border-[#B7ACE8]/30 bg-[#B7ACE8]/5 text-[#B7ACE8]"
            }`}
          >
            {bounty.type.charAt(0).toUpperCase() + bounty.type.slice(1)}
          </Badge>
          <span className="text-zinc-300">|</span>
          <span>{bounty.due}</span>
          <span className="text-zinc-300">|</span>
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>{bounty.submissions}</span>
          </div>
          {bounty.featured && (
            <div className="flex items-center gap-0.5 ml-1 text-amber-500 text-[10px] font-bold">
              <StarIcon className="w-3.5 h-3.5" /> FEATURED
            </div>
          )}
          {bounty.live && (
            <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
        <span className="text-[13px] font-medium text-zinc-950">
          {bounty.prize.toLocaleString()}
        </span>
        <span className="text-[11px] text-zinc-400">PHP</span>
      </div>
    </Link>
  );
}
