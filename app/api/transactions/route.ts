import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

const TransactionSchema = z.object({
  user_id: z.string().uuid().optional(),
  gig_id: z.string().uuid().optional(),
  submission_id: z.string().uuid().optional(),
  stellar_public_key: z.string().length(56),
  tx_hash: z.string().min(8).max(120),
  network: z.enum(["testnet", "mainnet"]).default("testnet"),
  status: z
    .enum(["pending_signature", "signed", "submitted", "confirmed", "failed"])
    .default("submitted"),
  operation: z.string().min(2).max(80),
  amount_stroops: z.number().int().nonnegative().optional(),
  asset_code: z.string().max(12).optional(),
  asset_issuer: z.string().max(56).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  confirmed_at: z.string().datetime().optional(),
});

/**
 * GET /api/transactions?stellar_public_key=<wallet>
 * Returns recent transaction records for a wallet.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("stellar_public_key");

  if (!wallet) {
    return NextResponse.json({ error: "stellar_public_key required" }, { status: 400 });
  }

  if (!StrKey.isValidEd25519PublicKey(wallet)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, tx_hash, network, status, operation, amount_stroops, asset_code, confirmed_at, created_at")
    .eq("stellar_public_key", wallet)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[GET /api/transactions]", error.message);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/transactions
 * Ingests transaction records from client/server blockchain actions.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = TransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  if (!StrKey.isValidEd25519PublicKey(payload.stellar_public_key)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .upsert(
      {
        ...payload,
        user_id: payload.user_id ?? null,
        gig_id: payload.gig_id ?? null,
        submission_id: payload.submission_id ?? null,
        amount_stroops: payload.amount_stroops ?? null,
        asset_code: payload.asset_code ?? null,
        asset_issuer: payload.asset_issuer ?? null,
        metadata: payload.metadata ?? {},
        confirmed_at: payload.confirmed_at ?? null,
      },
      { onConflict: "tx_hash" }
    )
    .select("id, tx_hash, status, operation, created_at")
    .single();

  if (error) {
    console.error("[POST /api/transactions]", error.message);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
