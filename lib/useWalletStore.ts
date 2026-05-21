import { create } from "zustand";

interface WalletState {
  wallet: string | null;
  setWallet: (wallet: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
}));