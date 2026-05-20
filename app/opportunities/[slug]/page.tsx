import { notFound } from "next/navigation";
import { BOUNTIES } from "@/lib/data";
import { BountyDetail } from "@/components/features/bounty-detail";

interface OpportunityPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate paths for static rendering at build time.
 */
export async function generateStaticParams() {
  return BOUNTIES.map((bounty) => ({
    slug: bounty.slug,
  }));
}

/**
 * Opportunity Detail Page Segment.
 */
export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const { slug } = await params;
  const bounty = BOUNTIES.find((b) => b.slug === slug);

  if (!bounty) {
    notFound();
  }

  return (
    <div className="bg-slate-50/20 pb-20 backdrop-blur-[2px] min-h-[calc(100vh-3.5rem)]">
      <BountyDetail bounty={bounty} />
    </div>
  );
}
