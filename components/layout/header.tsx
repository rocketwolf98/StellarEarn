"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthModal } from "@/components/features/auth-modal";

export function Header() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<"earner" | "sponsor" | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");

  const handleAuthSuccess = (
    address?: string, 
    name?: string, 
    selectedRole?: "earner" | "sponsor"
  ) => {
    if (address) {
      setWalletConnected(true);
      setWalletAddress(address);
    }
    if (name) {
      setUsername(name);
    }
    if (selectedRole) {
      setRole(selectedRole);
    }
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setUsername(null);
    setRole(null);
    setWalletAddress(null);
    toast.info("Logged out successfully");
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200/50 bg-white/70 backdrop-blur-md px-6">
        <div className="flex items-center">
          <a href="#" className="mr-7 flex items-center gap-2 text-[15px] font-semibold text-zinc-950 no-underline">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#FDDA24] text-[10px] font-bold text-[#0F0F0F]">
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

          {walletConnected || username ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/50 pl-3.5 pr-2 py-0.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {username ? `@${username}` : `${walletAddress?.substring(0, 6)}...${walletAddress?.slice(-4)}`}
                </span>
                {role && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    role === "sponsor" 
                      ? "bg-[#FDDA24]/10 text-[#d4b51c] border border-[#FDDA24]/20" 
                      : "bg-[#00A7B5]/10 text-[#00A7B5] border border-[#00A7B5]/20"
                  }`}>
                    {role}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                className="h-8 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-8 text-xs text-zinc-950 dark:text-zinc-50 hover:bg-zinc-50"
                onClick={() => {
                  setAuthModalTab("signin");
                  setIsAuthModalOpen(true);
                }}
              >
                Login
              </Button>
              <Button 
                className="h-8 bg-[#FDDA24] text-xs font-semibold text-[#0F0F0F] hover:bg-[#ebd020]"
                onClick={() => {
                  setAuthModalTab("signup");
                  setIsAuthModalOpen(true);
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />
    </>
  );
}

