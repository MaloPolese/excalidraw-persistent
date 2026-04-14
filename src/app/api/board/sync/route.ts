import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  mergeElements,
  computeDelta,
  type CrdtElement,
  type VersionMap,
  computeFilesDelta,
} from "@/lib/crdt";
import { notifyBoardUpdated } from "../notify/route";

const DATA_PATH = path.join(process.cwd(), "data", "board.json");

/**
 * In-memory write queue to serialize all writes.
 * This is CRITICAL to preserve CRDT guarantees.
 */
let writeQueue: Promise<void> = Promise.resolve();
function enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn);
  writeQueue = next.then(
    () => {},
    () => {},
  );
  return next;
}

type BoardFile = {
  elements: CrdtElement[];
  files: Record<string, unknown>;
};

type SyncRequest = {
  // map of { [elementId]: version } what the client currently knows
  versions: VersionMap;
  // only new files
  files: Record<string, unknown>;
  delta: CrdtElement[];
  appState: Record<string, unknown>;
};

async function readBoard(): Promise<BoardFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { elements: [], files: {} };
  }
}

async function writeBoard(board: BoardFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(board), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const tabId = req.headers.get("x-tab-id") ?? "unknown";
    const body: SyncRequest = await req.json();
    const { delta, versions, files } = body;

    const result = await enqueueWrite(async () => {
      const stored = await readBoard();

      const mergedElements =
        delta.length > 0
          ? mergeElements(stored.elements, delta)
          : stored.elements;

      const mergedFiles = { ...stored.files, ...files };
      const filesDelta = computeFilesDelta(mergedFiles, files);
      const serverDelta = computeDelta(mergedElements, versions);

      await writeBoard({
        elements: mergedElements,
        files: mergedFiles,
      });

      if (delta.length > 0) {
        notifyBoardUpdated(tabId);
      }

      return { serverDelta, filesDelta };
    });

    return NextResponse.json({
      delta: result.serverDelta,
      files: result.filesDelta,
    });
  } catch (err) {
    console.error("[sync] Failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
