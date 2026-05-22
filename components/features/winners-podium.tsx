"use client";

import type { Winner } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface WinnersPodiumProps {
  winner: Winner;
  prizeToken: string;
}

export function WinnersPodium({ winner, prizeToken }: WinnersPodiumProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortWallet = `${winner.walletAddress.slice(0, 6)}…${winner.walletAddress.slice(-4)}`;
  const shortTx = `${winner.txHash.slice(0, 8)}…${winner.txHash.slice(-8)}`;

  return (
    <div className="space-y-3">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-stellar-navy dark:text-stellar-lavender">
        🏆 Winner
      </p>

      {/* Winner card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border p-4",
          "border-stellar-yellow/40 bg-stellar-yellow/5 dark:bg-stellar-yellow/5"
        )}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_top_right,rgba(253,218,36,0.12),transparent_60%)]" />

        {/* Position badge */}
        <div className="relative z-10 mb-3 flex items-center gap-2.5">
          <span className="text-2xl leading-none">🥇</span>
          <div>
            <div className="flex items-center gap-1.5">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: winner.color + "33", color: winner.color }}
              >
                {winner.initials}
              </div>
              <span className="text-[13px] font-bold text-stellar-black dark:text-stellar-white">
                {winner.name}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground dark:text-stellar-gray/70 font-medium">
              <span>{shortWallet}</span>
            </div>
          </div>
        </div>

        {/* Prize */}
        <div className="relative z-10 mb-3 flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold leading-none text-stellar-teal">
            ₱{winner.prizeAmount.toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-stellar-teal/70">
            {prizeToken}
          </span>
          <span className="ml-1 flex items-center gap-0.5 text-[10.5px] text-emerald-500 font-semibold">
            <CheckCircleIcon className="h-3.5 w-3.5" /> Paid out
          </span>
        </div>

        {/* Tx hash */}
        <div className="relative z-10 flex items-center gap-2 rounded-lg bg-stellar-black/5 dark:bg-stellar-white/5 px-2.5 py-1.5">
          <code className="flex-1 text-[10.5px] font-mono text-stellar-black/70 dark:text-stellar-white/70 truncate">
            {shortTx}
          </code>
          <button
            onClick={() => handleCopy(winner.txHash)}
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

        {/* Submission link */}
        <a
          href={winner.submissionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-2.5 block text-center text-[11px] font-semibold text-stellar-teal hover:underline"
        >
          View winning submission ↗
        </a>
      </div>
    </div>
  );
}
