import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActivityRowProps {
  name: string;
  handle: string;
  time: string;
  action: string;
  initials: string;
  color: string;
}

export function ActivityRow({ name, handle, time, action, initials, color }: ActivityRowProps) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-50 py-1.5">
      <Avatar className="h-8 w-8 rounded-md border-none text-[10px] font-semibold text-white" style={{ background: color }}>
        <AvatarFallback className="rounded-md bg-transparent text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[11px] font-medium text-zinc-950">
          {name} <span className="font-normal text-zinc-400">{handle}</span>
          <span className="text-zinc-400"> · {time}</span>
        </div>
        <div className="text-[11px] text-zinc-500">{action}</div>
      </div>
    </div>
  );
}
