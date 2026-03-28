"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ExcalidrawWrapper() {
  const [initialData, setInitialData] = useState<{
    elements: Awaited<ReturnType<ExcalidrawImperativeAPI["getSceneElements"]>>;
    appState: Partial<AppState>;
    files: BinaryFiles;
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load board on mount
  useEffect(() => {
    fetch("/api/board")
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          elements: data.elements ?? [],
          appState: {
            ...(data.appState ?? {}),
            // Always reset collaboration state
            collaborators: new Map(),
          },
          files: data.files ?? {},
        });
      })
      .catch(() => {
        setInitialData({ elements: [], appState: {}, files: {} });
      });
  }, []);

  const saveBoard = useCallback(async () => {
    if (!excalidrawApiRef.current) return;

    const elements = excalidrawApiRef.current.getSceneElements();
    const appState = excalidrawApiRef.current.getAppState();
    const files = excalidrawApiRef.current.getFiles();

    // Strip non-serializable / session-only appState fields
    const {
      collaborators,
      isLoading,
      errorMessage,
      contextMenu,
      openMenu,
      draggingElement,
      resizingElement,
      multiElement,
      editingElement,
      ...serializableAppState
    } = appState as AppState & { [key: string]: unknown };

    void collaborators;
    void isLoading;
    void errorMessage;
    void contextMenu;
    void openMenu;
    void draggingElement;
    void resizingElement;
    void multiElement;
    void editingElement;

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          appState: serializableAppState,
          files,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, []);

  const handleChange = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(saveBoard, 2000);
  }, [saveBoard]);

  if (!initialData) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#888",
          background: "#f8f8f8",
        }}
      >
        Loading board...
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api;
        }}
        initialData={initialData}
        onChange={handleChange}
      />

      {/* Save status indicator */}
      {saveStatus !== "idle" && (
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
            background: saveStatus === "error" ? "#fee2e2" : "#f0fdf4",
            color: saveStatus === "error" ? "#dc2626" : "#16a34a",
            border: `1px solid ${saveStatus === "error" ? "#fca5a5" : "#86efac"}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {saveStatus === "saving" && "💾 Saving..."}
          {saveStatus === "saved" && "✓ Saved"}
          {saveStatus === "error" && "✗ Save failed"}
        </div>
      )}
    </div>
  );
}
