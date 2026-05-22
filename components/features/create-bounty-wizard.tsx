"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

type BountyType = "bounty" | "project";
type SkillCategory = "dev" | "design" | "content" | "research";
type Step = 1 | 2 | 3;

const STEPS = [
  { label: "Listing Details" },
  { label: "Prize & Escrow" },
  { label: "Fund Escrow" },
];

const TYPE_OPTIONS: { value: BountyType; label: string; desc: string }[] = [
  {
    value: "bounty",
    label: "Bounty",
    desc: "Best submission wins. Multiple people submit the same scope of work.",
  },
  {
    value: "project",
    label: "Project",
    desc: "One team is selected. Fixed-scope, milestone-based work.",
  },
];

const SKILL_OPTIONS: { value: SkillCategory; label: string; emoji: string }[] =
  [
    { value: "dev", label: "Development", emoji: "💻" },
    { value: "design", label: "Design", emoji: "🎨" },
    { value: "content", label: "Content", emoji: "✍️" },
    { value: "research", label: "Research", emoji: "🔬" },
  ];

export function CreateBountyWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState<BountyType>("bounty");
  const [skill, setSkill] = useState<SkillCategory>("dev");
  const [description, setDescription] = useState("");
  const [deliverables, setDeliverables] = useState(["", ""]);
  const [deadline, setDeadline] = useState("");

  // Step 2 fields
  const [prizeAmount, setPrizeAmount] = useState("");
  const [prizeUnit, setPrizeUnit] = useState<"PHP" | "USDC">("PHP");
  const [entryFee] = useState("2"); // Fixed for MVP

  // Step 3 state
  const [funding, setFunding] = useState(false);
  const [funded, setFunded] = useState(false);
  const [mockTxHash] = useState(
    "d5e6f7a8b9c0d5e6f7a8b9c0d5e6f7a8b9c0d5e6f7a8b9c0d5e6f7a8b9c0d5e6"
  );

  function addDeliverable() {
    if (deliverables.length >= 10) return;
    setDeliverables([...deliverables, ""]);
  }

  function removeDeliverable(idx: number) {
    if (deliverables.length <= 1) return;
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  }

  function updateDeliverable(idx: number, val: string) {
    const updated = [...deliverables];
    updated[idx] = val;
    setDeliverables(updated);
  }

  function validateStep1() {
    if (!title.trim()) {
      toast.error("Title is required.");
      return false;
    }
    if (title.length > 80) {
      toast.error("Title must be 80 characters or less.");
      return false;
    }
    if (!description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    if (deliverables.filter((d) => d.trim()).length === 0) {
      toast.error("Add at least one deliverable.");
      return false;
    }
    if (!deadline) {
      toast.error("Deadline is required.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    const amount = parseFloat(prizeAmount);
    if (!prizeAmount || isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid prize amount.");
      return false;
    }
    return true;
  }

  async function handleFundEscrow() {
    setFunding(true);
    await new Promise((r) => setTimeout(r, 2500));
    setFunding(false);
    setFunded(true);
    toast.success("Escrow funded and bounty is now live!");
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/");
  }

  const escrowTotal =
    prizeUnit === "PHP"
      ? `₱${parseFloat(prizeAmount || "0").toLocaleString()}`
      : `$${parseFloat(prizeAmount || "0").toLocaleString()} USDC`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-stellar-black dark:text-stellar-white">
          Post a bounty
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground dark:text-stellar-gray/70">
          Fund work from the Stellar community. Escrow-secured, on-chain.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <div key={s.label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-px flex-1 transition-colors duration-500",
                      done ? "bg-stellar-teal" : "bg-stellar-gray/20 dark:bg-stellar-gray/10"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300",
                    active
                      ? "bg-stellar-yellow text-stellar-black shadow-[0_0_12px_rgba(253,218,36,0.4)]"
                      : done
                        ? "bg-stellar-teal text-white"
                        : "bg-stellar-gray/15 dark:bg-stellar-gray/10 text-muted-foreground"
                  )}
                >
                  {done ? (
                    <CheckCircleIconSolid className="h-4 w-4 text-white" />
                  ) : (
                    n
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 transition-colors duration-500",
                      step > n
                        ? "bg-stellar-teal"
                        : "bg-stellar-gray/20 dark:bg-stellar-gray/10"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[10px] font-semibold",
                  active
                    ? "text-stellar-black dark:text-stellar-white"
                    : done
                      ? "text-stellar-teal"
                      : "text-muted-foreground dark:text-stellar-gray/50"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Listing Details ──────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6 rounded-2xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 p-6 backdrop-blur-md">
          {/* Type */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all duration-200",
                    type === opt.value
                      ? "border-stellar-yellow/60 bg-stellar-yellow/8 shadow-[0_0_12px_rgba(253,218,36,0.15)]"
                      : "border-stellar-gray/20 dark:border-stellar-gray/10 hover:border-stellar-gray/30 dark:hover:border-stellar-gray/20"
                  )}
                >
                  <div className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white">
                    {opt.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground dark:text-stellar-gray/70">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skill */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Skill category
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSkill(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200",
                    skill === opt.value
                      ? "border-stellar-yellow/60 bg-stellar-yellow/10 text-stellar-black dark:text-stellar-white shadow-sm"
                      : "border-stellar-gray/20 dark:border-stellar-gray/10 text-muted-foreground hover:border-stellar-gray/30 dark:hover:border-stellar-gray/20 hover:text-stellar-black dark:hover:text-stellar-white"
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="bounty-title"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="bounty-title"
              placeholder="e.g. Build a Soroban token swap UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40 focus-visible:border-stellar-teal/60"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground dark:text-stellar-gray/50">
              {title.length}/80
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="bounty-desc"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="bounty-desc"
              placeholder="What are you looking for? What problem does this solve?"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={4}
              className="resize-none text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40 focus-visible:border-stellar-teal/60"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Deliverables <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Deliverable ${i + 1}`}
                    value={d}
                    onChange={(e) => updateDeliverable(i, e.target.value)}
                    className="text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40"
                  />
                  {deliverables.length > 1 && (
                    <button
                      onClick={() => removeDeliverable(i)}
                      aria-label="Remove deliverable"
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {deliverables.length < 10 && (
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-stellar-teal hover:text-stellar-teal/80 transition-colors duration-200"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add deliverable
                </button>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="bounty-deadline"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
            >
              Deadline <span className="text-red-500">*</span>
            </label>
            <Input
              id="bounty-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40"
            />
          </div>

          <Button
            onClick={() => validateStep1() && setStep(2)}
            className="w-full bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
          >
            Next: Prize & Escrow <ArrowRightIcon className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Prize & Escrow ───────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 rounded-2xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 p-6 backdrop-blur-md">
          {/* Prize unit toggle */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender">
              Prize currency
            </label>
            <div className="inline-flex rounded-xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-stellar-gray/5 p-1">
              {(["PHP", "USDC"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setPrizeUnit(u)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-[12px] font-bold transition-all duration-200",
                    prizeUnit === u
                      ? "bg-stellar-yellow text-stellar-black shadow-sm"
                      : "text-muted-foreground hover:text-stellar-black dark:hover:text-stellar-white"
                  )}
                >
                  {u === "PHP" ? "₱ PHP" : "$ USDC"}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground dark:text-stellar-gray/60">
              {prizeUnit === "PHP"
                ? "Philippine Peso — shown to contributors as ₱ amount."
                : "USD Coin — on-chain stablecoin locked in Soroban escrow."}
            </p>
          </div>

          {/* Prize amount */}
          <div>
            <label
              htmlFor="prize-amount"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender"
            >
              Total prize pool <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted-foreground dark:text-stellar-gray/60">
                {prizeUnit === "PHP" ? "₱" : "$"}
              </span>
              <Input
                id="prize-amount"
                type="number"
                placeholder="25000"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                className="pl-7 text-[13px] border-stellar-gray/25 dark:border-stellar-gray/15 focus-visible:ring-stellar-teal/40"
              />
            </div>
          </div>

          {/* Entry fee info (fixed) */}
          <div className="rounded-xl border border-stellar-gray/15 dark:border-stellar-gray/10 bg-stellar-gray/5 p-4 space-y-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-stellar-navy dark:text-stellar-lavender mb-3">
              Fee summary
            </p>
            {[
              ["Prize pool (escrow)", escrowTotal],
              ["Contributor entry fee", `${entryFee} XLM (set by platform)`],
              ["Platform fee", "5% of prize pool"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[12.5px]">
                <span className="text-muted-foreground dark:text-stellar-gray/70 font-medium">
                  {l}
                </span>
                <span className="font-bold text-stellar-black dark:text-stellar-white">
                  {v}
                </span>
              </div>
            ))}
            <div className="border-t border-stellar-gray/20 dark:border-stellar-gray/10 pt-2.5 flex justify-between text-[12.5px]">
              <span className="font-bold text-stellar-black dark:text-stellar-white">
                You fund today
              </span>
              <span className="font-bold text-stellar-teal">{escrowTotal}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 border-stellar-gray/25 dark:border-stellar-gray/15 font-semibold text-[13px]"
            >
              <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => validateStep2() && setStep(3)}
              className="flex-[2] bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
            >
              Next: Fund Escrow <ArrowRightIcon className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Fund Escrow ──────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6 rounded-2xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 p-6 backdrop-blur-md">
          {!funded ? (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stellar-yellow/15">
                  <LockClosedIcon className="h-7 w-7 text-stellar-yellow" />
                </div>
                <h2 className="text-[17px] font-bold text-stellar-black dark:text-stellar-white">
                  Fund the escrow
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground dark:text-stellar-gray/70">
                  Your prize pool will be locked in a Soroban smart contract.
                  Contributors won&apos;t see it until escrow is confirmed.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-stellar-gray/15 dark:border-stellar-gray/10 bg-stellar-gray/5 p-4 space-y-2">
                {[
                  ["Bounty", title],
                  ["Type", type.charAt(0).toUpperCase() + type.slice(1)],
                  ["Prize pool", escrowTotal],
                  ["Deadline", deadline],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-[12.5px]">
                    <span className="text-muted-foreground dark:text-stellar-gray/70 font-medium">
                      {l}
                    </span>
                    <span className="font-semibold text-stellar-black dark:text-stellar-white max-w-[60%] text-right truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-[11.5px] text-stellar-black/70 dark:text-stellar-white/70 leading-relaxed">
                ⚠️ Once funded, escrow can only be released to the winner or
                refunded if the bounty is cancelled. Ensure details are correct.
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={funding}
                  className="flex-1 border-stellar-gray/25 dark:border-stellar-gray/15 font-semibold text-[13px]"
                >
                  <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleFundEscrow}
                  disabled={funding}
                  className="flex-[2] bg-stellar-yellow text-stellar-black font-bold hover:bg-stellar-yellow/90 hover:shadow-[0_2px_12px_rgba(253,218,36,0.3)] active:scale-[0.98] transition-all duration-200 py-5"
                >
                  {funding ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-stellar-black/30 border-t-stellar-black" />
                      Signing escrow…
                    </span>
                  ) : (
                    <>
                      <LockClosedIcon className="mr-1.5 h-4 w-4" />
                      Sign &amp; fund escrow
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                <SparklesIcon className="absolute -top-1 -right-1 h-5 w-5 text-stellar-yellow animate-pulse" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-stellar-black dark:text-stellar-white">
                  Bounty is live! 🎉
                </h3>
                <p className="mt-1 text-[12px] text-muted-foreground dark:text-stellar-gray/70 leading-relaxed">
                  Escrow confirmed on Stellar testnet. Contributors can now
                  submit their work.
                </p>
              </div>
              <code className="w-full rounded-lg bg-stellar-gray/10 dark:bg-stellar-gray/10 px-3 py-2 text-left text-[10.5px] font-mono text-stellar-black/70 dark:text-stellar-white/70 truncate">
                {mockTxHash}
              </code>
              <p className="text-[11.5px] text-muted-foreground dark:text-stellar-gray/60">
                Redirecting to the listings…
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
