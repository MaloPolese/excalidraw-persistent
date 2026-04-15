import type {
  ExcalidrawImperativeAPI,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import {
  buildVersionMap,
  computeDelta,
  mergeElements,
  type CrdtElement,
  type VersionMap,
} from "@/lib/crdt";
import { syncBoard } from "@/lib/board/boardSync";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { SyncReason } from "./syncScheduler";

export type BoardEngine = ReturnType<typeof createBoardEngine>;

export function createBoardEngine(
  apiRef: React.RefObject<ExcalidrawImperativeAPI | null>,
) {
  let knownVersions: VersionMap = {};

  type SyncPlan = {
    clientDelta: CrdtElement[];
    current: CrdtElement[];
    files: BinaryFiles;
  };

  async function prepareSync(reason: SyncReason): Promise<SyncPlan | null> {
    const api = apiRef.current;
    if (!api) return null;

    const current =
      api.getSceneElementsIncludingDeleted() as unknown as CrdtElement[];

    const clientDelta = computeDelta(current, knownVersions);

    if (reason === "dirty" && clientDelta.length === 0) {
      return null;
    }

    return {
      clientDelta,
      current,
      files: api.getFiles(),
    };
  }

  async function sync(tabId: string, plan: SyncPlan): Promise<void> {
    const api = apiRef.current;
    if (!api) return;

    const { serverDelta, files, updatedVersions } = await syncBoard(
      api,
      tabId,
      knownVersions,
      plan.clientDelta,
    );

    if (serverDelta.length) {
      const merged = mergeElements(plan.current, serverDelta);
      api.updateScene({ elements: merged as [] });
    }

    if (Object.keys(files).length) {
      api.addFiles(Object.values(files));
    }

    knownVersions = updatedVersions;
    return;
  }

  async function bootstrap(tabId: string) {
    const r = await fetch("/api/board/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-tab-id": tabId },
      body: JSON.stringify({
        delta: [],
        versions: {},
        files: {},
      }),
    });

    const { delta, files } = (await r.json()) as {
      delta: ExcalidrawElement[];
      files: BinaryFiles;
    };
    knownVersions = buildVersionMap(delta);

    apiRef.current?.updateScene({ elements: delta });
    if (Object.keys(files).length) {
      apiRef.current?.addFiles(Object.values(files));
    }
  }

  return { sync, bootstrap, prepareSync };
}
