"use client";

import { useEffect, useState } from "react";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

type Props = {
  onRegister: (setter: (status: SyncStatus) => void) => void;
};

export default function SyncIndicator({ onRegister }: Props) {
  const [status, setStatus] = useState<SyncStatus>("idle");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    onRegister((newStatus: SyncStatus) => {
      if (timer) clearTimeout(timer);
      setStatus(newStatus);
      if (newStatus === "synced" || newStatus === "error") {
        timer = setTimeout(
          () => setStatus("idle"),
          newStatus === "synced" ? 2000 : 3000,
        );
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [onRegister]);

  if (status === "idle") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        pointerEvents: "none",
        transition: "opacity 0.3s ease",
        background: status === "error" ? "#fee2e2" : "#f0fdf4",
        color: status === "error" ? "#dc2626" : "#16a34a",
        border: `1px solid ${status === "error" ? "#fca5a5" : "#86efac"}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {status === "syncing" && "Syncing..."}
      {status === "synced" && "Synced"}
      {status === "error" && "Sync failed"}
    </div>
  );
}
