import { notFound } from "next/navigation";
import { BOUNTIES } from "@/lib/data";
import { fetchGig } from "@/lib/api";
import type { GigRow, SubmissionRow } from "@/lib/api";
import { BountyDetail } from "@/components/features/bounty-detail";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BOUNTIES.filter((b) => b.type === "project").map((b) => ({
    slug: b.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  let gig: GigRow | null = null;
  let submissions: SubmissionRow[] = [];

  const result = await fetchGig(slug);
  if (result) {
    gig = result.gig;
    submissions = result.submissions;
  } else {
    const mock = BOUNTIES.find((b) => b.slug === slug && b.type === "project");
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
