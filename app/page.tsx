"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { BOUNTIES, GRANTS, EARNERS, ACTIVITIES } from "@/lib/data";
import type { Tab, Skill } from "@/lib/data";
import { BountyListItem } from "@/components/features/bounty-list-item";
import { InfiniteCarousel } from "@/components/features/infinite-carousel";
import { EarnerRow } from "@/components/features/earner-card";
import { ActivityRow } from "@/components/features/activity-card";

import {
  isConnected,
  getAddress,
} from "@stellar/freighter-api";

import {
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  UserIcon,
  BoltIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  CheckBadgeIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

function StellarEarnDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as Tab) || "all";
  const activeSkill = (searchParams.get("skill") as Skill) || "all";

  const [activeGrantSkill, setActiveGrantSkill] = useState<string>("All");

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
    if (!BOUNTIES.length) return;

    const random = BOUNTIES[Math.floor(Math.random() * BOUNTIES.length)];

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

  const filteredBounties = BOUNTIES.filter((b) => {
    const tabOk =
      activeTab === "all" ||
      (activeTab === "bounties" && b.type === "bounty") ||
      (activeTab === "projects" && b.type === "project");

    const skillOk = activeSkill === "all" || b.skill === activeSkill;

    return tabOk && skillOk;
  });

  /* =========================
     UI
  ========================= */

  return (
    <div className="pb-20 backdrop-blur-[1px]">

      {/* HERO */}
      <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden bg-stellar-cosmic px-[8vw] py-8 rounded-2xl mb-6 border border-white/15 shadow-xl">

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-50 mix-blend-overlay" />

        <div className="relative z-10 max-w-[560px]">
          <h2 className="mb-3 text-3xl font-extrabold text-white">
            Get into StellarEarn
          </h2>

          <p className="mb-5 text-[13.5px] text-zinc-200">
            Earn on-chain rewards via Freighter wallet.
          </p>

          {/* AUTH + WALLET UI */}
          <div className="flex items-center gap-3">

            {/* SHOW ONLY IF NOT LOGGED IN */}
            {!isLoggedIn && (
              <>
                <Button onClick={handleSignUpClick}>
                  Get Started
                </Button>

                <Button
                  variant="outline"
                  className="border-white/30 text-white"
                  onClick={handleSignUpClick}
                >
                  Login
                </Button>
              </>
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

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                {(["all", "bounties", "projects"] as const).map((t) => (
                  <TabsTrigger key={t} value={t}>
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
                className="cursor-pointer"
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* LIST */}
          <div>
            {filteredBounties.map((b) => (
              <BountyListItem key={b.id} bounty={b} />
            ))}
          </div>

        </main>

        {/* SIDEBAR */}
        <aside className="hidden md:block p-5">

          <div className="text-sm text-muted-foreground">Wallet</div>
          <div className="font-semibold mb-4">
            {wallet ? wallet : "Not connected"}
          </div>

          <Card className="p-4">
            <div className="font-bold">StellarEarn</div>
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
export default function StellarEarnPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <StellarEarnDashboard />
    </Suspense>
  );
}