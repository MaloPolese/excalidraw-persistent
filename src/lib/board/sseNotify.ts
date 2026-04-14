import { fromEventPattern } from "rxjs";
import { debounceTime, tap } from "rxjs/operators";

export function createSseNotify(onServerUpdate: () => void, tabId: string) {
  const es = new EventSource(`/api/board/notify?tabId=${tabId}`);

  const sub = fromEventPattern<void>(
    (handler) => es.addEventListener("board_updated", handler),
    (handler) => es.removeEventListener("board_updated", handler),
  )
    .pipe(debounceTime(500))
    .subscribe(onServerUpdate);

  return () => {
    sub.unsubscribe();
    es.close();
  };
}
