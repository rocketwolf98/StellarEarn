"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  Mail, 
  Lock, 
  User, 
  Check, 
  Loader2, 
  ShieldCheck, 
  UserSquare2, 
  Building2 
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (walletAddress?: string, username?: string, role?: "earner" | "sponsor") => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultTab = "signin",
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Wallet state
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  
  // Sign In states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // Sign Up states
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"earner" | "sponsor">("earner");
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Mock Wallet connection
  const handleWalletConnect = () => {
    setIsWalletConnecting(true);
    toast.loading("Connecting Freighter wallet...", { id: "wallet-conn" });

    // Simulate ledger/SEP-10 challenge round-trip
    setTimeout(() => {
      setIsWalletConnecting(false);
      const mockAddress = "GBXY3K7K2M6H2N7K3S4G7T9M2X5W9K1L9P";
      toast.success("Wallet connected successfully!", {
        id: "wallet-conn",
        description: `Authenticated: ${mockAddress.substring(0, 6)}...${mockAddress.slice(-4)}`,
      });
      onAuthSuccess(mockAddress, "StellarUser", selectedRole);
      onClose();
    }, 1500);
  };

  // Credentials Sign In
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!signInEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (signInPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSignInLoading(true);
    setTimeout(() => {
      setIsSignInLoading(false);
      const displayUsername = signInEmail.split("@")[0];
      toast.success("Signed in successfully!", {
        description: `Welcome back, ${displayUsername}`,
      });
      onAuthSuccess(undefined, displayUsername);
      onClose();
    }, 1200);
  };

  // Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !signUpUsername || !signUpPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!signUpEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSignUpLoading(true);
    setTimeout(() => {
      setIsSignUpLoading(false);
      toast.success("Account created successfully!", {
        description: `Welcome to StellarEarn, @${signUpUsername}!`,
      });
      onAuthSuccess(undefined, signUpUsername, selectedRole);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl overflow-hidden">
        {/* Sleek top cosmic bar indicator */}
        <div className="absolute top-0 inset-x-0 h-1 bg-stellar-fluid" />

        <DialogHeader className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FDDA24] text-[10px] font-bold text-[#0F0F0F] ring-2 ring-[#FDDA24]/20 animate-pulse">
              SE
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              StellarEarn Portal
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Access Stellar&apos;s premier native grants & bounties marketplace.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2 w-full"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
            <TabsTrigger 
              value="signin" 
              className="py-1.5 text-xs font-semibold data-active:bg-white data-active:text-zinc-900 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-100"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="py-1.5 text-xs font-semibold data-active:bg-white data-active:text-zinc-900 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-100"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* SIGN IN CONTENT */}
          <TabsContent value="signin" className="mt-4 flex flex-col gap-4">
            {/* Wallet Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isWalletConnecting}
              onClick={handleWalletConnect}
              className="relative flex h-10 w-full items-center justify-center gap-2 border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {isWalletConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-stellar-teal" />
                  <span className="text-xs font-medium">Authorizing via SEP-10...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 text-[#FDDA24] fill-[#FDDA24]/10" />
                  <span className="text-xs font-semibold">Connect Freighter Wallet</span>
                </>
              )}
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <span className="relative bg-white px-2.5 text-[10px] uppercase font-bold text-zinc-400 dark:bg-zinc-950">
                Or email credentials
              </span>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
              <div className="space-y-1">
                <Label htmlFor="signin-email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-stellar-teal/30 focus-visible:border-stellar-teal dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </Label>
                  <a href="#" className="text-[10px] text-stellar-teal hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-stellar-teal/30 focus-visible:border-stellar-teal dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSignInLoading}
                className="mt-2 h-9 w-full bg-zinc-950 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-stellar-yellow dark:text-stellar-black dark:hover:bg-[#ebd020]"
              >
                {isSignInLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* SIGN UP CONTENT */}
          <TabsContent value="signup" className="mt-4 flex flex-col gap-4">
            <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Select Profile Type
                </Label>
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  <div
                    onClick={() => setSelectedRole("earner")}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-all",
                      selectedRole === "earner"
                        ? "border-stellar-teal bg-stellar-teal/5 ring-1 ring-stellar-teal"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <UserSquare2 className={cn("h-4 w-4", selectedRole === "earner" ? "text-stellar-teal" : "text-zinc-500")} />
                      {selectedRole === "earner" && (
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-stellar-teal text-[7px] text-white">
                          <Check className="h-2 w-2 stroke-[4px]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                      Earner
                    </span>
                    <span className="text-[9px] leading-tight text-zinc-500">
                      Build products, solve tasks & claim grants.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedRole("sponsor")}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-all",
                      selectedRole === "sponsor"
                        ? "border-[#FDDA24] bg-[#FDDA24]/5 ring-1 ring-[#FDDA24]"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className={cn("h-4 w-4", selectedRole === "sponsor" ? "text-[#e5c51c]" : "text-zinc-500")} />
                      {selectedRole === "sponsor" && (
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FDDA24] text-[7px] text-[#0F0F0F]">
                          <Check className="h-2 w-2 stroke-[4px]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                      Sponsor
                    </span>
                    <span className="text-[9px] leading-tight text-zinc-500">
                      Fund bounties, review work & build community.
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-username" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="signup-username"
                    placeholder="stellar_pioneer"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-stellar-teal/30 focus-visible:border-stellar-teal dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="address@domain.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-stellar-teal/30 focus-visible:border-stellar-teal dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-stellar-teal/30 focus-visible:border-stellar-teal dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSignUpLoading}
                className="mt-2 h-9 w-full bg-stellar-fluid text-xs font-semibold text-white hover:brightness-95 hover:shadow"
              >
                {isSignUpLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create StellarEarn Profile"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Security footer stamp */}
        <div className="mt-4 flex items-center justify-center gap-1 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-900">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span>Freighter uses secure SEP-10 cryptography</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
