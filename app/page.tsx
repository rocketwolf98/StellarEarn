"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BOUNTIES } from "@/lib/data";
import type { Tab, Skill } from "@/lib/data";
import { fetchGigs, deadlineDue } from "@/lib/api";
import type { GigRow } from "@/lib/api";
import { BountyListItem } from "@/components/features/bounty-list-item";

import {
  isConnected,
  getAddress,
} from "@stellar/freighter-api";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

// Convert the static mock array into a GigRow-compatible shape for fallback
const MOCK_GIGS: GigRow[] = BOUNTIES.map((b) => ({
  id: String(b.id),
  slug: b.slug,
  title: b.title,
  org: b.org,
  initials: b.initials,
  bg: b.bg,
  color: b.color,
  desc_short: b.desc,
  description: b.desc,
  prize_php: b.prize,
  reward_amount: b.prizeUsdc,
  reward_unit: "USDC",
  type: b.type,
  skill: b.skill,
  deadline_at: b.deadline,
  submissions: b.submissions,
  featured: b.featured,
  live: b.live,
  status: b.status === "under_review" ? "pending_review" : b.status,
  created_by_user_id: "mock",
  fee_xlm: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  paid_at: null,
  paid_by_user_id: null,
  payment_tx_hash: null,
  sponsor_name: null,
  sponsor_wallet: null,
  deliverables: b.deliverables,
}));

function StarQuestDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as Tab) || "all";
  const activeSkill = (searchParams.get("skill") as Skill) || "all";

  /* =========================
     LIVE DATA
  ========================= */
  const [gigs, setGigs] = useState<GigRow[]>(MOCK_GIGS);
  const [loadingGigs, setLoadingGigs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchGigs().then((data) => {
      if (!cancelled && data.length > 0) setGigs(data);
      setLoadingGigs(false);
    });
    return () => { cancelled = true; };
  }, []);

  /* =========================
     WALLET STATE (AUTH)
  ========================= */
  const [wallet, setWallet] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const isLoggedIn = !!wallet;

  const handleConnectWallet = useCallback(async () => {
    try {
      setWalletLoading(true);

      const connected = await isConnected();

      if (!connected.isConnected) {
        alert("Freighter is not installed or not enabled");
        return;
      }

      const res = await getAddress();

      if (res.error) {
        throw new Error(res.error);
      }

      setWallet(res.address);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const handleDisconnectWallet = () => {
    setWallet(null);
  };

  /* =========================
     ROUTING
  ========================= */

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") params.delete(name);
      else params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleTabChange = (value: string) => {
    const qs = createQueryString("tab", value);
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const handleSkillChange = (value: string) => {
    const qs = createQueryString("skill", value);
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const handleSurpriseMe = () => {
    if (!gigs.length) return;
    const openGigs = gigs.filter((g) => g.live);
    const pool = openGigs.length ? openGigs : gigs;
    const random = pool[Math.floor(Math.random() * pool.length)];
    router.push(
      random.type === "bounty"
        ? `/bounties/${random.slug}`
        : `/projects/${random.slug}`
    );
  };

  const handleSignUpClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { tab: "signup" } })
    );
  };

  const filteredGigs = gigs.filter((g) => {
    const tabOk =
      activeTab === "all" ||
      (activeTab === "bounties" && g.type === "bounty") ||
      (activeTab === "projects" && g.type === "project");

    const skillOk = activeSkill === "all" || g.skill === activeSkill;

    return tabOk && skillOk;
  });

  /* =========================
     UI
  ========================= */

  return (
    <div className="pb-20 backdrop-blur-[1px]">

      {/* HERO */}
      <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden bg-stellar-cosmic px-[8vw] py-8 rounded-2xl mb-6 border border-white/15 shadow-xl  mx-[1vw] my-[1vh] ">

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-50 mix-blend-overlay" />

        <div className="relative z-10 max-w-[560px]">
          <h2 className="mb-3 text-3xl font-extrabold text-white">
            Get into Star.Quest
          </h2>

          <p className="mb-5 text-[13.5px] text-zinc-200">
            Earn on-chain rewards via Freighter wallet.
          </p>

          {/* AUTH + WALLET UI */}
          <div className="flex items-center gap-3">

            {/* SHOW ONLY IF NOT LOGGED IN */}
            {!isLoggedIn && (
              <Button onClick={handleSignUpClick}>
                Get Started
              </Button>
            )}

            {/* WALLET CONNECT / IDENTITY */}
            {!wallet ? (
              <Button
                onClick={handleConnectWallet}
                disabled={walletLoading}
                className="bg-white/10 border border-white/30 text-white"
              >
                {walletLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnectWallet}
                className="bg-stellar-teal text-white"
              >
                {wallet.slice(0, 5)}...{wallet.slice(-5)}
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 md:grid-cols-[1fr_300px]">

        <main className="border-r border-border p-6">

          {/* Tabs */}
          <div className="mb-4 flex items-center gap-4">
            <span className="font-semibold">Browse Opportunities</span>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-fit">
              <TabsList className="rounded-full bg-zinc-100 p-1 h-9 items-center dark:bg-zinc-900 flex gap-1">
                {(["all", "bounties", "projects"] as const).map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="rounded-full h-7 px-4 text-xs font-semibold capitalize data-active:bg-white data-active:text-zinc-900 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-100 data-active:shadow-sm"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button variant="ghost" className="ml-auto">
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>

          {/* Skills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["All", "all"],
              ["Content", "content"],
              ["Design", "design"],
              ["Development", "dev"],
              ["Other", "research"],
            ].map(([label, val]) => (
              <Badge
                key={val}
                onClick={() => handleSkillChange(val)}
                variant={activeSkill === val ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all px-3 py-1 text-xs rounded-full border",
                  activeSkill === val
                    ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* LIST */}
          <div>
            {loadingGigs && gigs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading bounties…</div>
            ) : filteredGigs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No bounties match this filter.</div>
            ) : (
              filteredGigs.map((g) => (
                <BountyListItem key={g.id} gig={g} />
              ))
            )}
          </div>

        </main>

        {/* SIDEBAR */}
        <aside className="hidden md:block p-5">

          <div className="text-sm text-muted-foreground">Wallet</div>
          <div className="font-semibold mb-4">
            {wallet ? wallet : "Not connected"}
          </div>

          <Card className="p-4">
            <div className="font-bold">Star.Quest</div>
            <p className="text-xs text-muted-foreground">
              Web3 bounties powered by Freighter
            </p>

            <Button className="mt-3 w-full" onClick={handleSurpriseMe}>
              Surprise Me
            </Button>
          </Card>

        </aside>

      </div>
    </div>
  );
}

/* WRAPPER */
export default function StarQuestPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <StarQuestDashboard />
    </Suspense>
  );
}