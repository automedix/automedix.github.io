# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### Wallets
- **Lightning NWC Wallet**: via `npx @getalby/cli get-balance` — Alby/NWC Wallet
- **Cashu Wallet**: SQLite unter `~/.cashu/wallet/wallet.sqlite3`
  - **EINZIGE erlaubte Mint:** `https://mint.macadamia.cash` — keine anderen Mints verwenden!
  - Python3 fehlt in dieser Sandbox → CLI `/usr/local/bin/cashu` nicht nutzbar
  - **Balance lesen**: `node /root/.openclaw/workspace/scripts/cashu-melt.js --dry-run`
  - **Melt (alles)**: `node /root/.openclaw/workspace/scripts/cashu-melt.js`
  - **Melt (teilweise)**: `node /root/.openclaw/workspace/scripts/cashu-melt.js --amount <sats>`
  - `better-sqlite3` ist installiert unter `/root/.openclaw/workspace/scripts/node_modules/`
  - ⚠️ Lightning-Routing schlägt für Beträge < ~50 Sats oft fehl → Script gibt dann Cashu-Token aus
  - ⚠️ **WICHTIG:** Token sofort einlösen oder importieren — Keyset-Rotation kann alte Proofs ungültig machen
