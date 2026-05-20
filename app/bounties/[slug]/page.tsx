import { notFound } from "next/navigation";
import { BOUNTIES } from "@/lib/data";
import { BountyDetail } from "@/components/features/bounty-detail";

interface BountyPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-generate paths for static rendering at build time.
 */
export async function generateStaticParams() {
  return BOUNTIES.filter(b => b.type === "bounty").map((bounty) => ({
    slug: bounty.slug,
  }));
}

/**
 * Bounty Detail Page Segment.
 */
export default async function BountyPage({ params }: BountyPageProps) {
  const { slug } = await params;
  const bounty = BOUNTIES.find((b) => b.slug === slug && b.type === "bounty");

  if (!bounty) {
    notFound();
  }

  return (
    <div className="bg-slate-50/10 dark:bg-zinc-950/20 pb-20 backdrop-blur-[2px] min-h-[calc(100vh-3.5rem)]">
      <BountyDetail bounty={bounty} />
    </div>
  );
}
