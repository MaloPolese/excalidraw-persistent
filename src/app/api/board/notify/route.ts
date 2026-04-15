import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/sseClients";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const session = req.cookies.get("session")?.value;
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tabId = req.nextUrl.searchParams.get("tabId") ?? "unknown";

  const stream = new ReadableStream({
    start(controller) {
      const client = { controller, tabId };
      addClient(client);

      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        removeClient(client);
        clearInterval(heartbeat);
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
