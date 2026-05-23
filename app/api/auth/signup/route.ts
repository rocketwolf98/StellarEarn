import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { StrKey } from "@stellar/stellar-sdk";
import { randomBytes, scryptSync } from "node:crypto";
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  password: z.string().min(6).max(100),
  stellar_public_key: z.string().min(56).max(56),
  role: z.enum(["earner", "sponsor"]).default("earner"),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * POST /api/auth/signup
 * Upserts a user record in the public.users table after wallet auth.
 * Does NOT handle Supabase Auth — that's handled by SEP-10 challenge flow.
 * This stores the profile data tied to the wallet address.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = SignUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, username, password, stellar_public_key, role } = parsed.data;
  const passwordHash = hashPassword(password);

  if (!StrKey.isValidEd25519PublicKey(stellar_public_key)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  // Check if username is taken
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  // Upsert by stellar_public_key (idempotent for re-registrations)
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email,
        username,
        stellar_public_key,
        role,
        password_hash: passwordHash,
        auth_provider: "sep10",
        account_status: "active",
      },
      { onConflict: "stellar_public_key" }
    )
    .select("id, username, role, stellar_public_key")
    .single();

  if (error) {
    console.error("[POST /api/auth/signup]", error.message);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * GET /api/auth/signup?stellar_public_key=<key>
 * Looks up a user by wallet address — used to hydrate session after Freighter connect.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("stellar_public_key");

  if (!key) {
    return NextResponse.json({ error: "stellar_public_key required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, stellar_public_key, avatar_url, bio, location")
    .eq("stellar_public_key", key)
    .maybeSingle();

  if (error) {
    console.error("[GET /api/auth/signup]", error.message);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: data });
}
