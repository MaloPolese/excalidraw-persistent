# excalidraw-persistent

A minimal self-hosted whiteboard built on top of the open-source [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) package.

The board state is persisted server-side (on disk), so your drawings survive browser refreshes, cache clears, and are consistent across all your devices.

> **Disclaimer**: This project is unofficial and not affiliated with or endorsed by the Excalidraw team.

---

## Features

- 🎨 Full Excalidraw experience
- 💾 Auto-save every 2 seconds after changes
- 📦 Single Docker container (Next.js fullstack)
- 🗂 State persisted to disk

## What this is not

- Not a collaboration tool (single user, single board)
- Not Excalidraw+ (no cloud sync, no multiplayer, no paid features)
- Not officially supported by the Excalidraw team

---

## Getting started

### With Docker

```bash
docker run -d \
  --name excalidraw-persistent \
  -p 3004:3004 \
  -v ./data:/app/data \
  ghcr.io/malopolese/excalidraw-persistent:latest
```

Then open [http://localhost:3004](http://localhost:3004).

### With Docker Compose

```yaml
services:
  excalidraw:
    image: ghcr.io/malopolese/excalidraw-persistent:latest
    container_name: excalidraw-persistent
    restart: unless-stopped
    ports:
      - "3004:3004"
    volumes:
      - ./data:/app/data
```

```bash
docker compose up -d
```

## Development

```bash
git clone https://github.com/MaloPolese/excalidraw-persistent.git
cd excalidraw-persistent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

- **Frontend**: Excalidraw React component loaded client-side only (no SSR)
- **Backend**: Next.js API route (`GET /api/board` / `POST /api/board`)
- **Storage**: Board state saved as `data/board.json` on disk
- **Auto-save**: Debounced 2s after last change, with a subtle `✓ Saved` indicator

---

## Credits

This project uses [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw), which is [MIT licensed](https://github.com/excalidraw/excalidraw/blob/master/LICENSE).

---

## License

MIT — see [LICENSE](./LICENSE)
