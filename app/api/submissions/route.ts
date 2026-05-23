import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const SubmitSchema = z.object({
  gig_id: z.string().min(1),                                      // any non-empty string — UUID in prod, numeric string in mock
  worker_user_id: z.string().uuid(),
  worker_name: z.string().max(80).optional(),
  submission_url: z.string().min(1),                               // normalized to https:// in the modal
  description: z.string().max(500).optional(),
  twitter_url: z.string().optional().or(z.literal("")),
});

/**
 * POST /api/submissions
 * Creates a new gig submission. The counter trigger auto-increments gigs.submissions.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = SubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { gig_id, worker_user_id, worker_name, submission_url, description, twitter_url } =
    parsed.data;

  // Ensure target gig exists before insert to avoid generic FK failures.
  const { data: gig, error: gigLookupError } = await supabase
    .from("gigs")
    .select("id")
    .eq("id", gig_id)
    .maybeSingle();

  if (gigLookupError) {
    console.error("[POST /api/submissions] gig lookup", gigLookupError.message);
    return NextResponse.json({ error: "Failed to validate gig" }, { status: 500 });
  }

  if (!gig) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  const { data: existingWorker, error: workerLookupError } = await supabase
    .from("users")
    .select("id")
    .eq("id", worker_user_id)
    .maybeSingle();

  if (workerLookupError) {
    console.error("[POST /api/submissions] worker lookup", workerLookupError.message);
    return NextResponse.json({ error: "Failed to validate worker" }, { status: 500 });
  }

  if (!existingWorker) {
    return NextResponse.json(
      { error: "Authenticated user not found. Please sign in again." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("gig_submissions")
    .insert({
      gig_id,
      worker_user_id,
      worker_name: worker_name ?? null,
      submission_url,
      notes: description ?? null,
      twitter_url: twitter_url && twitter_url.length > 0 ? twitter_url : null,
      status: "pending_review",
    })
    .select("id, status, submitted_at")
    .single();

  if (error) {
    console.error("[POST /api/submissions]", error.message);
    return NextResponse.json({ error: "Failed to submit", details: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * GET /api/submissions?worker_user_id=<uuid>
 * Returns all submissions for the current user, joined with gig info.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerUserId = searchParams.get("worker_user_id");

  if (!workerUserId) {
    return NextResponse.json({ error: "worker_user_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gig_submissions")
    .select(
      `id, submission_url, description:notes, status, submitted_at, payout_tx_hash,
       gigs ( id, slug, title, org, initials, prize_php, reward_amount, reward_unit )`
    )
    .eq("worker_user_id", workerUserId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[GET /api/submissions]", error.message);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }

  return NextResponse.json(data);
}
