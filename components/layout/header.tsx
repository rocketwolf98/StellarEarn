"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Header() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <a href="#" className="mr-7 flex items-center gap-2 text-[15px] font-semibold text-zinc-950 no-underline">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6c47ff] text-[10px] font-bold text-white">
            SE
          </div>
          <span>StellarEarn</span>
        </a>
        <nav className="flex">
          {["Bounties", "Projects", "Grants"].map((item) => (
            <a
              key={item}
              href="#"
              className="flex h-14 items-center border-b-2 border-transparent px-3 text-[13px] text-zinc-500 no-underline hover:text-zinc-950"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="h-8 gap-1.5 text-xs text-zinc-500 hover:bg-zinc-100">
          Become a Sponsor <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
        </Button>
        <Button
          variant="outline"
          className={`h-8 text-xs ${
            walletConnected
              ? "border-[#6c47ff]/30 bg-[#6c47ff]/5 text-[#6c47ff]"
              : "text-zinc-950"
          }`}
          onClick={() => {
            setWalletConnected(true);
            toast.success("Freighter wallet connected");
          }}
        >
          {walletConnected ? "GBXY...7K2M" : "Login"}
        </Button>
        <Button className="h-8 bg-[#6c47ff] text-xs font-medium text-white hover:bg-[#5a38e0]">
          Sign Up
        </Button>
      </div>
    </header>
  );
}
