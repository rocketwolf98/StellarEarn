"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthModal } from "@/components/features/auth-modal";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<"earner" | "sponsor" | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");

  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: "signin" | "signup" }>;
      if (customEvent.detail?.tab) {
        setAuthModalTab(customEvent.detail.tab);
      }
      setIsAuthModalOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("open-auth-modal", handleOpenAuth);
    };
  }, []);

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
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
        <div className="flex items-center">
          <Link href="/" className="mr-7 flex items-center gap-2 text-[15px] font-semibold text-foreground no-underline">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-stellar-yellow text-[10px] font-bold text-stellar-black">
              SE
            </div>
            <span>StellarEarn</span>
          </Link>
          <nav className="flex gap-1">
            {[
              { label: "Bounties", href: "/?tab=bounties" },
              { label: "Projects", href: "/?tab=projects" },
              { label: "Grants", href: "/#grants" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex h-14 items-center border-b-2 border-transparent px-3 text-[13px] font-medium text-muted-foreground no-underline hover:text-foreground hover:border-stellar-teal/60 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-all duration-200"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-stellar-yellow animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-all duration-200">
            Become a Sponsor <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          </Button>
 
          {walletConnected || username ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-3.5 pr-2 py-0.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground">
                  {username ? `@${username}` : `${walletAddress?.substring(0, 6)}...${walletAddress?.slice(-4)}`}
                </span>
                {role && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    role === "sponsor" 
                      ? "bg-stellar-yellow/10 text-stellar-yellow border border-stellar-yellow/20" 
                      : "bg-stellar-teal/10 text-stellar-teal border border-stellar-teal/20"
                  }`}>
                    {role}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                className="h-8 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-all duration-200"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-8 text-xs border-border text-foreground hover:bg-muted cursor-pointer transition-all duration-200"
                onClick={() => {
                  setAuthModalTab("signin");
                  setIsAuthModalOpen(true);
                }}
              >
                Login
              </Button>
              <Button 
                className="h-8 bg-stellar-yellow text-xs font-semibold text-stellar-black hover:bg-stellar-yellow/90 hover:-translate-y-[1px] hover:shadow-sm cursor-pointer transition-all duration-200"
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

