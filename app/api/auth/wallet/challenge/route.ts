import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

const ChallengeSchema = z.object({
  stellar_public_key: z.string().length(56),
});

function hashChallenge(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * POST /api/auth/wallet/challenge
 * Issues a short-lived challenge string to be signed by the wallet.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = ChallengeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { stellar_public_key } = parsed.data;

  if (!StrKey.isValidEd25519PublicKey(stellar_public_key)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  const nonce = randomBytes(24).toString("base64url");
  const challengeText = `stellarearn-auth:${stellar_public_key}:${nonce}`;
  const challengeHash = hashChallenge(challengeText);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("wallet_auth_challenges")
    .insert({
      stellar_public_key,
      challenge_hash: challengeHash,
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();

  if (error) {
    console.error("[POST /api/auth/wallet/challenge]", error.message);
    return NextResponse.json({ error: "Failed to issue challenge" }, { status: 500 });
  }

  return NextResponse.json(
    {
      challenge_id: data.id,
      challenge: challengeText,
      expires_at: data.expires_at,
    },
    { status: 201 }
  );
}
