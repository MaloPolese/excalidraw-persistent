import { NextRequest } from "next/server";

type SseClient = {
  controller: ReadableStreamDefaultController;
  tabId: string;
};

const clients = new Set<SseClient>();

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const session = req.cookies.get("session")?.value;
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tabId = req.nextUrl.searchParams.get("tabId") ?? "unknown";

  const stream = new ReadableStream({
    start(controller) {
      // heartbeat
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      const client: SseClient = { controller, tabId };
      clients.add(client);
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      console.log("Client connected:", tabId);

      req.signal.addEventListener("abort", () => {
        clients.delete(client);
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function notifyBoardUpdated(senderTabId: string): void {
  const encoder = new TextEncoder();

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
