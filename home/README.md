# ORA VFX — Project and Audit Status

This repository contains the ORA VFX static pages, theme toggle, one-tab-session intro-loader guard, consent-gated Meta Pixel integration, direct email/WhatsApp contact links, and a small Node.js static-file server.

## Public HTML pages
- `index.html` — homepage
- `portfolio.html` — full portfolio
- `privacy.html` — privacy policy
- `terms.html` — terms and conditions
- `refund.html` — refund/cancellation policy

## Contact behavior
The homepage no longer contains the enquiry form because the supplied server does not implement a message-submission endpoint. The section now links directly to WhatsApp and email, so it does not display a false “enquiry sent” confirmation or collect data that cannot be submitted. WhatsApp requires WhatsApp/web access; email opens the visitor's configured mail app.

The server remains a static-file server for local/Node-capable hosting and its `/api/health` route is used by the existing Render configuration. It does not send email or implement `POST /api/enquiry`. No Resend integration or email API credentials are configured.

## Run local static/server smoke tests
```bash
npm run build
npm start
```
The `build` script checks syntax for the root-level JavaScript files that are part of this audit. It does not audit any files inside `assets/`.

## Meta Pixel and privacy
Meta Pixel ID `1100194509661942` is initialized through `meta-pixel-consent.js` only after the visitor opts in. The integration intentionally records `PageView` only. The first-visit notice and the Privacy Policy describe the optional tracking choice.

## GoDaddy deployment note
For static-only GoDaddy cPanel hosting, upload the website files to `public_html`; a Node.js process is not required for static pages and will not run from a regular static upload. The current contact section uses direct email and WhatsApp links and does not depend on a backend. If deploying through the existing Render config, the Node server can continue serving the pages, but it does not provide an email API. Confirm the final domain before updating canonical metadata and the sitemap.

See `DEPLOYMENT.md` and `AUDIT_REPORT.md` before publishing.

## Homepage button appearance
The experimental Venom/symbiote button animation has been removed at the project owner's request. Homepage buttons now use the existing site styles without the additional effect layer.
