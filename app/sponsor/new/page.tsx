import type { Metadata } from "next";
import { CreateBountyWizard } from "@/components/features/create-bounty-wizard";

export const metadata: Metadata = {
  title: "Post a Bounty — StellarEarn",
  description:
    "Create a Stellar-native bounty or project listing with Soroban escrow. Fund the prize pool and start receiving submissions from top community talent.",
};

export default function SponsorNewPage() {
  return (
    <main className="min-h-screen bg-background">
      <CreateBountyWizard />
    </main>
  );
}
