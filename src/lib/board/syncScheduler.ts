import { Subject, fromEvent, merge } from "rxjs";
import { debounceTime, filter, map } from "rxjs/operators";

const SAVE_DEBOUNCE_MS = 500;

export type SyncScheduler = ReturnType<typeof createSyncScheduler>;
export type SyncReason = "dirty" | "remote";

export function createSyncScheduler(sync: (reason: SyncReason) => void) {
  const save$ = new Subject<SyncReason>();

  const change$ = save$.pipe(
    filter((r) => r === "dirty"),
    filter(() => !document.hidden),
    debounceTime(SAVE_DEBOUNCE_MS),
  );

  const remote$ = save$.pipe(filter((reason) => reason === "remote"));

  const flush$ = merge(
    fromEvent(window, "blur"),
    fromEvent(window, "beforeunload"),
    fromEvent(document, "visibilitychange").pipe(filter(() => document.hidden)),
  ).pipe(map(() => "dirty" as SyncReason));

  const sub = merge(change$, remote$, flush$).subscribe(sync);

  return {
    emit: (reason: SyncReason) => save$.next(reason),
    destroy: () => sub.unsubscribe(),
  };
}
