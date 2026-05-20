import { Badge } from "@/components/ui/badge";
import { Bounty } from "@/lib/data";

interface BountyListItemProps {
  bounty: Bounty;
  onClick: () => void;
}

export function BountyListItem({ bounty, onClick }: BountyListItemProps) {
  return (
    <div
      className="flex -mx-2 cursor-pointer items-center gap-3 rounded-md border-b border-zinc-100 p-3 hover:bg-zinc-50"
      onClick={onClick}
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
          <span className="text-[10px] text-[#6c47ff]">✓</span>
          <span className="text-zinc-300">|</span>
          <Badge
            variant="outline"
            className={`h-5 px-2 text-[10px] font-normal ${
              bounty.type === "bounty"
                ? "border-[#6c47ff]/20 bg-[#6c47ff]/5 text-[#6c47ff]"
                : "border-[#0ea5e9]/20 bg-[#0ea5e9]/5 text-[#0ea5e9]"
            }`}
          >
            {bounty.type.charAt(0).toUpperCase() + bounty.type.slice(1)}
          </Badge>
          <span className="text-zinc-300">|</span>
          <span>{bounty.due}</span>
          <span className="text-zinc-300">|</span>
          <span>💬 {bounty.submissions}</span>
          {bounty.featured && <span className="text-[10px] font-semibold text-amber-500">★ FEATURED</span>}
          {bounty.live && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-[13px] text-green-500">⊙</span>
        <span className="text-[13px] font-medium text-zinc-950">{bounty.prize.toLocaleString()}</span>
        <span className="ml-0.5 text-[11px] text-zinc-400">PHP</span>
      </div>
    </div>
  );
}
