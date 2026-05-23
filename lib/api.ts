import type { Tables } from "@/lib/database.types";

// DB row shapes
export type GigRow = Tables<"gigs">;
export type SubmissionRow = Tables<"gig_submissions">;
export type TransactionRow = Tables<"transactions">;

// ─── Helper: convert DB status → display label ──────────────────────────────

export function gigStatusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "Open",
    pending_review: "Under Review",
    closed: "Closed",
    paid: "Paid",
  };
  return map[status] ?? status;
}

// ─── Deadline helpers ───────────────────────────────────────────────────────

export function deadlineDue(deadlineAt: string): string {
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Ended";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays}d`;
}

// ─── API fetch helpers ──────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch all live gigs from the API.
 * Falls back to an empty array on error (homepage uses mock data as overlay).
 */
export async function fetchGigs(): Promise<GigRow[]> {
  try {
    const res = await fetch(`${BASE}/api/gigs`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as GigRow[];
  } catch {
    return [];
  }
}

/**
 * Fetch a single gig + its submissions by slug.
 */
export async function fetchGig(
  slug: string
): Promise<{ gig: GigRow; submissions: SubmissionRow[] } | null> {
  try {
    const res = await fetch(`${BASE}/api/gigs/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { gig: GigRow; submissions: SubmissionRow[] };
  } catch {
    return null;
  }
}

/**
 * POST a new submission.
 */
export async function postSubmission(payload: {
  gig_id: string;
  worker_user_id: string;
  worker_name?: string;
  submission_url: string;
  description?: string;
  twitter_url?: string;
}): Promise<{ id: string; status: string } | { error: string }> {
  try {
    const res = await fetch(`${BASE}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Submission failed" };
    }
    return data as { id: string; status: string };
  } catch {
    return { error: "Network error" };
  }
}

/**
 * Fetch my submissions by worker_user_id.
 */
export async function fetchMySubmissions(workerUserId: string): Promise<SubmissionRow[]> {
  try {
    const res = await fetch(
      `${BASE}/api/submissions?worker_user_id=${encodeURIComponent(workerUserId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as SubmissionRow[];
  } catch {
    return [];
  }
}

/**
 * Select the winner for a gig.
 */
export async function selectWinner(payload: {
  submission_id: string;
  gig_id: string;
  approver_user_id: string;
  payout_tx_hash?: string;
}): Promise<{ success: true } | { error: string }> {
  try {
    const res = await fetch(`${BASE}/api/winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Failed to select winner" };
    }
    return { success: true };
  } catch {
    return { error: "Network error" };
  }
}

/**
 * Look up a user by stellar_public_key. Returns null if not registered.
 */
export async function lookupUser(
  stellarPublicKey: string
): Promise<{ id: string; username: string; role: string } | null> {
  try {
    const res = await fetch(
      `${BASE}/api/auth/signup?stellar_public_key=${encodeURIComponent(stellarPublicKey)}`,
      { cache: "no-store" }
    );
    const data = (await res.json()) as { user: { id: string; username: string; role: string } | null };
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Register a new user profile after Freighter connect.
 */
export async function registerUser(payload: {
  email: string;
  username: string;
  stellar_public_key: string;
  role: "earner" | "sponsor";
}): Promise<{ id: string; username: string; role: string } | { error: string }> {
  try {
    const res = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Registration failed" };
    }
    return data as { id: string; username: string; role: string };
  } catch {
    return { error: "Network error" };
  }
}

/**
 * Request wallet auth challenge text for signature confirmation.
 */
export async function requestWalletChallenge(
  stellarPublicKey: string
): Promise<{ challenge_id: string; challenge: string; expires_at: string } | { error: string }> {
  try {
    const res = await fetch(`${BASE}/api/auth/wallet/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stellar_public_key: stellarPublicKey }),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Failed to issue challenge" };
    }
    return data as { challenge_id: string; challenge: string; expires_at: string };
  } catch {
    return { error: "Network error" };
  }
}

/**
 * Confirm wallet signature for an issued challenge.
 */
export async function confirmWalletChallenge(payload: {
  challenge_id: string;
  stellar_public_key: string;
  challenge: string;
  signature_base64: string;
  signer_address?: string;
}): Promise<
  | { authenticated: true; requires_profile: boolean; user: { id: string; username: string; role: string } | null }
  | { error: string }
> {
  try {
    const res = await fetch(`${BASE}/api/auth/wallet/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Wallet confirmation failed" };
    }
    return data as {
      authenticated: true;
      requires_profile: boolean;
      user: { id: string; username: string; role: string } | null;
    };
  } catch {
    return { error: "Network error" };
  }
}

/**
 * Ingest a transaction record through API.
 */
export async function recordTransaction(payload: {
  user_id?: string;
  gig_id?: string;
  submission_id?: string;
  stellar_public_key: string;
  tx_hash: string;
  network?: "testnet" | "mainnet";
  status?: "pending_signature" | "signed" | "submitted" | "confirmed" | "failed";
  operation: string;
  amount_stroops?: number;
  asset_code?: string;
  asset_issuer?: string;
  metadata?: Record<string, unknown>;
  confirmed_at?: string;
}): Promise<{ id: string; tx_hash: string; status: string; operation: string } | { error: string }> {
  try {
    const res = await fetch(`${BASE}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      return { error: (data as { error?: string }).error ?? "Failed to record transaction" };
    }
    return data as { id: string; tx_hash: string; status: string; operation: string };
  } catch {
    return { error: "Network error" };
  }
}
