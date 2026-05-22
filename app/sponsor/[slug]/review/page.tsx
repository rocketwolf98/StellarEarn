import type { Metadata } from "next";
import { ReviewDashboard } from "@/components/features/review-dashboard";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Review Submissions — ${slug} | StellarEarn`,
    description: "Sponsor review dashboard for evaluating and selecting bounty winners.",
  };
}

export default async function SponsorReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background">
      <ReviewDashboard slug={slug} />
    </main>
  );
}
