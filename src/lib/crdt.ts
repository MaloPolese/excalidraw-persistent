export type CrdtElement = {
  id: string;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  [key: string]: unknown;
};

export type VersionMap = Record<string, number>;

/**
 * Merge two arrays of elements, resolving conflicts using version and versionNonce.
 * @param a element array A
 * @param b element array B
 * @returns Merged array of elements (a new array)
 */
export function mergeElements(
  a: CrdtElement[],
  b: CrdtElement[],
): CrdtElement[] {
  const map = new Map<string, CrdtElement>();

  for (const el of a) {
    map.set(el.id, el);
  }

  for (const el of b) {
    const existing = map.get(el.id);
    if (!existing) {
      map.set(el.id, el);
      continue;
    }
    map.set(el.id, winner(existing, el));
  }

  return Array.from(map.values());
}

function winner(a: CrdtElement, b: CrdtElement): CrdtElement {
  if (a.version !== b.version) {
    return a.version > b.version ? a : b;
  }
  return a.versionNonce >= b.versionNonce ? a : b;
}

/**
 * Build a version map from an element array: { [id]: version }
 * @param elements array of elements to build the version map from
 * @returns versionMap object mapping element IDs to their versions
 */
export function buildVersionMap(elements: CrdtElement[]): VersionMap {
  const map: VersionMap = {};
  for (const el of elements) {
    map[el.id] = el.version;
  }
  return map;
}

/**
 * Compute the delta of elements that are newer than what the receiver knows
 * @param elements the full array of elements on the server
 * @param receiverVersions the version map of the receiver (client) { [id]: version }
 * @returns array of elements that are new or updated compared to the receiver's version map
 */
export function computeDelta(
  elements: CrdtElement[],
  receiverVersions: VersionMap,
): CrdtElement[] {
  return elements.filter((el) => {
    const known = receiverVersions[el.id];
    return known === undefined || el.version > known;
  });
}

/**
 * Same logic as computeDelta, but for files (images) instead of elements.
 *
 */
export function computeFilesDelta(
  allFiles: Record<string, unknown>,
  clientFiles: Record<string, unknown>,
) {
  const delta: Record<string, unknown> = {};
  for (const [id, file] of Object.entries(allFiles)) {
    if (!(id in clientFiles)) {
      delta[id] = file;
    }
  }
  return delta;
}
