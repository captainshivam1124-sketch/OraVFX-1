# ORA VFX — Complete Non-Assets Audit

**Audit date:** 2026-10-24  
**Scope:** HTML, root-level CSS/JavaScript, Node server, package/deployment configuration, SEO metadata, tracking/privacy implementation, navigation semantics and documentation.  
**Excluded by request:** contents of `assets/` (not opened, changed or audited). Browser-level visual QA that depends on those files is therefore not certified.

## Executive summary

The five supplied HTML pages and the remaining root-level theme, consent and loader scripts parse cleanly. Local checks found no duplicate HTML IDs, unresolved same-page anchor links, empty anchors, or unsafe `target="_blank"` links without `noopener`/`noreferrer`. The Organization JSON-LD is valid JSON. The Meta Pixel integration is centralized, uses the expected ID, and is consent-gated.

**The non-functional enquiry form has been removed in this cleanup.** The homepage now offers direct WhatsApp and email links, so it no longer depends on the missing `POST /api/enquiry` endpoint or displays a misleading “enquiry sent” confirmation. The Node server and Render health endpoint remain because they are used to serve pages / support the existing hosting configuration. The health route is only a liveness response, not an email-readiness check.

## Priority findings

### Resolved in this cleanup

- **Non-functional enquiry form removed.** Because `server.js` has no email-delivery endpoint, the homepage form and its misleading success state were removed. The section now offers WhatsApp and email links, so visitors are not shown a false submission confirmation. A website-side form/API can be added later only if an actual backend is commissioned and tested.

### High

1. **Static serving exposes project-root files.** The Node static handler serves files beneath the project root by path; local tests confirmed files such as `server.js`, `package.json`, and deployment documentation are accessible through HTTP. No actual secret values were found in the reviewed root-level files, but deploying secrets (for example a future `.env`) into this directory could expose them. Restrict static serving to public files and deny dotfiles/internal documentation before production. This requires a server change and was not made without approval.

### Medium

2. **Cache policy can retain stale application code.** The server gives every non-HTML file `Cache-Control: public, max-age=31536000, immutable`, including unversioned root CSS/JS such as `theme.css`, `theme.js`, and `meta-pixel-consent.js`. Browsers may keep old versions for up to a year after an update. Use revalidation/short-lived caching for HTML/CSS/JS, or consistent content/versioned filenames, after approval for the server caching change.

3. **Sitemap coverage is incomplete.** `sitemap.xml` lists only the homepage even though the project includes `portfolio.html`, `privacy.html`, `terms.html`, and `refund.html`. Add the relevant public pages after confirming the final public domain and canonical URL strategy.

4. **Canonical/social metadata is inconsistent across pages.** Only the homepage contains canonical and Open Graph URL metadata. `portfolio.html` and the legal pages do not have canonical URLs, and portfolio/legal pages lack Open Graph metadata. The current homepage, JSON-LD, `robots.txt`, and sitemap refer to `https://oravfx.com/`; the final production domain was not confirmed by the user, so new absolute canonical URLs were not invented.

5. **Hosting mode is unresolved.** The repository starts a Node HTTP server and contains a `render.yaml` for Render. A normal static upload to `public_html` serves the static pages but does not execute `server.js` or its health route. The current contact UI uses direct links and does not require a backend. GoDaddy's Node support depends on the selected account/features.

### Low / cleanup opportunities

6. **Navigation menu buttons omit `type="button"`.** The current mobile-menu buttons are outside forms and did not fail the structural checks, so this was not treated as a current functional defect. Explicit `type="button"` would be a safe future-proofing improvement.

7. **Legal pages have less metadata than the homepage.** Their titles and descriptions are unique and present, and each has one H1; canonical/Open Graph metadata should be added once the final domain is confirmed.

## Findings that passed

- HTML pages present: `index.html`, `portfolio.html`, `privacy.html`, `terms.html`, `refund.html`.
- Each page has a viewport meta tag, one H1 and one body element.
- No duplicate IDs were found.
- In-page hash links resolve to IDs in the same document.
- No empty anchors were found.
- `target="_blank"` links include `rel="noopener"` or `rel="noreferrer"`.
- Page titles and meta descriptions are present and distinct across the five pages.
- `index.html` has robots, canonical, Open Graph, Twitter card metadata, and Organization JSON-LD; the JSON-LD parses successfully.
- Root JavaScript files passed `node --check`.
- Root CSS files parsed with zero syntax errors.
- Exactly one `meta-pixel-consent.js` reference is present in each of the five HTML pages. Pixel initialization is centralized, uses `1100194509661942`, and records `PageView` only after opt-in.
- The no-`noscript` tracking fallback is intentional: an unconditional tracking image would bypass the consent gate when JavaScript is disabled.
- The theme toggle persists `light`/`dark` choice with `localStorage`, with dark as first-visit default.
- The experimental Venom/symbiote button effect was removed at the project owner's request; no effect CSS/JS remains linked from the homepage.
- Root source contains no literal API key/password/token values identified by the simple reviewed-file scan. This is not a comprehensive secret scan of assets or hosting accounts.

