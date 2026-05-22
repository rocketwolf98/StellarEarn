"use client";

import type { SubmissionRow } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface WinnersPodiumProps {
  winner: SubmissionRow;
  prizePhp: number;
  prizeUnit: string;
}

export function WinnersPodium({ winner, prizePhp, prizeUnit }: WinnersPodiumProps) {
  const [copied, setCopied] = useState(false);

  const txHash = winner.payout_tx_hash ?? "";
  const shortTx = txHash.length > 16
    ? `${txHash.slice(0, 8)}…${txHash.slice(-8)}`
    : txHash || "—";

  const walletDisplay = winner.worker_user_id
    ? `${winner.worker_user_id.slice(0, 6)}…${winner.worker_user_id.slice(-4)}`
    : "—";

  const winnerName = winner.worker_name ?? "Anonymous";
  const initials = winnerName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  function handleCopy(text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
        🏆 Winner
      </p>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border p-4",
          "border-stellar-yellow/40 bg-stellar-yellow/5 dark:bg-stellar-yellow/5"
        )}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_top_right,rgba(253,218,36,0.12),transparent_60%)]" />

        {/* Winner identity */}
        <div className="relative z-10 mb-3 flex items-center gap-2.5">
          <span className="text-2xl leading-none">🥇</span>
          <div>
            <div className="flex items-center gap-1.5">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "#00A7B533", color: "#00A7B5" }}
              >
                {initials}
              </div>
              <span className="text-[13px] font-bold text-stellar-black dark:text-stellar-white">
                {winnerName}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground dark:text-stellar-gray/70 font-medium">
              <span>{walletDisplay}</span>
            </div>
          </div>
        </div>

        {/* Prize */}
        <div className="relative z-10 mb-3 flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold leading-none text-stellar-teal">
            ₱{prizePhp.toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-stellar-teal/70">
            {prizeUnit}
          </span>
          <span className="ml-1 flex items-center gap-0.5 text-[10.5px] text-emerald-500 font-semibold">
            <CheckCircleIcon className="h-3.5 w-3.5" /> Paid out
          </span>
        </div>

        {/* Tx hash */}
        {txHash && (
          <div className="relative z-10 flex items-center gap-2 rounded-lg bg-stellar-black/5 dark:bg-stellar-white/5 px-2.5 py-1.5">
            <code className="flex-1 text-[10.5px] font-mono text-stellar-black/70 dark:text-stellar-white/70 truncate">
              {shortTx}
            </code>
            <button
              onClick={() => handleCopy(txHash)}
              aria-label="Copy transaction hash"
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-stellar-black dark:hover:text-stellar-white transition-colors duration-200"
            >
              {copied ? (
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <DocumentDuplicateIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Submission link */}
        {winner.submission_url && (
          <a
            href={winner.submission_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-2.5 block text-center text-[11px] font-semibold text-stellar-teal hover:underline"
          >
            View winning submission ↗
          </a>
        )}
      </div>
    </div>
  );
}
