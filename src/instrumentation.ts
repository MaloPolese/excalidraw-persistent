export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBackupJob } = await import("./lib/backup");
    startBackupJob();
  }
}
