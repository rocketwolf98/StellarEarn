"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Bounty } from "@/lib/data";
import { SUBMISSIONS } from "@/lib/data";
import {
  CheckBadgeIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SubmissionModal } from "@/components/features/submission-modal";
import { WinnersPodium } from "@/components/features/winners-podium";

interface BountyDetailProps {
  bounty: Bounty;
}

type CurrencyUnit = "PHP" | "USDC";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  under_review: {
    label: "Under Review",
    dot: "bg-amber-400 animate-pulse",
    badge:
      "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  },
  closed: {
    label: "Closed",
    dot: "bg-stellar-teal",
    badge:
      "border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal",
  },
  draft: {
    label: "Draft",
    dot: "bg-stellar-gray/60",
    badge:
      "border-stellar-gray/30 bg-stellar-gray/10 text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-500",
  },
};

export function BountyDetail({ bounty }: BountyDetailProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [unit, setUnit] = useState<CurrencyUnit>("PHP");

  const statusCfg = STATUS_CONFIG[bounty.status];
  const bountySubmissions = SUBMISSIONS.filter(
    (s) => s.bountySlug === bounty.slug
  );

  const displayPrize =
    unit === "PHP"
      ? `₱${bounty.prize.toLocaleString()}`
      : `$${bounty.prizeUsdc.toLocaleString()} USDC`;

  return (
    <>
      <SubmissionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bounty={bounty}
      />

      <div className="mx-auto max-w-5xl p-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mb-5 h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-stellar-black dark:text-stellar-gray/70 dark:hover:text-stellar-yellow inline-flex items-center gap-1.5 transition-colors duration-200"
          )}
        >
          <ArrowLeftIcon className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Browse opportunities
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
          {/* ── Main content ──────────────────────────────────────────── */}
          <div>
            {/* Org + status */}
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[9.5px] font-bold shadow-xs"
                style={{ background: bounty.bg, color: bounty.color }}
              >
                {bounty.initials}
              </div>
              <span className="text-[13px] font-semibold text-stellar-black/80 dark:text-stellar-white/80">
                {bounty.org}
              </span>
              <CheckBadgeIcon className="h-4 w-4 text-stellar-teal" />
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-2 text-[10px] font-semibold flex items-center gap-1",
                  statusCfg.badge
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)}
                />
                {statusCfg.label}
              </Badge>
            </div>

            <h1 className="mb-2.5 text-[24px] font-bold leading-[1.3] text-stellar-black dark:text-stellar-white tracking-tight">
              {bounty.title}
            </h1>

            <div className="mb-5 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground dark:text-stellar-gray/70">
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-2 text-[10px] font-semibold transition-colors duration-200",
                  bounty.type === "bounty"
                    ? "border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal"
                    : "border-stellar-lavender/30 bg-stellar-lavender/5 text-stellar-lavender"
                )}
              >
                {bounty.type.charAt(0).toUpperCase() + bounty.type.slice(1)}
              </Badge>
              <span className="text-stellar-black/20 dark:text-stellar-gray/20">·</span>
              <div className="flex items-center gap-1 font-medium text-stellar-black/70 dark:text-stellar-gray/70">
                <ClockIcon className="h-3.5 w-3.5 text-stellar-black/40 dark:text-stellar-gray/60" />
                <span>{bounty.due}</span>
              </div>
              <span className="text-stellar-black/20 dark:text-stellar-gray/20">·</span>
              <div className="flex items-center gap-1 font-medium text-stellar-black/70 dark:text-stellar-gray/70">
                <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-stellar-black/40 dark:text-stellar-gray/60" />
                <span>{bounty.submissions} submissions</span>
              </div>
            </div>

            {/* About */}
            <p className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
              About this bounty
            </p>
            <p className="mb-6 text-[13.5px] leading-[1.7] text-stellar-black/85 dark:text-stellar-white/85">
              {bounty.desc}
            </p>

            {/* Deliverables */}
            <p className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
              Deliverables
            </p>
            <ul className="m-0 list-none p-0 space-y-1">
              {bounty.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 border-b border-stellar-gray/15 dark:border-stellar-gray/5 py-2.5 text-[12.5px] leading-[1.6] text-stellar-black/80 dark:text-stellar-white/80 last:border-0 items-start hover:bg-stellar-gray/5 dark:hover:bg-stellar-gray/5 px-2 rounded-lg transition-colors duration-200"
                >
                  <ArrowRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-stellar-teal" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            {/* Submissions list (only when not draft) */}
            {bounty.status !== "draft" && bountySubmissions.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
                  Submissions ({bountySubmissions.length})
                </p>
                <ul className="space-y-2">
                  {bountySubmissions.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex items-center gap-3 rounded-xl border border-stellar-gray/15 dark:border-stellar-gray/10 bg-card/50 dark:bg-[#151515]/50 px-4 py-3 hover:border-stellar-gray/30 dark:hover:border-stellar-gray/20 transition-colors duration-200"
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                        style={{
                          background: sub.submitterColor + "22",
                          color: sub.submitterColor,
                        }}
                      >
                        {sub.submitterInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold text-stellar-black dark:text-stellar-white">
                            {sub.submitterName}
                          </span>
                          <span className="text-[11px] text-muted-foreground dark:text-stellar-gray/60 font-medium">
                            {sub.submitterHandle}
                          </span>
                        </div>
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-stellar-teal hover:underline font-medium truncate block max-w-xs"
                        >
                          {sub.submissionUrl}
                        </a>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 px-2 text-[10px] font-semibold shrink-0",
                          sub.status === "winner"
                            ? "border-stellar-yellow/40 bg-stellar-yellow/10 text-stellar-black dark:text-stellar-white"
                            : sub.status === "under_review"
                              ? "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400"
                              : "border-stellar-gray/20 bg-stellar-gray/10 text-muted-foreground"
                        )}
                      >
                        {sub.status === "winner"
                          ? "🏆 Winner"
                          : sub.status === "under_review"
                            ? "Under review"
                            : "Submitted"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Prize card */}
            <Card className="group relative overflow-hidden p-5 shadow-[0_4px_20px_rgba(15,15,15,0.02)] border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md">
              {/* Currency toggle */}
              <div className="relative z-10 mb-3 flex justify-end">
                <div className="inline-flex rounded-lg border border-stellar-gray/20 dark:border-stellar-gray/10 bg-stellar-gray/5 p-0.5 text-[10px]">
                  {(["PHP", "USDC"] as CurrencyUnit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      aria-pressed={unit === u}
                      className={cn(
                        "rounded-md px-2.5 py-1 font-bold transition-all duration-200",
                        unit === u
                          ? "bg-stellar-yellow text-stellar-black shadow-sm"
                          : "text-muted-foreground dark:text-stellar-gray/60 hover:text-stellar-black dark:hover:text-stellar-white"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-0 pb-1.5 text-center text-[30px] font-bold text-stellar-teal tracking-tight">
                {displayPrize}
              </div>
              <div className="relative z-10 mb-4 text-center text-[10.5px] font-medium tracking-wide text-stellar-navy/60 dark:text-stellar-lavender/60">
                Prize · locked in Soroban escrow
              </div>

              {[
                ["Entry fee", bounty.fee],
                ["Submissions", String(bounty.submissions)],
                ["Deadline", bounty.deadline],
                [
                  "Escrow status",
                  bounty.status === "closed" ? (
                    <span
                      key="paid"
                      className="flex items-center gap-1 text-stellar-teal font-semibold"
                    >
                      Paid out{" "}
                      <CheckCircleIcon className="h-3.5 w-3.5 text-stellar-teal" />
                    </span>
                  ) : (
                    <span
                      key="locked"
                      className="flex items-center gap-1 text-emerald-500 font-semibold"
                    >
                      Locked{" "}
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                    </span>
                  ),
                ],
              ].map(([l, v], idx, arr) => (
                <div
                  key={idx}
                  className={cn(
                    "relative z-10 flex justify-between items-center py-2 text-[12px]",
                    idx !== arr.length - 1 &&
                      "border-b border-stellar-gray/15 dark:border-stellar-gray/10"
                  )}
                >
                  <span className="text-muted-foreground dark:text-stellar-gray/70 font-medium">
                    {l as string}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      l !== "Escrow status" &&
                        "text-stellar-black dark:text-stellar-white"
                    )}
                  >
                    {v}
                  </span>
                </div>
              ))}

              {/* Status-aware CTA */}
              <div className="relative z-10 mt-4">
                {bounty.status === "open" && (
                  <>
                    <Button
                      onClick={() => setModalOpen(true)}
                      className="w-full bg-stellar-yellow text-[13px] font-bold text-stellar-black border border-stellar-yellow hover:bg-stellar-yellow/95 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 cursor-pointer py-5"
                    >
                      Submit your work
                    </Button>
                    <p className="mt-3 text-center text-[10px] leading-[1.5] text-stellar-black/50 dark:text-stellar-gray/60 font-medium">
                      Winners get their {bounty.fee} fee back plus the full
                      prize. Losing fees fund the platform.
                    </p>
                  </>
                )}

                {bounty.status === "under_review" && (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-center">
                    <ClockIcon className="h-6 w-6 text-amber-500" />
                    <div>
                      <p className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white">
                        Submissions closed
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground dark:text-stellar-gray/70">
                        The sponsor is reviewing all entries.
                      </p>
                    </div>
                  </div>
                )}

                {bounty.status === "closed" && (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-stellar-teal/20 bg-stellar-teal/5 p-4 text-center">
                    <LockClosedIcon className="h-5 w-5 text-stellar-teal" />
                    <p className="text-[11px] text-muted-foreground dark:text-stellar-gray/70">
                      This bounty has been completed and prizes distributed.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Winner card (only when closed) */}
            {bounty.status === "closed" && bounty.winner && (
              <Card className="relative overflow-hidden p-5 shadow-[0_4px_20px_rgba(15,15,15,0.02)] border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md">
                <WinnersPodium
                  winner={bounty.winner}
                  prizeToken={bounty.prizeToken}
                />
              </Card>
            )}

            {/* Posted by */}
            <Card className="group relative overflow-hidden p-5 shadow-[0_4px_20px_rgba(15,15,15,0.02)] border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md">
              <p className="relative z-10 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
                Posted by
              </p>
              <div className="relative z-10 flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[9.5px] font-bold shadow-xs"
                  style={{ background: bounty.bg, color: bounty.color }}
                >
                  {bounty.initials}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white">
                    {bounty.org}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stellar-black/50 dark:text-stellar-gray/60 font-medium">
                    Verified DAO{" "}
                    <CheckBadgeIcon className="h-3.5 w-3.5 text-stellar-teal" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Sponsor CTA */}
            <Link
              href="/sponsor/new"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full text-[12px] font-semibold border-stellar-gray/25 dark:border-stellar-gray/15 hover:border-stellar-yellow/50 hover:bg-stellar-yellow/5 hover:text-stellar-black dark:hover:text-stellar-yellow transition-all duration-200"
              )}
            >
              + Post a bounty like this
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
