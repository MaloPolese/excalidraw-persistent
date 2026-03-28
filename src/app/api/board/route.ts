import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "board.json");

async function ensureDataDir() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
}

export async function GET() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    // No board saved yet — return empty state
    return NextResponse.json({ elements: [], appState: {}, files: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDataDir();
    const body = await req.json();
    await fs.writeFile(DATA_PATH, JSON.stringify(body), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save board:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
