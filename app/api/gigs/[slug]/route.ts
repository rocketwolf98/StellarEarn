import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ slug: string }> };

/**
 * GET /api/gigs/[slug]
 * Returns a single gig with its submissions (joined with worker username + avatar).
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: gig, error: gigError } = await supabase
    .from("gigs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (gigError || !gig) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  const { data: submissions, error: subError } = await supabase
    .from("gig_submissions")
    .select(
      "id, submission_url, description, twitter_url, status, submitted_at, payout_tx_hash, worker_user_id, worker_name, approved_at"
    )
    .eq("gig_id", gig.id)
    .order("submitted_at", { ascending: false });

  if (subError) {
    console.error("[GET /api/gigs/[slug]] submissions error:", subError.message);
  }

  return NextResponse.json({ gig, submissions: submissions ?? [] });
}
