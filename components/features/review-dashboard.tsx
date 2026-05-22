"use client";

import { useState } from "react";
import { BOUNTIES, SUBMISSIONS } from "@/lib/data";
import type { Submission } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeftIcon,
  LinkIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  TrophyIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

interface ReviewDashboardProps {
  slug: string;
}

export function ReviewDashboard({ slug }: ReviewDashboardProps) {
  const bounty = BOUNTIES.find((b) => b.slug === slug);
  const submissions = SUBMISSIONS.filter((s) => s.bountySlug === slug);

  const [selected, setSelected] = useState<Submission | null>(
    submissions[0] ?? null
  );
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!bounty) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-[14px] font-semibold text-stellar-black dark:text-stellar-white">
            Bounty not found.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-[12px] text-stellar-teal hover:underline font-medium"
          >
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <ClockIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground dark:text-stellar-gray/50" />
          <p className="text-[14px] font-semibold text-stellar-black dark:text-stellar-white">
            No submissions yet.
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground dark:text-stellar-gray/70">
            Check back after the deadline passes.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-[12px] text-stellar-teal hover:underline font-medium"
          >
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  async function handleSelectWinner(subId: string) {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1800));
    setWinnerId(subId);
    setConfirming(false);
    toast.success("Winner selected! Prize will be released from escrow.");
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground dark:text-stellar-gray/70 hover:text-stellar-black dark:hover:text-stellar-yellow transition-colors duration-200 font-medium"
        >
          <ArrowLeftIcon className="h-3 w-3" /> Back to listings
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[10px] font-bold shadow-xs"
            style={{ background: bounty.bg, color: bounty.color }}
          >
            {bounty.initials}
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-stellar-black dark:text-stellar-white leading-tight">
              Review: {bounty.title}
            </h1>
            <p className="text-[12px] text-muted-foreground dark:text-stellar-gray/70">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}{" "}
              · Posted by{" "}
              <span className="font-semibold text-stellar-black dark:text-stellar-white">
                {bounty.org}
              </span>
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-auto border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold h-5 px-2"
          >
            Under Review
          </Badge>
        </div>
      </div>

      {/* Mock-data notice */}
      <div className="mb-5 rounded-xl border border-stellar-lavender/30 bg-stellar-lavender/5 px-4 py-3 text-[11.5px] text-stellar-black/70 dark:text-stellar-white/70 leading-relaxed">
        🔮 <strong>Demo mode:</strong> This review dashboard is powered by mock
        data. A real backend and sponsor auth will be wired in a future release.
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr]">
        {/* ── Submissions list ───────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
            Submissions
          </p>
          {submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelected(sub)}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-all duration-200",
                selected?.id === sub.id
                  ? "border-stellar-yellow/50 bg-stellar-yellow/5 shadow-sm"
                  : "border-stellar-gray/15 dark:border-stellar-gray/10 hover:border-stellar-gray/25 dark:hover:border-stellar-gray/20 bg-card/40"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    background: sub.submitterColor + "22",
                    color: sub.submitterColor,
                  }}
                >
                  {sub.submitterInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-stellar-black dark:text-stellar-white truncate">
                      {sub.submitterName}
                    </span>
                    {winnerId === sub.id && (
                      <TrophyIcon className="h-3.5 w-3.5 text-stellar-yellow shrink-0" />
                    )}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground dark:text-stellar-gray/60 font-medium">
                    {sub.submitterHandle}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-stellar-black/70 dark:text-stellar-white/70 line-clamp-2">
                {sub.description}
              </p>
            </button>
          ))}
        </div>

        {/* ── Detail panel ───────────────────────────────────────────── */}
        {selected && (
          <Card className="relative overflow-hidden border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 p-5 backdrop-blur-md">
            {/* Submitter */}
            <div className="mb-4 flex items-center gap-3 border-b border-stellar-gray/15 dark:border-stellar-gray/10 pb-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: selected.submitterColor + "22",
                  color: selected.submitterColor,
                }}
              >
                {selected.submitterInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-stellar-black dark:text-stellar-white">
                    {selected.submitterName}
                  </span>
                  <CheckBadgeIcon className="h-4 w-4 text-stellar-teal" />
                </div>
                <span className="text-[11.5px] text-muted-foreground dark:text-stellar-gray/70 font-medium">
                  {selected.submitterHandle}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] text-muted-foreground dark:text-stellar-gray/60 font-medium">
                  Submitted
                </div>
                <div className="text-[11.5px] font-semibold text-stellar-black dark:text-stellar-white">
                  {new Date(selected.submittedAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Description
            </p>
            <p className="mb-4 text-[13px] leading-[1.7] text-stellar-black/85 dark:text-stellar-white/85">
              {selected.description}
            </p>

            {/* Work link */}
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Submission link
            </p>
            <a
              href={selected.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center gap-2 rounded-lg border border-stellar-teal/20 bg-stellar-teal/5 px-3 py-2.5 text-[12.5px] font-semibold text-stellar-teal hover:bg-stellar-teal/10 transition-colors duration-200"
            >
              <LinkIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{selected.submissionUrl}</span>
            </a>

            {/* Tx hash */}
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Entry fee tx
            </p>
            <div className="mb-5 rounded-lg bg-stellar-gray/8 dark:bg-stellar-gray/5 px-3 py-2">
              <code className="text-[10.5px] font-mono text-stellar-black/70 dark:text-stellar-white/70 truncate block">
                {selected.entryFeeTxHash.slice(0, 16)}…
                {selected.entryFeeTxHash.slice(-16)}
              </code>
            </div>

            {/* CTA */}
            {winnerId === selected.id ? (
              <div className="flex items-center gap-2 rounded-xl border border-stellar-yellow/40 bg-stellar-yellow/10 px-4 py-3">
                <TrophyIcon className="h-5 w-5 text-stellar-yellow shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-stellar-black dark:text-stellar-white">
                    Winner selected!
                  </p>
                  <p className="text-[11px] text-muted-foreground dark:text-stellar-gray/70">
                    Prize will be released from Soroban escrow.
                  </p>
                </div>
              </div>
            ) : winnerId !== null ? (
              <div className="flex items-center gap-2 rounded-xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-stellar-gray/5 px-4 py-3">
                <CheckCircleIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-[12px] text-muted-foreground dark:text-stellar-gray/70">
                  A winner has already been selected for this bounty.
                </p>
              </div>
            ) : (
              <Button
                onClick={() => handleSelectWinner(selected.id)}
                disabled={confirming}
                className="w-full bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
              >
                {confirming ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-stellar-black/30 border-t-stellar-black" />
                    Releasing escrow…
                  </span>
                ) : (
                  <>
                    <TrophyIcon className="mr-1.5 h-4 w-4" />
                    Select as winner
                  </>
                )}
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
