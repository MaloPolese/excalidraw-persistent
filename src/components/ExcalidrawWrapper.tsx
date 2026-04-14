"use client";

import { useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import SyncIndicator, { type SyncStatus } from "./SyncIndicator";
import { useBoardSync } from "@/hooks/useBoardSync";

export default function ExcalidrawWrapper() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const setSyncStatusRef = useRef<((s: SyncStatus) => void) | null>(null);

  const { markDirty } = useBoardSync({
    apiRef,
    onStatusChange: (status) => setSyncStatusRef.current?.(status),
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          apiRef.current = api;
        }}
        onChange={markDirty}
      />
      <SyncIndicator
        onRegister={(setter) => {
          setSyncStatusRef.current = setter;
        }}
      />
    </div>
  );
}
