import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

const ConfirmSchema = z.object({
  challenge_id: z.string().uuid(),
  stellar_public_key: z.string().length(56),
  challenge: z.string().min(10),
  signature_base64: z.string().min(20),
});

function hashChallenge(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * POST /api/auth/wallet/confirm
 * Verifies wallet signature against a pending challenge and marks wallet as verified.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = ConfirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { challenge_id, stellar_public_key, challenge, signature_base64 } = parsed.data;

  if (!StrKey.isValidEd25519PublicKey(stellar_public_key)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  const challengeHash = hashChallenge(challenge);

  const { data: challengeRow, error: challengeError } = await supabase
    .from("wallet_auth_challenges")
    .select("id, stellar_public_key, challenge_hash, expires_at, consumed_at")
    .eq("id", challenge_id)
    .maybeSingle();

  if (challengeError) {
    console.error("[POST /api/auth/wallet/confirm] challenge lookup:", challengeError.message);
    return NextResponse.json({ error: "Challenge lookup failed" }, { status: 500 });
  }

  if (!challengeRow) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  if (challengeRow.stellar_public_key !== stellar_public_key) {
    return NextResponse.json({ error: "Challenge wallet mismatch" }, { status: 401 });
  }

  if (challengeRow.challenge_hash !== challengeHash) {
    return NextResponse.json({ error: "Challenge mismatch" }, { status: 401 });
  }

  if (challengeRow.consumed_at) {
    return NextResponse.json({ error: "Challenge already consumed" }, { status: 409 });
  }

  if (new Date(challengeRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 401 });
  }

  let signatureBytes: Buffer;
  try {
    signatureBytes = Buffer.from(signature_base64, "base64");
  } catch {
    return NextResponse.json({ error: "Invalid signature encoding" }, { status: 400 });
  }

  const challengeBytes = Buffer.from(challenge, "utf8");
  const verified = Keypair.fromPublicKey(stellar_public_key).verify(challengeBytes, signatureBytes);

  if (!verified) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  const { error: consumeError } = await supabase
    .from("wallet_auth_challenges")
    .update({ consumed_at: nowIso })
    .eq("id", challenge_id)
    .is("consumed_at", null);

  if (consumeError) {
    console.error("[POST /api/auth/wallet/confirm] consume challenge:", consumeError.message);
    return NextResponse.json({ error: "Failed to consume challenge" }, { status: 500 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      stellar_public_key,
      auth_provider: "sep10",
      account_status: "active",
      wallet_verified_at: nowIso,
      last_login_at: nowIso,
    })
    .eq("stellar_public_key", stellar_public_key)
    .select("id, username, role, stellar_public_key, wallet_verified_at")
    .maybeSingle();

  if (userError) {
    console.error("[POST /api/auth/wallet/confirm] user update:", userError.message);
    return NextResponse.json({ error: "Failed to update user session status" }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    requires_profile: !user,
    user: user ?? null,
  });
}
