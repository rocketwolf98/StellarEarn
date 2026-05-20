export function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-10 p-8 pb-8 pt-10 md:flex-row md:px-8">
        <div className="max-w-[280px]">
          <div className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold text-zinc-950">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6c47ff] text-[10px] font-bold text-white">
              SE
            </div>
            <span>StellarEarn</span>
          </div>
          <p className="mb-3.5 text-xs leading-[1.6] text-zinc-500">
            Discover bounties, projects, and grants from Stellar DAOs and ecosystem projects. Earn in PHP, build on-chain reputation.
          </p>
          <div className="mb-4 flex gap-3">
            <a href="#" className="text-xs text-zinc-500 no-underline hover:text-zinc-950">GitHub</a>
            <a href="#" className="text-xs text-zinc-500 no-underline hover:text-zinc-950">X</a>
            <a href="#" className="text-xs text-zinc-500 no-underline hover:text-zinc-950">Email</a>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5">
            <span className="text-[9px] tracking-[0.06em] text-zinc-400">POWERED BY</span>
            <span className="text-xs font-semibold text-zinc-950">✦ STELLAR</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-12">
          {[
            { title: "Opportunities", links: ["Bounties", "Projects", "Grants"] },
            { title: "Categories", links: ["Content", "Design", "Development", "Research"] },
            { title: "About", links: ["FAQ", "Terms", "Privacy Policy", "Contact Us"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-zinc-500">
                {col.title}
              </div>
              {col.links.map((l) => (
                <a key={l} href="#" className="text-[13px] text-zinc-700 no-underline hover:text-[#6c47ff]">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 px-8 py-3 text-xs text-zinc-400">
        <span>© 2025 StellarEarn. All rights reserved.</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-400">SKILL</span>
          <span className="cursor-pointer text-xs text-zinc-700">● All Skills ↕</span>
          <span className="ml-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-400">REGION</span>
          <span className="cursor-pointer text-xs text-zinc-700">🌐 Global ↕</span>
        </div>
      </div>
    </footer>
  );
}
