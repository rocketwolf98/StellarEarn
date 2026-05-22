import { notFound } from "next/navigation";
import { BOUNTIES } from "@/lib/data";
import { fetchGig } from "@/lib/api";
import type { GigRow, SubmissionRow } from "@/lib/api";
import { BountyDetail } from "@/components/features/bounty-detail";

interface BountyPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate paths for static rendering at build time.
 * Includes both seeded DB slugs and local mock slugs as fallback.
 */
export async function generateStaticParams() {
  return BOUNTIES.filter((b) => b.type === "bounty").map((b) => ({
    slug: b.slug,
  }));
}

/**
 * Bounty Detail Page — fetches live from Supabase, falls back to mock data.
 */
export default async function BountyPage({ params }: BountyPageProps) {
  const { slug } = await params;

  let gig: GigRow | null = null;
  let submissions: SubmissionRow[] = [];

  // Try live DB first
  const result = await fetchGig(slug);
  if (result) {
    gig = result.gig;
    submissions = result.submissions;
  } else {
    // Fall back to mock data shape so the page still renders during dev
    const mock = BOUNTIES.find((b) => b.slug === slug && b.type === "bounty");
    if (mock) {
      gig = {
        id: String(mock.id),
        slug: mock.slug,
        title: mock.title,
        org: mock.org,
        initials: mock.initials,
        bg: mock.bg,
        color: mock.color,
        desc_short: mock.desc,
        description: mock.desc,
        prize_php: mock.prize,
        reward_amount: mock.prizeUsdc,
        reward_unit: "USDC",
        type: mock.type,
        skill: mock.skill,
        deadline_at: mock.deadline,
        submissions: mock.submissions,
        featured: mock.featured,
        live: mock.live,
        status: mock.status === "under_review" ? "pending_review" : mock.status,
        created_by_user_id: "mock",
        fee_xlm: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_at: null,
        paid_by_user_id: null,
        payment_tx_hash: null,
        sponsor_name: null,
        sponsor_wallet: null,
        deliverables: mock.deliverables,
      };

      // Seed winner submission from mock if closed
      if (mock.winner) {
        submissions = [
          {
            id: "mock-winner",
            gig_id: String(mock.id),
            worker_user_id: "mock",
            worker_name: mock.winner.name,
            submission_url: mock.winner.submissionUrl,
            description: null,
            twitter_url: null,
            status: "approved",
            submitted_at: new Date().toISOString(),
            reviewed_at: null,
            notes: null,
            approved_at: new Date().toISOString(),
            approved_by_user_id: null,
            payout_tx_hash: mock.winner.txHash,
          },
        ];
      }
    }
  }

  if (!gig) {
    notFound();
  }

  return (
    <div className="bg-slate-50/10 dark:bg-zinc-950/20 pb-20 backdrop-blur-[2px] min-h-[calc(100vh-3.5rem)]">
      <BountyDetail gig={gig} submissions={submissions} />
    </div>
  );
}
