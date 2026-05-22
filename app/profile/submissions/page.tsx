import type { Metadata } from "next";
import { MY_SUBMISSIONS, BOUNTIES } from "@/lib/data";
import type { SubmissionStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeftIcon, LinkIcon } from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "My Submissions — StellarEarn",
  description:
    "Track all your bounty submissions, their review status, and prize payouts on StellarEarn.",
};

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: "Submitted",
  under_review: "Under Review",
  winner: "🏆 Winner",
  not_selected: "Not Selected",
};

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  pending:
    "border-stellar-gray/25 bg-stellar-gray/10 text-muted-foreground dark:text-stellar-gray/70",
  under_review:
    "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  winner:
    "border-stellar-yellow/40 bg-stellar-yellow/10 text-stellar-black dark:text-stellar-white",
  not_selected:
    "border-red-500/20 bg-red-500/5 text-red-500/80 dark:text-red-400/80",
};

export default function MySubmissionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground dark:text-stellar-gray/70 hover:text-stellar-black dark:hover:text-stellar-yellow transition-colors duration-200 font-medium"
      >
        <ArrowLeftIcon className="h-3 w-3" /> Back to listings
      </Link>

      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight text-stellar-black dark:text-stellar-white">
          My Submissions
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground dark:text-stellar-gray/70">
          Track your submitted work and reward status.
        </p>
      </div>

      {MY_SUBMISSIONS.length === 0 ? (
        <div className="rounded-2xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-card/50 p-12 text-center">
          <p className="text-[14px] font-semibold text-stellar-black dark:text-stellar-white">
            No submissions yet
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground dark:text-stellar-gray/70">
            Browse open bounties and submit your first entry.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[12.5px] font-semibold text-stellar-teal hover:underline"
          >
            Browse opportunities →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {MY_SUBMISSIONS.map((sub) => {
            const bounty = BOUNTIES.find((b) => b.slug === sub.bountySlug);
            return (
              <div
                key={sub.id}
                className="group rounded-2xl border border-stellar-gray/20 dark:border-stellar-gray/10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md p-4 hover:border-stellar-gray/30 dark:hover:border-stellar-gray/20 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(15,15,15,0.05)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              >
                <div className="flex flex-wrap items-start gap-3">
                  {/* Org icon */}
                  {bounty && (
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stellar-gray/30 dark:border-stellar-gray/10 text-[9.5px] font-bold shadow-xs"
                      style={{ background: bounty.bg, color: bounty.color }}
                    >
                      {bounty.initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <Link
                        href={`/bounties/${sub.bountySlug}`}
                        className="text-[13.5px] font-bold text-stellar-black dark:text-stellar-white group-hover:text-stellar-navy dark:group-hover:text-stellar-yellow transition-colors duration-200 truncate hover:underline"
                      >
                        {bounty?.title ?? sub.bountySlug}
                      </Link>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 px-2 text-[10px] font-semibold shrink-0",
                          STATUS_STYLE[sub.status]
                        )}
                      >
                        {STATUS_LABEL[sub.status]}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] text-muted-foreground dark:text-stellar-gray/70 font-medium">
                      <span className="font-semibold text-stellar-black/70 dark:text-stellar-white/70">
                        {bounty?.org}
                      </span>
                      <span className="text-stellar-black/20 dark:text-stellar-gray/30">·</span>
                      <span>
                        {new Date(sub.submittedAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-stellar-black/20 dark:text-stellar-gray/30">·</span>
                      <a
                        href={sub.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-stellar-teal hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" /> View submission
                      </a>
                    </div>
                  </div>

                  {/* Prize (shown if winner) */}
                  {sub.status === "winner" && bounty && (
                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-stellar-yellow/40 bg-stellar-yellow/10 px-3 py-1.5">
                      <TrophyIcon className="h-4 w-4 text-stellar-yellow" />
                      <span className="text-[12.5px] font-bold text-stellar-black dark:text-stellar-white">
                        ₱{bounty.prize.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description preview */}
                <p className="mt-3 text-[12px] leading-relaxed text-stellar-black/70 dark:text-stellar-white/70 line-clamp-2 pl-12">
                  {sub.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
