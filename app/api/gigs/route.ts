import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/gigs
 * Returns all live gigs ordered by featured desc, created_at desc.
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gigs")
    .select(
      "id, slug, title, org, initials, bg, color, desc_short, prize_php, reward_amount, reward_unit, type, skill, deadline_at, status, submissions, featured, live, created_at"
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
