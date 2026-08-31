# Workflow

No manifests, lockfiles, CI, or scripts are tracked in the repository: there are no established install, build, lint, typecheck, or test commands.

## Serve

Static hosting only; any file server works. For the service worker and clipboard APIs a secure context is required, so use localhost rather than `file://`:

- `python -m http.server 8000`, or
- `npx serve .`

## Validation

Manual, through the Playwright MCP configured in `opencode.json` (`npx -y @playwright/mcp@latest --snapshot-boxes --browser chromium`): load the served app, exercise both entry modes, the tax panel, rate manual/refresh/reset flows, theme toggle, and copy buttons, and check console for errors.

## Release checklist (evidenced convention)

When changing `app.js` or `style.css`, bump its `?v=` in `index.html` and the matching entry plus `CACHE_NAME` version in `sw.js`, otherwise the cached app shell is served to returning users.
