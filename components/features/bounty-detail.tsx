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
          "mb-5 h-auto p-0 text-xs text-stellar-gray/90 hover:bg-transparent hover:text-stellar-black dark:text-stellar-gray/70 dark:hover:text-stellar-yellow inline-flex items-center gap-1.5 transition-colors duration-200"
        )}
      >
        <ArrowLeftIcon className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" /> Browse opportunities
      </Link>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[9.5px] font-bold shadow-xs"
              style={{ background: bounty.bg, color: bounty.color }}
            >
              {bounty.initials}
            </div>
            <span className="text-[13px] font-semibold text-stellar-black/80 dark:text-stellar-white/80">{bounty.org}</span>
            <CheckBadgeIcon className="h-4 w-4 text-stellar-teal" />
          </div>
          <h1 className="mb-2.5 text-[24px] font-bold leading-[1.3] text-stellar-black dark:text-stellar-white tracking-tight">
            {bounty.title}
          </h1>
          <div className="mb-5 flex flex-wrap items-center gap-2.5 text-xs text-stellar-gray/90 dark:text-stellar-gray/70">
            <Badge
              variant="outline"
              className={`h-5 px-2 text-[10px] font-semibold transition-colors duration-200 ${
                bounty.type === "bounty"
                  ? "border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal"
                  : "border-stellar-lavender/30 bg-stellar-lavender/5 text-stellar-lavender"
              }`}
            >
              {bounty.type.charAt(0).toUpperCase() + bounty.type.slice(1)}
            </Badge>
            <span className="text-stellar-gray/30 dark:text-stellar-gray/20">·</span>
            <span>{bounty.due}</span>
            <span className="text-stellar-gray/30 dark:text-stellar-gray/20">·</span>
            <div className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-stellar-gray/70 dark:text-stellar-gray/60" />
              <span>{bounty.submissions} submissions</span>
            </div>
            {bounty.live && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          
          <p className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">About this bounty</p>
          <p className="mb-6 text-[13.5px] leading-[1.7] text-stellar-black/85 dark:text-stellar-white/85">{bounty.desc}</p>
          
          <p className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">Deliverables</p>
          <ul className="m-0 list-none p-0 space-y-1">
            {bounty.deliverables.map((d, i) => (
              <li key={i} className="flex gap-2.5 border-b border-stellar-gray/15 dark:border-stellar-gray/5 py-2.5 text-[12.5px] leading-[1.6] text-stellar-black/80 dark:text-stellar-white/80 last:border-0 items-start hover:bg-stellar-gray/5 dark:hover:bg-stellar-gray/5 px-2 rounded-lg transition-colors duration-200">
                <ArrowRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-stellar-teal" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <Card className="group relative overflow-hidden mb-3 p-5 shadow-[0_4px_20px_rgba(15,15,15,0.02)] border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md">
            {/* Dot Texture Overlay */}
            <div className="absolute inset-0 bg-stellar-dots-light/5 dark:bg-stellar-dots-dark/10 pointer-events-none" />

            <div className="relative z-10 pt-2 pb-1.5 text-center text-[30px] font-bold text-stellar-teal tracking-tight">
              ₱{bounty.prize.toLocaleString()}
            </div>
            <div className="relative z-10 mb-4 text-center text-[10.5px] font-medium tracking-wide text-stellar-navy/60 dark:text-stellar-lavender/60">
              Prize · locked in Soroban escrow
            </div>
            {[
              ["Submission fee", bounty.fee],
              ["Submissions", String(bounty.submissions)],
              ["Deadline", bounty.deadline],
              ["Escrow status", <div key="escrow" className="flex items-center gap-1 text-emerald-500 font-semibold">Locked <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /></div>],
            ].map(([l, v], idx, arr) => (
              <div key={idx} className={`relative z-10 flex justify-between items-center py-2 text-[12px] ${idx !== arr.length - 1 ? "border-b border-stellar-gray/15 dark:border-stellar-gray/10" : ""}`}>
                <span className="text-stellar-gray/90 dark:text-stellar-gray/70 font-medium">{l as string}</span>
                <span className={`font-semibold ${l === "Escrow status" ? "" : "text-stellar-black dark:text-stellar-white"}`}>{v}</span>
              </div>
            ))}
            <Button
              className="relative z-10 mt-4 w-full bg-stellar-yellow text-[13px] font-bold text-stellar-black border border-stellar-yellow hover:bg-stellar-yellow/95 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 cursor-pointer py-5"
              onClick={() => toast.success("Submission fee paid · Work submitted")}
            >
              Pay fee &amp; submit
            </Button>
            <p className="relative z-10 mt-3 text-center text-[10px] leading-[1.5] text-stellar-gray/80 dark:text-stellar-gray/60 font-medium">
              Winners get their {bounty.fee} fee back plus the full prize. Losing fees fund the platform.
            </p>
          </Card>
          
          <Card className="group relative overflow-hidden p-5 shadow-[0_4px_20px_rgba(15,15,15,0.02)] border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md">
            <div className="absolute inset-0 bg-stellar-dots-light/5 dark:bg-stellar-dots-dark/10 pointer-events-none" />
            <p className="relative z-10 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">Posted by</p>
            <div className="relative z-10 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[9.5px] font-bold shadow-xs"
                style={{ background: bounty.bg, color: bounty.color }}
              >
                {bounty.initials}
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white">{bounty.org}</div>
                <div className="flex items-center gap-1 text-[11px] text-stellar-gray/80 dark:text-stellar-gray/60 font-medium">
                  Verified DAO <CheckBadgeIcon className="h-3.5 w-3.5 text-stellar-teal" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
