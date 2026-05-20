"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { Bounty } from "@/lib/data";
import { CheckBadgeIcon, ChatBubbleLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BountyDetailProps {
  bounty: Bounty;
}

export function BountyDetail({ bounty }: BountyDetailProps) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "mb-5 h-auto p-0 text-xs text-zinc-500 hover:bg-transparent hover:text-zinc-950 inline-flex items-center gap-1.5"
        )}
      >
        <ArrowLeftIcon className="h-3 w-3" /> Browse opportunities
      </Link>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-[9px] font-semibold"
              style={{ background: bounty.bg, color: bounty.color }}
            >
              {bounty.initials}
            </div>
            <span className="text-[13px] text-zinc-500">{bounty.org}</span>
            <CheckBadgeIcon className="h-4 w-4 text-[#00A7B5]" />
          </div>
          <h1 className="mb-2.5 text-[22px] font-medium leading-[1.4] text-zinc-950">
            {bounty.title}
          </h1>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
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
            <span className="text-zinc-300">·</span>
            <span>{bounty.due}</span>
            <span className="text-zinc-300">·</span>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span>{bounty.submissions}</span>
            </div>
            {bounty.live && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />}
          </div>
          
          <p className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">About this bounty</p>
          <p className="mb-5 text-[13px] leading-[1.7] text-zinc-700">{bounty.desc}</p>
          
          <p className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Deliverables</p>
          <ul className="m-0 list-none p-0">
            {bounty.deliverables.map((d, i) => (
              <li key={i} className="flex gap-2 border-b border-zinc-100 py-1.5 text-[12px] leading-[1.5] text-zinc-700 last:border-0">
                <ArrowRightIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <Card className="mb-3 p-4 shadow-sm border-zinc-200/30">
            <div className="pt-2 pb-1 text-center text-[28px] font-semibold text-[#00A7B5]">
              ₱{bounty.prize.toLocaleString()}
            </div>
            <div className="mb-3.5 text-center text-[11px] text-zinc-400">
              Prize · locked in Soroban escrow
            </div>
            {[
              ["Submission fee", bounty.fee],
              ["Submissions", String(bounty.submissions)],
              ["Deadline", bounty.deadline],
              ["Escrow status", <div key="escrow" className="flex items-center gap-1">Locked <CheckCircleIcon className="h-3.5 w-3.5" /></div>],
            ].map(([l, v], idx, arr) => (
              <div key={l as string} className={`flex justify-between py-1.5 text-[12px] ${idx !== arr.length - 1 ? "border-b border-zinc-100" : ""}`}>
                <span className="text-zinc-500">{l}</span>
                <span className={`font-medium ${l === "Escrow status" ? "text-green-500" : "text-zinc-950"}`}>{v}</span>
              </div>
            ))}
            <Button
              className="mt-3 w-full bg-[#FDDA24] text-[13px] font-semibold text-[#0F0F0F] hover:bg-[#ebd020]"
              onClick={() => toast.success("Submission fee paid · Work submitted")}
            >
              Pay fee &amp; submit
            </Button>
            <p className="mt-2 text-center text-[11px] leading-[1.5] text-zinc-400">
              Winners get their {bounty.fee} fee back plus the full prize. Losing fees fund the platform.
            </p>
          </Card>
          
          <Card className="p-4 shadow-sm border-zinc-200/30">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Posted by</p>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-[9px] font-semibold"
                style={{ background: bounty.bg, color: bounty.color }}
              >
                {bounty.initials}
              </div>
              <div>
                <div className="text-[12px] font-medium text-zinc-950">{bounty.org}</div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">Verified DAO <CheckBadgeIcon className="h-3 w-3 text-[#00A7B5]" /></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
