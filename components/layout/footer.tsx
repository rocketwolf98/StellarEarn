import { SparklesIcon, GlobeAltIcon, ChevronUpDownIcon, ViewColumnsIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-10 p-8 pb-8 pt-10 md:flex-row md:px-8">
        <div className="max-w-[280px]">
          <div className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-stellar-yellow text-[10px] font-bold text-stellar-black">
              SE
            </div>
            <span>StellarEarn</span>
          </div>
          <p className="mb-3.5 text-xs leading-[1.6] text-muted-foreground">
            Discover bounties, projects, and grants from Stellar DAOs and ecosystem projects. PHP local payouts, on-chain Soroban escrow.
          </p>
          <div className="mb-4 flex gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground no-underline hover:text-foreground transition-colors">GitHub</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground no-underline hover:text-foreground transition-colors">X</a>
            <a href="mailto:contact@stellarearn.com" className="text-xs text-muted-foreground no-underline hover:text-foreground transition-colors">Email</a>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 bg-background">
            <span className="text-[9px] tracking-[0.06em] text-muted-foreground">POWERED BY</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <SparklesIcon className="w-3.5 h-3.5 text-stellar-yellow" /> STELLAR
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-12">
          {[
            {
              title: "Opportunities",
              links: [
                { label: "Bounties", href: "/?tab=bounties" },
                { label: "Projects", href: "/?tab=projects" },
                { label: "Grants", href: "/#grants" },
              ],
            },
            {
              title: "Categories",
              links: [
                { label: "Content", href: "/?skill=content" },
                { label: "Design", href: "/?skill=design" },
                { label: "Development", href: "/?skill=dev" },
                { label: "Research", href: "/?skill=research" },
              ],
            },
            {
              title: "About",
              links: [
                { label: "FAQ", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Contact Us", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                {col.title}
              </div>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="text-[13px] text-muted-foreground no-underline hover:text-stellar-teal transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-8 py-3 text-xs text-muted-foreground bg-background/40">
        <span>© 2025 StellarEarn. All rights reserved.</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">SKILL</span>
          <span className="flex items-center gap-1 cursor-pointer text-xs text-foreground hover:text-stellar-teal transition-colors">
            <ViewColumnsIcon className="w-3.5 h-3.5 text-muted-foreground" /> All Skills <ChevronUpDownIcon className="w-3 h-3" />
          </span>
          <span className="ml-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">REGION</span>
          <span className="flex items-center gap-1 cursor-pointer text-xs text-foreground hover:text-stellar-teal transition-colors">
            <GlobeAltIcon className="w-3.5 h-3.5 text-muted-foreground" /> Global <ChevronUpDownIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
    </footer>
  );
}
