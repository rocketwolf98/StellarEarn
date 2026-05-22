import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const SubmitSchema = z.object({
  gig_id: z.string().uuid(),
  worker_user_id: z.string().uuid(),
  worker_name: z.string().max(80).optional(),
  submission_url: z.string().url(),
  description: z.string().max(500).optional(),
  twitter_url: z.string().url().optional().or(z.literal("")),
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

  const { data, error } = await supabase
    .from("gig_submissions")
    .insert({
      gig_id,
      worker_user_id,
      worker_name: worker_name ?? null,
      submission_url,
      description: description ?? null,
      twitter_url: twitter_url || null,
      status: "pending_review",
    })
    .select("id, status, submitted_at")
    .single();

  if (error) {
    console.error("[POST /api/submissions]", error.message);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
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
      `id, submission_url, description, twitter_url, status, submitted_at, payout_tx_hash,
       gigs ( id, slug, title, org, initials, bg, color, prize_php, reward_amount, reward_unit )`
    )
    .eq("worker_user_id", workerUserId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[GET /api/submissions]", error.message);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }

  return NextResponse.json(data);
}
