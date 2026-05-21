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

import { useWalletStore } from "@/lib/useWalletStore";

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

/* =========================
   DASHBOARD
========================= */

function StellarEarnDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const wallet = useWalletStore((s) => s.wallet);
  const setWallet = useWalletStore((s) => s.setWallet);

  const [walletLoading, setWalletLoading] = useState(false);

  const isLoggedIn = !!wallet;

  const activeTab = (searchParams.get("tab") as Tab) || "all";
  const activeSkill = (searchParams.get("skill") as Skill) || "all";

  const [activeGrantSkill, setActiveGrantSkill] = useState("All");

  /* =========================
     WALLET CONNECT
  ========================= */

  const handleConnectWallet = useCallback(async () => {
    try {
      setWalletLoading(true);

      const connected = await isConnected();

      if (!connected.isConnected) {
        alert("Freighter not installed");
        return;
      }

      const res = await getAddress();

      if (res.error) throw new Error(res.error);

      setWallet(res.address);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setWalletLoading(false);
    }
  }, [setWallet]);

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

  const handleSignUpClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { tab: "signup" } })
    );
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
    <div className="pb-20">

      {/* HERO */}
      <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden rounded-2xl mb-6">

        <div className="relative z-10 p-8 max-w-[600px]">
          <h2 className="text-3xl font-bold text-white">
            Get into StellarEarn
          </h2>

          <p className="text-zinc-200 mt-2">
            Earn on-chain rewards via Freighter wallet.
          </p>

          {/* AUTH SWITCH */}
          <div className="flex gap-3 mt-4">

            {!isLoggedIn && (
              <>
                <Button onClick={handleSignUpClick}>
                  Get Started
                </Button>

                <Button variant="outline" onClick={handleSignUpClick}>
                  Login
                </Button>
              </>
            )}

            {!wallet ? (
              <Button onClick={handleConnectWallet} disabled={walletLoading}>
                {walletLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button onClick={handleDisconnectWallet}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] max-w-[1200px] mx-auto">

        <main className="p-6">

          {/* TABS */}
          <div className="flex gap-4 mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                {["all", "bounties", "projects"].map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* LIST */}
          {filteredBounties.map((b) => (
            <BountyListItem key={b.id} bounty={b} />
          ))}

        </main>

        {/* SIDEBAR */}
        <aside className="p-5">

          <div className="text-sm text-gray-400">Wallet</div>
          <div className="font-mono text-sm break-all">
            {wallet || "Not connected"}
          </div>

          <Card className="mt-4 p-4">
            <div className="font-bold">StellarEarn</div>

            <Button className="w-full mt-3" onClick={handleSurpriseMe}>
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
    <Suspense fallback={<div>Loading...</div>}>
      <StellarEarnDashboard />
    </Suspense>
  );
}