"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Subject, fromEvent, merge } from "rxjs";
import { debounceTime, filter, tap } from "rxjs/operators";
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

const SAVE_DEBOUNCE_MS = 300;

async function persistBoard(api: ExcalidrawImperativeAPI): Promise<void> {
  const elements = api.getSceneElements();
  const appState = api.getAppState();
  const files = api.getFiles();

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

  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elements, appState: serializableAppState, files }),
  });

  if (!res.ok) throw new Error("Save failed");
}

export default function ExcalidrawWrapper() {
  const [initialData, setInitialData] = useState<{
    elements: [];
    appState: Partial<AppState>;
    files: BinaryFiles;
  } | null>(null);

  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const save$ = useRef(new Subject<void>());

  useEffect(() => {
    fetch("/api/board")
      .then((res) => res.json())
      .then((data) => {
        setInitialData({
          elements: data.elements ?? [],
          appState: {
            ...(data.appState ?? {}),
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
    try {
      await persistBoard(excalidrawApiRef.current);
      console.info("[board] Saved");
    } catch {
      console.error("[board] Save failed");
    }
  }, []);

  useEffect(() => {
    const onChange$ = save$.current.pipe(filter(() => !document.hidden));

    const onFlush$ = merge(
      fromEvent(window, "blur"),
      fromEvent(document, "visibilitychange").pipe(
        filter(() => document.hidden),
      ),
    ).pipe(filter(() => excalidrawApiRef.current !== null));

    const subscription = merge(onChange$, onFlush$)
      .pipe(
        debounceTime(SAVE_DEBOUNCE_MS),
        tap(() => saveBoard()),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [saveBoard]);

  const handleChange = useCallback(() => {
    save$.current.next();
  }, []);

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
    </div>
  );
}
