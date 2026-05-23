"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchGig, selectWinner } from "@/lib/api";
import type { GigRow, SubmissionRow } from "@/lib/api";
import { getAuthSession } from "@/lib/auth-session";
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function getAvatarColor(seed: string): string {
  const palette = ["#00A7B5", "#B7ACE8", "#002E5D", "#FDDA24"];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length] ?? "#00A7B5";
}

export function ReviewDashboard({ slug }: ReviewDashboardProps) {
  const [gig, setGig] = useState<GigRow | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const result = await fetchGig(slug);

      if (!mounted) return;

      if (!result) {
        setNotFound(true);
        setGig(null);
        setSubmissions([]);
        setSelected(null);
        setLoading(false);
        return;
      }

      setNotFound(false);
      setGig(result.gig);
      setSubmissions(result.submissions);
      setSelected(result.submissions[0] ?? null);

      const approved = result.submissions.find((sub) => sub.status === "approved");
      setWinnerId(approved?.id ?? null);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const displaySubmissions = useMemo(
    () =>
      submissions.map((sub) => {
        const submitterName = sub.worker_name?.trim() || "Anonymous";
        const submitterColor = getAvatarColor(sub.worker_user_id || sub.id);
        return {
          ...sub,
          submitterName,
          submitterInitials: getInitials(submitterName),
          submitterColor,
          submittedLabel: new Date(sub.submitted_at).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
          }),
        };
      }),
    [submissions]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <ClockIcon className="mx-auto mb-3 h-10 w-10 animate-pulse text-muted-foreground dark:text-stellar-gray/50" />
          <p className="text-[14px] font-semibold text-stellar-black dark:text-stellar-white">
            Loading bounty review...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !gig) {
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

  if (displaySubmissions.length === 0) {
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
    const session = getAuthSession();
    if (!session?.userId) {
      toast.error("Please sign in as sponsor to select a winner.");
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "signin" } }));
      return;
    }

    if (!gig) {
      toast.error("Bounty not loaded yet.");
      return;
    }

    setConfirming(true);

    const result = await selectWinner({
      submission_id: subId,
      gig_id: gig.id,
      approver_user_id: session.userId,
    });

    if ("error" in result) {
      setConfirming(false);
      toast.error(result.error);
      return;
    }

    setWinnerId(subId);
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === subId ? { ...sub, status: "approved", approved_at: new Date().toISOString() } : sub
      )
    );
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
            style={{ background: gig.bg ?? "#00A7B522", color: gig.color ?? "#00A7B5" }}
          >
            {gig.initials}
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-stellar-black dark:text-stellar-white leading-tight">
              Review: {gig.title}
            </h1>
            <p className="text-[12px] text-muted-foreground dark:text-stellar-gray/70">
              {displaySubmissions.length} submission{displaySubmissions.length !== 1 ? "s" : ""}{" "}
              · Posted by{" "}
              <span className="font-semibold text-stellar-black dark:text-stellar-white">
                {gig.org}
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr]">
        {/* ── Submissions list ───────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
            Submissions
          </p>
          {displaySubmissions.map((sub) => (
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
                    {sub.worker_user_id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-stellar-black/70 dark:text-stellar-white/70 line-clamp-2">
                {sub.description ?? "No description provided."}
              </p>
            </button>
          ))}
        </div>

        {/* ── Detail panel ───────────────────────────────────────────── */}
        {selected && (
          <Card className="relative overflow-hidden border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 p-5 backdrop-blur-md">
            {(() => {
              const selectedDisplay = displaySubmissions.find((sub) => sub.id === selected.id);
              if (!selectedDisplay) return null;

              return (
                <>
            {/* Submitter */}
            <div className="mb-4 flex items-center gap-3 border-b border-stellar-gray/15 dark:border-stellar-gray/10 pb-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: selectedDisplay.submitterColor + "22",
                  color: selectedDisplay.submitterColor,
                }}
              >
                {selectedDisplay.submitterInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-stellar-black dark:text-stellar-white">
                    {selectedDisplay.submitterName}
                  </span>
                  <CheckBadgeIcon className="h-4 w-4 text-stellar-teal" />
                </div>
                <span className="text-[11.5px] text-muted-foreground dark:text-stellar-gray/70 font-medium">
                  {selectedDisplay.worker_user_id.slice(0, 8)}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] text-muted-foreground dark:text-stellar-gray/60 font-medium">
                  Submitted
                </div>
                <div className="text-[11.5px] font-semibold text-stellar-black dark:text-stellar-white">
                  {selectedDisplay.submittedLabel}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Description
            </p>
            <p className="mb-4 text-[13px] leading-[1.7] text-stellar-black/85 dark:text-stellar-white/85">
              {selectedDisplay.description ?? "No description provided."}
            </p>

            {/* Work link */}
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Submission link
            </p>
            <a
              href={selectedDisplay.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center gap-2 rounded-lg border border-stellar-teal/20 bg-stellar-teal/5 px-3 py-2.5 text-[12.5px] font-semibold text-stellar-teal hover:bg-stellar-teal/10 transition-colors duration-200"
            >
              <LinkIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{selectedDisplay.submission_url}</span>
            </a>

            {/* Tx hash */}
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Payout tx
            </p>
            <div className="mb-5 rounded-lg bg-stellar-gray/8 dark:bg-stellar-gray/5 px-3 py-2">
              <code className="text-[10.5px] font-mono text-stellar-black/70 dark:text-stellar-white/70 truncate block">
                {selectedDisplay.payout_tx_hash
                  ? `${selectedDisplay.payout_tx_hash.slice(0, 16)}…${selectedDisplay.payout_tx_hash.slice(-16)}`
                  : "Not paid yet"}
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
                onClick={() => handleSelectWinner(selectedDisplay.id)}
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
                </>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
