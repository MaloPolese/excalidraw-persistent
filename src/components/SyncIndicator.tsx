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

  const styles = {
    syncing: {
      background: "#fffbeb",
      color: "#d97706",
      border: "1px solid #fcd34d",
    },
    synced: {
      background: "#f0fdf4",
      color: "#16a34a",
      border: "1px solid #86efac",
    },
    error: {
      background: "#fee2e2",
      color: "#dc2626",
      border: "1px solid #fca5a5",
    },
  }[status];

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
        transition: "opacity 0.5s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        ...styles,
      }}
    >
      {status === "syncing" && "Syncing..."}
      {status === "synced" && "Synced"}
      {status === "error" && "Sync failed"}
    </div>
  );
}
