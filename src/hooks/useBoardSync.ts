import { useEffect, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { SyncStatus } from "@/components/SyncIndicator";
import {
  BoardEngine,
  createBoardEngine,
  createSseNotify,
  createSyncScheduler,
  SyncScheduler,
} from "@/lib/board";

type UseBoardSyncOptions = {
  apiRef: React.RefObject<ExcalidrawImperativeAPI | null>;
  onStatusChange: (status: SyncStatus) => void;
};

export function useBoardSync({ apiRef, onStatusChange }: UseBoardSyncOptions) {
  const TAB_ID = useRef(crypto.randomUUID()).current;
  const engineRef = useRef<BoardEngine | null>(null);
  const schedulerRef = useRef<SyncScheduler | null>(null);

  useEffect(() => {
    const engine = createBoardEngine(apiRef);
    engineRef.current = engine;

    engine
      .bootstrap(TAB_ID)
      .catch(() => console.error("[sync] Initial load failed"));

    const scheduler = createSyncScheduler(() => {
      onStatusChange("syncing");
      engine
        .sync(TAB_ID)
        .then(() => onStatusChange("synced"))
        .catch(() => onStatusChange("error"));
    });
    schedulerRef.current = scheduler;

    const destroySse = createSseNotify(scheduler.emit, TAB_ID);

    return () => {
      scheduler.destroy();
      destroySse();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    markDirty: () => schedulerRef.current?.emit(),
  };
}
