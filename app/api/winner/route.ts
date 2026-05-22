import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const SelectWinnerSchema = z.object({
  submission_id: z.string().uuid(),
  gig_id: z.string().uuid(),
  approver_user_id: z.string().uuid(),
  payout_tx_hash: z.string().min(1).optional(),
});

/**
 * POST /api/gigs/[slug]/winner
 * Marks a submission as the winner and closes the gig.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = SelectWinnerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { submission_id, gig_id, approver_user_id, payout_tx_hash } = parsed.data;

  // Mark submission as winner
  const { error: subError } = await supabase
    .from("gig_submissions")
    .update({
      status: "approved",
      approved_by_user_id: approver_user_id,
      approved_at: new Date().toISOString(),
      payout_tx_hash: payout_tx_hash ?? null,
    })
    .eq("id", submission_id);

  if (subError) {
    console.error("[POST /api/winner] submission update error:", subError.message);
    return NextResponse.json({ error: "Failed to select winner" }, { status: 500 });
  }

  // Close the gig
  const { error: gigError } = await supabase
    .from("gigs")
    .update({
      status: "closed",
      paid_by_user_id: approver_user_id,
      paid_at: new Date().toISOString(),
      payment_tx_hash: payout_tx_hash ?? null,
    })
    .eq("id", gig_id);

  if (gigError) {
    console.error("[POST /api/winner] gig update error:", gigError.message);
    return NextResponse.json({ error: "Failed to close gig" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
