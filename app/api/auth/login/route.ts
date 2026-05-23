import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { timingSafeEqual, scryptSync } from "node:crypto";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

function verifyPassword(password: string, encoded: string): boolean {
  const [salt, storedHash] = encoded.split(":");
  if (!salt || !storedHash) return false;

  const candidate = scryptSync(password, salt, 64).toString("hex");

  try {
    return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * POST /api/auth/login
 * Email/password login against public.users.
 */
export async function POST(req: Request) {
  const supabase = await createClient();

  const body: unknown = await req.json();
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, role, stellar_public_key, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[POST /api/auth/login]", error.message);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "User does not exist" }, { status: 404 });
  }

  if (!user.password_hash) {
    return NextResponse.json({ error: "This account requires wallet login" }, { status: 400 });
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      stellar_public_key: user.stellar_public_key,
    },
  });
}
