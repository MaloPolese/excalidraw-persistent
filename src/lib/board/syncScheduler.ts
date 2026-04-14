import { Subject, fromEvent, merge } from "rxjs";
import { debounceTime, filter, tap } from "rxjs/operators";

const SAVE_DEBOUNCE_MS = 500;

export type SyncScheduler = ReturnType<typeof createSyncScheduler>;

export function createSyncScheduler(sync: () => void) {
  const save$ = new Subject<void>();

  const change$ = save$.pipe(
    filter(() => !document.hidden),
    debounceTime(SAVE_DEBOUNCE_MS),
  );

  const flush$ = merge(
    fromEvent(window, "blur"),
    fromEvent(window, "beforeunload"),
    fromEvent(document, "visibilitychange").pipe(filter(() => document.hidden)),
  );

  const sub = merge(change$, flush$).subscribe(sync);

  return {
    emit: () => save$.next(),
    destroy: () => sub.unsubscribe(),
  };
}
