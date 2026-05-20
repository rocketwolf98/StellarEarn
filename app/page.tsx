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

  // State for Grants category filter (keeping it local as it's separate)
  const [activeGrantSkill, setActiveGrantSkill] = useState<string>("All");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
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

  const filteredBounties = BOUNTIES.filter((b) => {
    const tabOk = activeTab === "all" || activeTab === "bounties";
    const skillOk = activeSkill === "all" || b.skill === activeSkill;
    return tabOk && skillOk;
  });

  return (
    <div className="pb-20 backdrop-blur-[1px]">
      {/* ── Hero ── */}
      <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden bg-stellar-cosmic px-[8vw] py-8 rounded-2xl mb-6 border border-white/15 shadow-xl mx-[1vw] my-[1vh] hover:shadow-2xl transition-all duration-300">
        {/* Layered textures inside Hero */}
        <div className="absolute inset-0 bg-stellar-noise-direct opacity-[0.015] pointer-events-none" />
        <div className="relative z-10 max-w-[480px]">
          <div className="mb-2 text-stellar-yellow">
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white tracking-wide">Become a Sponsor</h2>
          <p className="mb-4 text-[13px] leading-relaxed text-zinc-200">
            Reach 50,000+ top-tier Stellar builders in under 5 clicks. Get high-quality work done across content, development, and design.
          </p>
          <div className="flex items-center gap-4">
            <Button className="h-9 bg-stellar-white text-[13px] font-semibold text-stellar-black hover:bg-white hover:-translate-y-[1px] hover:shadow-md cursor-pointer transition-all duration-200">
              Get Started
            </Button>
            <span className="text-xs text-zinc-300/80">Join 2,450+ others</span>
          </div>
        </div>


      </div>

      {/* ── Two-column layout ── */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 md:grid-cols-[1fr_300px]">
        <main className="border-r border-border p-6">

          {/* Browse header */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className="text-[15px] font-semibold text-foreground">Browse Opportunities</span>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="ml-2">
              <TabsList className="h-9 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 gap-1 flex items-center">
                {(["all", "bounties", "projects"] as const).map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="h-7 rounded-full px-4 text-xs font-semibold capitalize text-zinc-500 dark:text-zinc-400 transition-all duration-200 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button variant="ghost" className="ml-auto h-8 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-all duration-200">
              <AdjustmentsHorizontalIcon className="mr-1 h-3.5 w-3.5" /> Filter
            </Button>
          </div>

          {/* Skill pills */}
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
                variant="outline"
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-normal transition-colors ${activeSkill === val
                  ? "border-stellar-teal bg-stellar-teal/5 text-stellar-teal"
                  : "border-border text-muted-foreground hover:border-stellar-teal/40 hover:text-foreground"
                  }`}
                onClick={() => handleSkillChange(val)}
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* Bounty rows */}
          <div className="flex flex-col">
            {filteredBounties.length > 0 ? (
              filteredBounties.map((b) => (
                <BountyListItem key={b.id} bounty={b} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-300">
                <InformationCircleIcon className="mb-3.5 h-14 w-14 text-muted-foreground/60 stroke-[1.25]" />
                <h4 className="text-[16px] font-semibold text-muted-foreground">No opportunities found</h4>
                <p className="mt-1.5 text-[12px] text-muted-foreground/80 max-w-[320px] leading-relaxed">
                  We don&apos;t have any relevant opportunities for the current filters.
                </p>
              </div>
            )}
          </div>

          <Button variant="outline" className="mt-4 w-full text-[13px] text-muted-foreground border-border hover:bg-muted cursor-pointer transition-all duration-200">
            View All <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
          </Button>

          {/* ── Grants section ── */}
          <div id="grants" className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Grants</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {["All", "Content", "Design", "Development", "Other"].map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-normal transition-colors ${activeGrantSkill === s
                    ? "border-stellar-lavender bg-stellar-lavender/5 text-stellar-lavender"
                    : "border-border text-muted-foreground hover:border-stellar-lavender/40 hover:text-foreground"
                    }`}
                  onClick={() => setActiveGrantSkill(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>

            <div className="flex flex-col">
              {GRANTS.map((g) => (
                <Link key={g.id} href={`/grants/${g.id}`} className="flex -mx-2 items-center gap-3 rounded-xl border border-transparent p-3 hover:bg-card/75 hover:backdrop-blur-sm hover:border-border hover:shadow-[0_4px_12px_rgba(15,15,15,0.03)] cursor-pointer transition-all duration-200 decoration-transparent">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-[11px] font-semibold text-white"
                    style={{ background: g.bg }}
                  >
                    {g.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 truncate text-[13px] font-medium text-foreground">
                      {g.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{g.org}</span>
                      <CheckBadgeIcon className="h-3 w-3 text-stellar-teal" />
                      <span className="text-border">|</span>
                      <Badge variant="outline" className="h-5 border-stellar-lavender/30 bg-stellar-lavender/5 px-2 text-[10px] font-normal text-stellar-lavender">
                        Grant
                      </Badge>
                      <span className="text-border">|</span>
                      <span>Rolling deadline</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                    <span className="text-[13px] font-semibold text-foreground">{g.prize}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full text-[13px] text-muted-foreground border-border hover:bg-muted cursor-pointer transition-all duration-200">
              View All <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </main>

        {/* ── Sidebar ── */}
        <aside className="hidden p-5 md:block">
          {/* Stats */}
          <div className="mb-5 border-b border-border pb-5">
            <div className="flex items-center gap-3 py-1.5">
              <div className="shrink-0 text-stellar-teal bg-stellar-teal/10 p-1.5 rounded-md">
                <BanknotesIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">₱2,418,500</div>
                <div className="text-[11px] text-muted-foreground">Total Value Available</div>
              </div>
            </div>
            <div className="flex items-center gap-3 py-1.5">
              <div className="shrink-0 text-stellar-lavender bg-stellar-lavender/10 p-1.5 rounded-md">
                <ClipboardDocumentListIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">38</div>
                <div className="text-[11px] text-muted-foreground">Opportunities Listed</div>
              </div>
            </div>
          </div>

          {/* Promo card */}
          <Card className="mb-6 overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative bg-stellar-fluid flex items-center justify-center gap-2 p-5 text-xl font-extrabold tracking-widest text-white border-b border-black/15 shadow-sm">
              <div className="absolute inset-0 bg-stellar-noise-direct opacity-[0.015] pointer-events-none" />
              <SparklesIcon className="relative z-10 h-5 w-5 text-stellar-yellow animate-pulse" />
              <span className="relative z-10">STELLAR EARN</span>
            </div>
            <div className="p-3.5">
              <div className="mb-1.5 text-[13px] font-semibold leading-tight text-foreground">
                Are you a dev? We have prizes worth ₱430,000+ for you
              </div>
              <div className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                Submit to any StellarEarn side tracks and stand to win. Deadline May 31.
              </div>
              <Button className="h-8 w-full bg-stellar-yellow text-xs font-semibold text-stellar-black hover:bg-stellar-yellow/90 hover:-translate-y-[0.5px] hover:shadow-sm cursor-pointer transition-all duration-200">
                View Tracks
              </Button>
            </div>
          </Card>

          {/* How it works */}
          <div className="mb-6 border-b border-border pb-6">
            <p className="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground">HOW IT WORKS</p>
            {[
              { icon: <UserIcon className="h-4 w-4" />, title: "Connect your Wallet", sub: "Sign in with Freighter" },
              { icon: <BoltIcon className="h-4 w-4" />, title: "Pay to Submit", sub: "Small XLM fee, winners get it back" },
              { icon: <CurrencyDollarIcon className="h-4 w-4" />, title: "Get Paid On-chain", sub: "Soroban escrow releases on approval" },
              { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, title: "Cash Out to GCash", sub: "Withdraw PHP via local anchor" },
            ].map((s, i) => (
              <div key={i} className="mb-2.5 flex items-start gap-2">
                <span className="mt-px shrink-0 text-stellar-teal">{s.icon}</span>
                <div>
                  <div className="mb-px text-[12px] font-semibold text-stellar-teal">{s.title}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Earners */}
          <div className="mb-6">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground">RECENT EARNERS</span>
              <a href="#" className="flex items-center text-[11px] text-stellar-teal no-underline hover:underline hover:text-stellar-teal/80 transition-colors">Leaderboard <ArrowRightIcon className="ml-0.5 h-3 w-3" /></a>
            </div>
            <InfiniteCarousel id="earners" speed={22}>
              {EARNERS.map((e, i) => (
                <EarnerRow key={i} {...e} />
              ))}
            </InfiniteCarousel>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground">RECENT ACTIVITY</span>
              <a href="#" className="flex items-center text-[11px] text-stellar-teal no-underline hover:underline hover:text-stellar-teal/80 transition-colors">View All <ArrowRightIcon className="ml-0.5 h-3 w-3" /></a>
            </div>
            <InfiniteCarousel id="activity" speed={30}>
              {ACTIVITIES.map((a, i) => (
                <ActivityRow key={i} {...a} />
              ))}
            </InfiniteCarousel>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function StellarEarnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A7B5] border-t-transparent" />
        </div>
      }
    >
      <StellarEarnDashboard />
    </Suspense>
  );
}