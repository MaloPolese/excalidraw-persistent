import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const valid = await checkPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createToken();
  const res = NextResponse.json({ ok: true });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
