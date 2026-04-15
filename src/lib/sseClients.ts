type SseClient = {
  controller: ReadableStreamDefaultController;
  tabId: string;
};

// Using globalThis ensures client list is shared across all API route instances, which is necessary for SSE to work correctly.
const g = globalThis as typeof globalThis & { __sseClients?: Set<SseClient> };
if (!g.__sseClients) {
  g.__sseClients = new Set<SseClient>();
}

export const clients = g.__sseClients;

export function addClient(client: SseClient): void {
  clients.add(client);
}

export function removeClient(client: SseClient): void {
  clients.delete(client);
}

export function notifyBoardUpdated(senderTabId: string): void {
  const encoder = new TextEncoder();
  console.log(
    "Notifying board update for tab:",
    senderTabId,
    "clients count:",
    clients.size,
  );
  for (const client of clients) {
    if (client.tabId === senderTabId) continue;
    try {
      client.controller.enqueue(
        encoder.encode("event: board_updated\ndata: {}\n\n"),
      );
    } catch {
      clients.delete(client);
    }
  }
}
