import type {
  ExcalidrawImperativeAPI,
  BinaryFiles,
  BinaryFileData,
} from "@excalidraw/excalidraw/types";
import {
  buildVersionMap,
  mergeElements,
  type CrdtElement,
  type VersionMap,
} from "@/lib/crdt";
import { syncBoard } from "@/lib/board/boardSync";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export type BoardEngine = ReturnType<typeof createBoardEngine>;

export function createBoardEngine(
  apiRef: React.RefObject<ExcalidrawImperativeAPI | null>,
) {
  let knownVersions: VersionMap = {};

  async function sync(tabId: string): Promise<void> {
    const api = apiRef.current;

    if (!api) return;

    const { serverDelta, files, updatedVersions } = await syncBoard(
      api,
      tabId,
      knownVersions,
    );

    if (serverDelta.length) {
      const current =
        api.getSceneElementsIncludingDeleted() as unknown as CrdtElement[];
      const merged = mergeElements(current, serverDelta);
      api.updateScene({ elements: merged as unknown as [] });
    }

    if (Object.keys(files).length) {
      api.addFiles(Object.values(files) as BinaryFileData[]);
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

  return { sync, bootstrap };
}
