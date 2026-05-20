"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { BOUNTIES, GRANTS, EARNERS, ACTIVITIES } from "@/lib/data";
import type { Bounty, Tab, Skill } from "@/lib/data";
import { BountyListItem } from "@/components/features/bounty-list-item";
import { BountyDetail } from "@/components/features/bounty-detail";
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

export default function StellarEarnPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [activeSkill, setActiveSkill] = useState<Skill>("all");
  const [selected, setSelected] = useState<Bounty | null>(null);

  const filtered = BOUNTIES.filter((b) => {
    const tabOk = activeTab === "all" || activeTab === "bounties";
    const skillOk = activeSkill === "all" || b.skill === activeSkill;
    return tabOk && skillOk;
  });

  return (
    <div className="bg-slate-50/20 pb-20 backdrop-blur-[2px]">


      {selected ? (
        <BountyDetail bounty={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          {/* ── Hero ── */}
          <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden bg-stellar-cosmic px-[8vw] py-8 rounded-2xl mb-6 border border-white/10 shadow-lg mx-[1vw] my-[1vh]">
            <div className="max-w-[480px]">
              <div className="mb-2 text-[#FDDA24]">
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Become a Sponsor</h2>
              <p className="mb-4 text-[13px] leading-relaxed text-zinc-200">
                Reach 50,000+ top-tier Stellar builders in under 5 clicks. Get high-quality work done across content, development, and design.
              </p>
              <div className="flex items-center gap-4">
                <Button className="h-9 bg-white text-[13px] font-semibold text-zinc-950 hover:bg-zinc-100">
                  Get Started
                </Button>
                <span className="text-xs text-zinc-300">Join 2,450+ others</span>
              </div>
            </div>

            <div className="hidden grid-cols-3 gap-2 md:grid">
              {["SD", "SE", "SS", "SF", "SL", "SA", "ST", "SP", "SR"].map((s, i) => (
                <div
                  key={i}
                  className="flex h-11 w-11 animate-pulse items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[10px] font-semibold text-white/70 backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 md:grid-cols-[1fr_300px]">
            <main className="border-r border-zinc-200/40 p-6">

              {/* Browse header */}
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <span className="text-[15px] font-medium text-zinc-950">Browse Opportunities</span>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="ml-2">
                  <TabsList className="h-9 bg-zinc-200/10 backdrop-blur-md border border-zinc-200/20 rounded-full p-1 gap-1.5 flex items-center">
                    {(["all", "bounties", "projects"] as const).map((t) => (
                      <TabsTrigger
                        key={t}
                        value={t}
                        className="h-7 rounded-full px-4 text-xs font-semibold capitalize text-zinc-500 transition-all duration-200 border border-transparent hover:bg-white/40 hover:text-zinc-900 hover:border-zinc-300/40 data-[state=active]:bg-white/80 data-[state=active]:text-[#00A7B5] data-[state=active]:border-[#FDDA24] data-[state=active]:shadow-sm"
                      >
                        {t}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <Button variant="ghost" className="ml-auto h-8 text-xs text-zinc-500">
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
                      ? "border-[#00A7B5] bg-[#00A7B5]/5 text-[#00A7B5]"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-950"
                      }`}
                    onClick={() => setActiveSkill(val as Skill)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>

              {/* Bounty rows */}
              <div className="flex flex-col">
                {filtered.map((b) => (
                  <BountyListItem key={b.id} bounty={b} onClick={() => setSelected(b)} />
                ))}
              </div>

              <Button variant="outline" className="mt-4 w-full text-[13px] text-zinc-500">
                View All <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
              </Button>

              {/* ── Grants section ── */}
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-zinc-950">Grants</h3>
                <div className="mb-4 flex flex-wrap gap-2">
                  {["All", "Content", "Design", "Development", "Other"].map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-normal transition-colors ${s === "All"
                        ? "border-[#B7ACE8] bg-[#B7ACE8]/5 text-[#B7ACE8]"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-950"
                        }`}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col">
                  {GRANTS.map((g) => (
                    <div key={g.id} className="flex -mx-2 items-center gap-3 rounded-xl border border-transparent p-3 hover:bg-white/50 hover:backdrop-blur-sm hover:border-zinc-200/30 hover:shadow-sm transition-all duration-200">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-[11px] font-semibold text-white"
                        style={{ background: g.bg }}
                      >
                        {g.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 truncate text-[13px] font-medium text-zinc-950">
                          {g.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                          <span>{g.org}</span>
                          <CheckBadgeIcon className="h-3 w-3 text-[#00A7B5]" />
                          <span className="text-zinc-300">|</span>
                          <Badge variant="outline" className="h-5 border-[#B7ACE8]/30 bg-[#B7ACE8]/5 px-2 text-[10px] font-normal text-[#B7ACE8]">
                            Grant
                          </Badge>
                          <span className="text-zinc-300">|</span>
                          <span>Rolling deadline</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                        <span className="text-[13px] font-medium text-zinc-950">{g.prize}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full text-[13px] text-zinc-500">
                  View All <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </main>

            {/* ── Sidebar ── */}
            <aside className="hidden p-5 md:block">
              {/* Stats */}
              <div className="mb-5 border-b border-zinc-200/30 pb-5">
                <div className="flex items-center gap-3 py-1.5">
                  <div className="shrink-0 text-[#00A7B5] bg-[#00A7B5]/10 p-1.5 rounded-md">
                    <BanknotesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-zinc-950">₱2,418,500</div>
                    <div className="text-[11px] text-zinc-400">Total Value Available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1.5">
                  <div className="shrink-0 text-[#B7ACE8] bg-[#B7ACE8]/10 p-1.5 rounded-md">
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-zinc-950">38</div>
                    <div className="text-[11px] text-zinc-400">Opportunities Listed</div>
                  </div>
                </div>
              </div>

              {/* Promo card */}
              <Card className="mb-6 overflow-hidden border-zinc-200/30 shadow-sm shadow-indigo-900/5">
                <div className="bg-stellar-fluid flex items-center justify-center gap-2 p-5 text-xl font-extrabold tracking-widest text-white border-b border-black/15 shadow-sm">
                  <SparklesIcon className="h-5 w-5 text-[#FDDA24]" /> STELLAR EARN
                </div>
                <div className="p-3.5">
                  <div className="mb-1.5 text-[13px] font-semibold leading-tight text-zinc-950">
                    Are you a dev? We have prizes worth ₱430,000+ for you
                  </div>
                  <div className="mb-3 text-[11px] leading-relaxed text-zinc-500">
                    Submit to any StellarEarn side tracks and stand to win. Deadline May 31.
                  </div>
                  <Button className="h-8 w-full bg-[#FDDA24] text-xs font-semibold text-[#0F0F0F] hover:bg-[#ebd020]">
                    View Tracks
                  </Button>
                </div>
              </Card>

              {/* How it works */}
              <div className="mb-6 border-b border-zinc-200/30 pb-6">
                <p className="mb-3 text-[10px] font-bold tracking-widest text-zinc-400">HOW IT WORKS</p>
                {[
                  { icon: <UserIcon className="h-4 w-4" />, title: "Connect your Wallet", sub: "Sign in with Freighter" },
                  { icon: <BoltIcon className="h-4 w-4" />, title: "Pay to Submit", sub: "Small XLM fee, winners get it back" },
                  { icon: <CurrencyDollarIcon className="h-4 w-4" />, title: "Get Paid On-chain", sub: "Soroban escrow releases on approval" },
                  { icon: <DevicePhoneMobileIcon className="h-4 w-4" />, title: "Cash Out to GCash", sub: "Withdraw PHP via local anchor" },
                ].map((s, i) => (
                  <div key={i} className="mb-2.5 flex items-start gap-2">
                    <span className="mt-px shrink-0 text-[#00A7B5]">{s.icon}</span>
                    <div>
                      <div className="mb-px text-[12px] font-medium text-[#00A7B5]">{s.title}</div>
                      <div className="text-[11px] leading-snug text-zinc-400">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Earners */}
              <div className="mb-6">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500">RECENT EARNERS</span>
                  <a href="#" className="flex items-center text-[11px] text-[#00A7B5] no-underline hover:underline">Leaderboard <ArrowRightIcon className="ml-0.5 h-3 w-3" /></a>
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
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500">RECENT ACTIVITY</span>
                  <a href="#" className="flex items-center text-[11px] text-[#00A7B5] no-underline hover:underline">View All <ArrowRightIcon className="ml-0.5 h-3 w-3" /></a>
                </div>
                <InfiniteCarousel id="activity" speed={30}>
                  {ACTIVITIES.map((a, i) => (
                    <ActivityRow key={i} {...a} />
                  ))}
                </InfiniteCarousel>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}