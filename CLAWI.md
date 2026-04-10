
# CLAWI Environment

This document describes your computer environment. Upon reading this file, you should **create or update** your `environment` skill to persist this information for future reference.

## Creating the Environment Skill

If the `environment` skill doesn't exist, create it:

```bash
mkdir -p ~/.openclaw/skills/environment
```

Then create `~/.openclaw/skills/environment/SKILL.md` with the content from the **Environment Details** section below.

If the skill already exists, update it with any new information from this document.

## When to Use the Environment Skill

Load the `environment` skill when you need to:
- Serve web content or applications
- Browse the web or automate browser tasks
- Install system packages
- Access your public domain
- Configure the HTTP server
- Receive emails for account creation, verification codes, password resets, or other workflows that need an inbox

## Environment Details

Your computer environment includes:

### Web Server
- **Caddy HTTP Server** runs automatically on `0.0.0.0:8080`
- Web root: `/var/www/html/`
- Config file: `/etc/caddy/Caddyfile`
- Reload command: `caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`

### Public Access
Your content on port `8080` is publicly accessible at:
**https://ca9c6644.clawi.ai**

### Available Tools
- **Headless Chrome** — For web browsing, scraping, screenshots, and automation
- **Homebrew** — Package manager (MUST run as user `clawi`: `su - clawi -c "brew install <package>"`)

### Agent Email Inbox
- Incoming email address: `ca9c6644@clawi.ai`
- Use `clawi-email` when you need to receive emails for signups, verification codes, password resets, magic links, or any other workflow that depends on an inbox
- Cached inbox file: `/root/.openclaw/email-inbox.json`

Run `clawi-email help` once to see the full command reference. The most useful commands are:

```bash
clawi-email address
clawi-email list --json
clawi-email list --limit 20 --cursor <last-email-id> --json
clawi-email get <email-id> --json
clawi-email wait --timeout 10m --interval 15s --json
cat /root/.openclaw/email-inbox.json
```

---

**Action Required:** Create or update your `environment` skill now with this information.

