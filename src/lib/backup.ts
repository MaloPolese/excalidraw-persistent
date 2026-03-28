import { promises as fs } from "fs";
import { gzip } from "zlib";
import { promisify } from "util";
import path from "path";
import cron from "node-cron";

const gzipAsync = promisify(gzip);

const DATA_PATH = path.join(process.cwd(), "data", "board.json");
const BACKUP_DIR = path.join(process.cwd(), "data", "backups");

const BACKUP_CRON = process.env.BACKUP_CRON ?? "0 2 * * *";
const BACKUP_KEEP = parseInt(process.env.BACKUP_KEEP ?? "7", 10);

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `-${pad(now.getHours())}-${pad(now.getMinutes())}`
  );
}

async function runBackup(): Promise<void> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8").catch(() => null);
    if (!raw) {
      console.log("[backup] No board.json found, skipping.");
      return;
    }

    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const compressed = await gzipAsync(Buffer.from(raw, "utf-8"));
    const filename = `board.backup.${getTimestamp()}.json.gz`;
    const dest = path.join(BACKUP_DIR, filename);
    await fs.writeFile(dest, compressed);
    console.log(
      `[backup] Saved ${filename} (${compressed.byteLength} bytes compressed)`,
    );

    // Rotate — keep only last N backups
    const files = (await fs.readdir(BACKUP_DIR))
      .filter((f) => f.startsWith("board.backup.") && f.endsWith(".json.gz"))
      .sort();

    const toDelete = files.slice(0, Math.max(0, files.length - BACKUP_KEEP));
    for (const file of toDelete) {
      await fs.unlink(path.join(BACKUP_DIR, file));
      console.log(`[backup] Deleted old backup: ${file}`);
    }
  } catch (err) {
    console.error("[backup] Failed:", err);
  }
}

export function startBackupJob(): void {
  if (!cron.validate(BACKUP_CRON)) {
    console.error(
      `[backup] Invalid cron expression "${BACKUP_CRON}", backup disabled.`,
    );
    return;
  }

  console.log(
    `[backup] Starting with cron="${BACKUP_CRON}" keep=${BACKUP_KEEP}`,
  );
  cron.schedule(BACKUP_CRON, runBackup);
}
