import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

interface EarnerRowProps {
  name: string;
  task: string;
  prize: string;
  token: string;
  initials: string;
  color: string;
}

export function EarnerRow({ name, task, prize, token, initials, color }: EarnerRowProps) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-50 py-1.5">
      <Avatar className="h-7 w-7 border-none text-[10px] font-semibold text-white" style={{ background: color }}>
        <AvatarFallback className="bg-transparent text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[12px] font-medium text-zinc-950">{name}</div>
        <div className="truncate text-[10px] text-zinc-400">{task}</div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <CurrencyDollarIcon className="w-3.5 h-3.5 text-green-500" />
        <span className="text-[12px] font-semibold text-zinc-950">{prize}</span>
        <span className="text-[10px] text-zinc-400">{token}</span>
      </div>
    </div>
  );
}
