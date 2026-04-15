import type {
  ExcalidrawImperativeAPI,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import {
  mergeElements,
  computeDelta,
  buildVersionMap,
  type CrdtElement,
  type VersionMap,
} from "../crdt";

export type SyncResponse = {
  delta: CrdtElement[];
  files: BinaryFiles;
};

export async function syncBoard(
  api: ExcalidrawImperativeAPI,
  tabId: string,
  knownVersions: VersionMap,
  clientDelta: CrdtElement[],
): Promise<{
  serverDelta: CrdtElement[];
  files: BinaryFiles;
  updatedVersions: VersionMap;
}> {
  const currentElements =
    api.getSceneElementsIncludingDeleted() as unknown as CrdtElement[];

  const res = await fetch("/api/board/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-tab-id": tabId },
    body: JSON.stringify({
      delta: clientDelta,
      versions: knownVersions,
      files: api.getFiles(),
    }),
  });

  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
  const { delta: serverDelta, files }: SyncResponse = await res.json();

  const merged =
    serverDelta.length > 0
      ? mergeElements(currentElements, serverDelta)
      : currentElements;

  return {
    serverDelta,
    files,
    updatedVersions: buildVersionMap(merged),
  };
}
