# excalidraw-persistent

A minimal self-hosted whiteboard built on top of the open-source [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) package.

The board state is persisted server-side (on disk), so your drawings survive browser refreshes, cache clears, and are consistent across all your devices.

> **Disclaimer**: This project is unofficial and not affiliated with or endorsed by the Excalidraw team.

---

## Features

- 🎨 Full Excalidraw experience
- 🔒 Password protection — board is private behind a session cookie
- 💾 Auto-save after changes
- 🗄 Automatic compressed backups (gzip) on a configurable cron schedule
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
  -e BOARD_PASSWORD=your-password-here \
  -e SECRET=your-secret-here \
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
    environment:
      BOARD_PASSWORD: your-password-here
      SECRET: your-secret-here
      BACKUP_CRON: "0 2 * * *" # every day at 2am
      BACKUP_KEEP: "7" # keep last 7 backups
```

```bash
docker compose up -d
```

## Environment variables

| Variable         | Required | Default     | Description                               |
| ---------------- | -------- | ----------- | ----------------------------------------- |
| `BOARD_PASSWORD` | ✅       | —           | Password to access the board              |
| `SECRET`         | ✅       | —           | Random string for signing session cookies |
| `BACKUP_CRON`    | ❌       | `0 2 * * *` | Backup schedule in cron format            |
| `BACKUP_KEEP`    | ❌       | `7`         | Number of compressed backups to keep      |

Generate a secure `SECRET` with:

```bash
openssl rand -hex 32
```

---

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
- **Auth**: Password checked on login, session stored in a signed `httpOnly` cookie (7 days)
- **Storage**: Board state saved as `data/board.json` on disk
- **Auto-save**: Debounced 300ms after last change.
- **Backups**: Runs on a cron schedule via `node-cron`, compresses `board.json` with gzip, stored in `data/backups/`. Old backups are rotated automatically.

---

### Backup cron examples

| Expression    | Meaning                      |
| ------------- | ---------------------------- |
| `* * * * *`   | Every minute                 |
| `0 * * * *`   | Every hour                   |
| `0 */2 * * *` | Every 2 hours                |
| `0 2 * * *`   | Every day at 2am _(default)_ |
| `0 2 */2 * *` | Every 2 days at 2am          |
| `0 2 * * 0`   | Every Sunday at 2am          |

### Restoring a backup

```bash
# On your server, in the data/ folder
gunzip -c backups/board.backup.2026-03-28-02-00.json.gz > board.json
# Then restart the container
docker compose restart excalidraw
```

---

## Credits

This project uses [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw), which is [MIT licensed](https://github.com/excalidraw/excalidraw/blob/master/LICENSE).

---

## License

MIT — see [LICENSE](./LICENSE)
