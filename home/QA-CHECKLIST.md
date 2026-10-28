# ORA VFX — Verified QA Checklist

This file records what was checked during the non-assets audit. It is not a claim that every browser behavior or external integration has been tested.

## Passed locally
- [x] Five HTML pages parsed; each has a single `<body>` and a single `<h1>`.
- [x] No duplicate IDs were found in the supplied HTML.
- [x] All same-page `href="#..."` references resolve to an element ID.
- [x] No empty links were found.
- [x] All `target="_blank"` anchors inspected include `rel="noopener"` or `rel="noreferrer"`.
- [x] Root-level JavaScript files passed `node --check`.
- [x] Root-level CSS files parsed with zero syntax errors.
- [x] The Organization JSON-LD block parses as valid JSON.
- [x] Exactly one `meta-pixel-consent.js` reference is present per supplied HTML page; Pixel initialization is centralized in that file and uses ID `1100194509661942`.
- [x] Local server smoke tests returned HTTP 200 for `/`, `index.html`, `portfolio.html`, `privacy.html`, `terms.html`, `refund.html`, `theme.css`, `theme.js`, and `meta-pixel-consent.js`.
- [x] Local `npm run build` syntax-check command was added and tested.
- [x] ZIP integrity was checked for the final audit package.

## Confirmed issues / limitations
- [x] Removed the non-functional homepage enquiry form and its misleading success/error states; it is replaced by direct WhatsApp and email links.
- [x] `/api/health` is documented as a liveness-only response; no email integration is claimed.
- [x] `POST /api/enquiry` is not implemented, and the current homepage no longer submits to this route.
- [ ] CSS/JavaScript files are served with `Cache-Control: public, max-age=31536000, immutable` even when unversioned, which can preserve stale versions after a release.
- [ ] The static server can serve root-level source/documentation files such as `server.js`, `package.json`, and deployment notes; production exposure should be restricted.
- [ ] The sitemap currently lists only the homepage even though four additional public HTML pages exist.
- [ ] Only the homepage has canonical/Open Graph URL metadata. The final domain needs confirmation before generating missing absolute canonical URLs.

## Not verified in this audit
- [ ] Browser rendering, console errors, animation smoothness, and mobile/viewport visuals were not browser-tested. The removed enquiry form has no submission flow to test; WhatsApp/email handoff still depends on the visitor browser/device.
- [ ] Meta Pixel event delivery to Meta was not verified; use Events Manager or Pixel Helper on the live site.
- [ ] Asset contents were intentionally excluded from this audit at the owner's request. Visual and asset-load QA therefore remains outside this report.
- [ ] The exact GoDaddy plan's Node.js/Web Apps support was not available for inspection.

See `AUDIT_REPORT.md` for severity, evidence, and required next steps.