## Changes made in this audit

- `package.json`: added `main: server.js` and a `build` script that syntax-checks the reviewed root JavaScript files. `start` remains `node server.js`.
- `loader-once.js`: ensured the `pageshow` handler is installed even when `sessionStorage` is unavailable, so a browser back/forward-cache restore also suppresses the intro loader. Fresh first visits still show it.
- `README.md`: corrected claims that implied a working enquiry-delivery endpoint and documented the current blocker.
- `DEPLOYMENT.md`: replaced inaccurate “working email endpoint” claims with verified route behavior and hosting decision points.
- `QA-CHECKLIST.md`: replaced stale unchecked-by-auditor pass claims with a record of actual checks and blockers.
- `AUDIT_REPORT.md`: updated the findings to reflect the form removal.
- `index.html`: removed the non-functional form and its success/error states, replacing them with direct WhatsApp and email actions; updated the related FAQ wording.
- `contact-actions.css`: added theme-aware responsive styling for the two direct contact actions.
- `privacy.html`: updated the privacy text to describe direct email/WhatsApp contact rather than form submissions.
- `package.json`, `README.md`, `DEPLOYMENT.md`, and `QA-CHECKLIST.md`: removed stale email API/Resend claims and documented the current contact behavior. Other page content, existing visual design, Meta Pixel logic, team cards, and asset contents were not changed.

## Test results performed

- `npm run build`: **passed** after adding the syntax-check script.
- `node --check` on reviewed root `.js` files: **passed**.
- Recursive CSS syntax parse on root `.css` files: **passed, zero syntax errors**.
- HTML structural scan with BeautifulSoup: **passed** for one body and one H1 per page; no duplicate IDs, empty anchors, unresolved fragment links, or `target="_blank"` anchors missing `noopener`/`noreferrer`.
- Organization JSON-LD parse: **passed**.
- Local HTTP smoke test: **200** for `/`, all five HTML pages, and root theme/consent CSS/JS files.
- Route behavior checks: `POST /api/enquiry` is still not implemented and `GET /api/enquiry` returns 404; the homepage no longer submits to this route. `/api/health` returns `{"ok":true}` as a liveness check only.
- ZIP integrity test: run on the final audit package.

## Not performed / needs external access

- Browser visual QA, real console/network inspection, animation smoothness, viewport screenshots, and actual form submission were not completed in a browser.
- Meta event delivery must be checked on the live website with Meta Events Manager or Meta Pixel Helper; code presence is not proof of delivery.
- The exact GoDaddy account's Node/Web Apps availability was not available for inspection.
- Final domain and canonical URL values need owner confirmation.
- Asset contents were intentionally excluded from this audit as instructed.

## Recommended next actions before production

1. If you want a website form again in the future, decide on a backend/email service and test it before adding the form back. The current version uses direct contact links.
2. Restrict the Node static server to public website files; avoid serving source/docs or any `.env` file.
3. Correct the static-file cache policy with a targeted server change. The health endpoint is documented as liveness-only.
4. Confirm the final domain, then update canonical URLs, Open Graph URLs and sitemap coverage.
5. Confirm whether the GoDaddy plan exposes Node.js/Web Apps if you intend to run `server.js`; static-only `public_html` can serve the current pages and direct contact links without it.
6. Restore the separately maintained original assets, then run browser-based tests and live Meta Pixel verification after deployment.


## Latest owner-requested change: remove experimental Venom effect

- `index.html`: removed the `venom-buttons.css` stylesheet and `venom-buttons.js` script references.
- `venom-buttons.css` and `venom-buttons.js`: deleted from the project; the experimental effect is no longer loaded or injected.
- `meta-pixel-consent.js`: removed effect-specific exclusion attributes that no longer serve a purpose.
- `package.json`: removed the deleted script from the build syntax-check command.
- `README.md`: updated to state that homepage buttons use the existing site styles without the Venom/symbiote layer.

The underlying button elements, labels, destinations, layout, theme toggle, intro-loader, and consent-gated Meta Pixel code were not altered as part of this removal.

Latest removal checks: `npm run build` passed; no active Venom/symbiote references remain in runtime HTML/CSS/JavaScript; ZIP integrity was verified after packaging. Browser-based visual comparison was not available, so restoration of the actual rendered appearance still relies on the original CSS/assets being present at deployment.
