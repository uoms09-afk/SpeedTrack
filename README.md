# SpeedTrack (Windows-ready Desktop App)

SpeedTrack is a dark-themed desktop productivity tracker inspired by the provided reference screenshots.

## Core Sections

- **Dashboard**: active time, productivity stats, top usage, hourly bars, app list.
- **Screen Time**: date-range + category filters, category summaries, per-app usage rows.
- **Goals**: goal creation (multiple types), increment/decrement progress, completion status.
- **Timeline**: recent activity events with app, detail, timestamp, and duration.
- **Export**: selectable dataset scope (`all`, `apps`, `timeline`, `goals`) and JSON/CSV export history.
- **Settings**: startup/tracking toggles, break reminder, clear local data.

All features in this repo run locally and are completely free and open-source.

## Web Preview

```bash
python3 -m http.server 4173
```

Open http://localhost:4173

## Desktop App (Electron)

```bash
npm install
npm start
```

## Build Windows Portable EXE

```bash
npm install
npm run build:win
```

Artifact output: `dist/`


## Create Portable EXE via GitHub Actions (recommended)

If local npm access is blocked in your environment, use the included workflow:

1. Push this branch to GitHub.
2. Open **Actions** → **Build Windows Portable EXE**.
3. Click **Run workflow**.
4. Download artifact **SpeedTrack-portable-exe**.

This produces a portable Windows `.exe` in CI on `windows-latest`.

## Local Windows build shortcut (PowerShell)

```powershell
./scripts/build-portable-win.ps1
```

