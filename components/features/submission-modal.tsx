"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Bounty } from "@/lib/data";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface SubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bounty: Bounty;
}

type Step = 1 | 2 | 3;

const STEPS = [
  { label: "Your Work" },
  { label: "Pay Fee" },
  { label: "Confirmed" },
];

const MOCK_TX_HASH =
  "c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9c4d5e6f7a8b9c4d5";

export function SubmissionModal({
  open,
  onOpenChange,
  bounty,
}: SubmissionModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [description, setDescription] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [signing, setSigning] = useState(false);
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep(1);
    setSubmissionUrl("");
    setDescription("");
    setTwitterUrl("");
    setSigning(false);
    setCopied(false);
  }

  function handleClose(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function handleStep1Submit() {
    if (!submissionUrl.trim()) {
      toast.error("Please add a link to your work.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a short description.");
      return;
    }
    setStep(2);
  }

  async function handlePayAndSubmit() {
    setSigning(true);
    // Simulate Freighter signing delay
    await new Promise((r) => setTimeout(r, 2200));
    setSigning(false);
    setStep(3);
  }

  function handleCopy() {
    void navigator.clipboard.writeText(MOCK_TX_HASH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const truncatedHash = `${MOCK_TX_HASH.slice(0, 8)}…${MOCK_TX_HASH.slice(-8)}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md gap-0 overflow-hidden border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white dark:bg-[#111] p-0 shadow-2xl">
        {/* Step indicator */}
        <div className="flex items-center gap-0 border-b border-stellar-gray/15 dark:border-stellar-gray/10">
          {STEPS.map((s, i) => {
            const n = (i + 1) as Step;
            const active = step === n;
            const done = step > n;
            return (
              <div
                key={s.label}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-3 text-[11px] font-semibold tracking-wide transition-colors duration-200",
                  active
                    ? "border-b-2 border-stellar-yellow text-stellar-black dark:text-stellar-white"
                    : done
                      ? "text-stellar-teal"
                      : "text-muted-foreground dark:text-stellar-gray/50"
                )}
              >
                {done ? (
                  <CheckCircleIconSolid className="h-3.5 w-3.5 text-stellar-teal" />
                ) : (
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                      active
                        ? "bg-stellar-yellow text-stellar-black"
                        : "bg-stellar-gray/20 dark:bg-stellar-gray/10 text-muted-foreground"
                    )}
                  >
                    {n}
                  </span>
                )}
                {s.label}
              </div>
            );
          })}
        </div>

        <div className="p-6">
          {/* ── Step 1: Work Details ─────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-stellar-black dark:text-stellar-white leading-snug">
                  Submit your work
                </DialogTitle>
                <p className="text-[12px] text-muted-foreground dark:text-stellar-gray/70 leading-relaxed">
                  Share your submission for{" "}
                  <span className="font-semibold text-stellar-black dark:text-stellar-white">
                    {bounty.title}
                  </span>
                </p>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="submission-url"
                    className="block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
                  >
                    Work URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground dark:text-stellar-gray/50" />
                    <Input
                      id="submission-url"
                      placeholder="github.com/you/project or figma.com/file/…"
                      value={submissionUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmissionUrl(e.target.value)}
                      className="pl-8 text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40 focus-visible:border-stellar-teal/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
                  >
                    Brief description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="What did you build? What makes it stand out?"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="resize-none text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40 focus-visible:border-stellar-teal/60"
                  />
                  <p className="text-right text-[10px] text-muted-foreground dark:text-stellar-gray/50">
                    {description.length}/500
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="twitter-url"
                    className="block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
                  >
                    Tweet URL{" "}
                    <span className="font-normal normal-case text-muted-foreground dark:text-stellar-gray/50">
                      (optional — recommended)
                    </span>
                  </label>
                  <Input
                    id="twitter-url"
                    placeholder="x.com/you/status/…"
                    value={twitterUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwitterUrl(e.target.value)}
                    className="text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40 focus-visible:border-stellar-teal/60"
                  />
                </div>
              </div>

              <Button
                onClick={handleStep1Submit}
                className="w-full bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
              >
                Continue <ArrowRightIcon className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Pay Fee ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-stellar-black dark:text-stellar-white leading-snug">
                  Pay entry fee
                </DialogTitle>
                <p className="text-[12px] text-muted-foreground dark:text-stellar-gray/70 leading-relaxed">
                  A {bounty.fee} entry fee is required. Winners get it back plus
                  the full prize.
                </p>
              </DialogHeader>

              {/* Fee breakdown */}
              <div className="rounded-xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-stellar-gray/5 dark:bg-stellar-gray/5 p-4 space-y-2.5">
                {[
                  ["Entry fee", bounty.fee],
                  ["Prize pool (escrow)", `₱${bounty.prize.toLocaleString()}`],
                  ["Network fee (est.)", "~0.00001 XLM"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between text-[12.5px]"
                  >
                    <span className="text-muted-foreground dark:text-stellar-gray/70 font-medium">
                      {label}
                    </span>
                    <span className="font-bold text-stellar-black dark:text-stellar-white">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-stellar-gray/20 dark:border-stellar-gray/10 pt-2.5 flex justify-between text-[12.5px]">
                  <span className="font-bold text-stellar-black dark:text-stellar-white">
                    You pay today
                  </span>
                  <span className="font-bold text-stellar-teal">{bounty.fee}</span>
                </div>
              </div>

              <div className="rounded-xl border border-stellar-yellow/30 bg-stellar-yellow/5 p-3 text-[11.5px] text-stellar-black/70 dark:text-stellar-white/70 leading-relaxed">
                🔒 Your fee is held in escrow. If you win, it&apos;s returned with your
                prize. If not, it funds platform operations.
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={signing}
                  className="flex-1 border-stellar-gray/25 dark:border-stellar-gray/15 font-semibold text-[13px]"
                >
                  <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handlePayAndSubmit}
                  disabled={signing}
                  className="flex-[2] bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
                >
                  {signing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-stellar-black/30 border-t-stellar-black" />
                      Signing…
                    </span>
                  ) : (
                    <>
                      Sign &amp; submit{" "}
                      <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirmation ─────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 text-center">
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                  <SparklesIcon className="absolute -top-1 -right-1 h-5 w-5 text-stellar-yellow animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-stellar-black dark:text-stellar-white">
                    Submission confirmed!
                  </h3>
                  <p className="mt-1 text-[12px] text-muted-foreground dark:text-stellar-gray/70 leading-relaxed">
                    Your work is in. The sponsor will review all submissions
                    after the deadline.
                  </p>
                </div>
              </div>

              {/* Tx hash */}
              <div className="rounded-xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-stellar-gray/5 dark:bg-stellar-gray/5 p-3.5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
                  Transaction Hash
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-left text-[11px] font-mono text-stellar-black/80 dark:text-stellar-white/80 truncate">
                    {truncatedHash}
                  </code>
                  <button
                    onClick={handleCopy}
                    aria-label="Copy transaction hash"
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-stellar-gray/10 dark:hover:bg-stellar-gray/10 hover:text-stellar-black dark:hover:text-stellar-white transition-colors duration-200"
                  >
                    {copied ? (
                      <CheckCircleIconSolid className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${MOCK_TX_HASH}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] text-stellar-teal hover:underline font-medium"
                >
                  View on Stellar Expert ↗
                </a>
              </div>

              <Button
                onClick={() => handleClose(false)}
                className="w-full bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 active:scale-[0.98] transition-all duration-200 py-5"
              >
                Back to bounty
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
