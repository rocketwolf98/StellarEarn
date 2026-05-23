import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateGigSchema = z.object({
  title: z.string().min(3).max(140),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  org: z.string().min(2).max(120),
  initials: z.string().min(1).max(8),
  description: z.string().min(10).max(5000),
  desc_short: z.string().max(300).optional(),
  prize_php: z.number().nonnegative(),
  reward_amount: z.number().nonnegative(),
  reward_unit: z.string().min(2).max(20).default("USDC"),
  fee_xlm: z.number().nonnegative().default(0),
  type: z.enum(["bounty", "project", "grant"]).default("bounty"),
  skill: z.string().min(2).max(80),
  deadline_at: z.string().datetime(),
  featured: z.boolean().default(false),
  live: z.boolean().default(true),
  status: z.enum(["open", "pending_review", "closed", "paid"]).default("open"),
  sponsor_name: z.string().max(120).optional(),
  sponsor_wallet: z.string().max(56).optional(),
  created_by_user_id: z.string().uuid(),
  bg: z.string().max(120).optional(),
  color: z.string().max(120).optional(),
  deliverables: z.array(z.string().min(1).max(300)).default([]),
});

/**
 * GET /api/gigs
 * Returns all live gigs ordered by featured desc, created_at desc.
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gigs")
    .select(
      "id, slug, title, org, initials, prize_php, reward_amount, reward_unit, type, skill, deadline_at, status, submissions, featured, live, created_at"
    )
    .eq("live", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/gigs]", error.message);
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/gigs
 * Creates a new gig/bounty.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = CreateGigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("gigs")
    .insert({
      ...payload,
      desc_short: payload.desc_short ?? null,
      sponsor_name: payload.sponsor_name ?? null,
      sponsor_wallet: payload.sponsor_wallet ?? null,
      bg: payload.bg ?? null,
      color: payload.color ?? null,
    })
    .select("id, slug, title, status, live, created_at")
    .single();

  if (error) {
    console.error("[POST /api/gigs]", error.message);
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
