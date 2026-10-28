# ORA VFX — Deployment Notes (Audit Findings)

## Current deployment status

The homepage enquiry form has been removed because the current `server.js` does not implement `POST /api/enquiry`. The contact section now provides direct WhatsApp and email links instead, and it no longer presents a success message claiming that a website form was sent.

The current server implements static-file serving and `GET /api/health`; it does not send email or implement an enquiry API. No Resend API key or email-delivery settings are used by the current code.

## GoDaddy cPanel decision

There are two materially different deployment paths:

1. **Static-only cPanel hosting:** uploads files to the website document root (commonly `public_html`) and serves HTML/CSS/JS. It will not run `server.js` as an API server. The current direct-contact links work without a server-side form endpoint.
2. **Node.js-capable hosting / Web Apps:** can run the `server.js` process only if Node.js support is enabled for the exact account. This project has a `build` script that runs JavaScript syntax checks and a `start` script that runs `node server.js`; the server still does not implement an enquiry endpoint; this is not a blocker for the current direct-contact links.

Before upload:
- Confirm whether the account exposes a Node.js/Web Apps interface and supports the intended Node version.
- Confirm the final domain. The current homepage canonical, structured data, social metadata, `robots.txt`, and sitemap refer to `https://oravfx.com/`; do not assume that is the final production domain without confirmation.
- Restore any separately maintained original assets before the actual website is deployed. This audit did not inspect or modify asset contents.
- Back up the current live directory before replacing files.

## Node-capable deployment commands
```bash
npm run build
npm start
```
The runtime expects the hosting provider to supply `PORT` through `process.env.PORT`. The server only serves files and a liveness endpoint; it does not send enquiry email.

## Meta Pixel verification
The project uses Pixel ID `1100194509661942` and sends `PageView` only after a visitor opts in. Because the Pixel is consent-gated, the implementation intentionally has no unconditional `noscript` tracking image. After deployment, use Meta Events Manager → Test Events or Meta Pixel Helper to verify actual event delivery. Code presence alone does not prove events are received.

## Current code route behavior
- `GET /` and all five supplied HTML pages: serve HTML when their files exist.
- `GET /api/health`: returns `{"ok":true}` unconditionally; this is a liveness response only in the current implementation.
- `POST /api/enquiry`: not implemented. The homepage no longer submits to this route; the contact section links to email and WhatsApp directly.

Do not treat this checklist as a deployment completion certificate until the remaining issues in `AUDIT_REPORT.md` are resolved and original assets have been restored.
