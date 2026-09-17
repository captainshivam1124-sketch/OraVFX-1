OraVFX — Premium Our Creative Team Update

Files:
- index.html — existing site + ONLY the new Team section inserted immediately above the footer.
- style.css — existing CSS + ONLY scoped .oravfx-team-* styles appended.
- script.js — existing JavaScript + ONLY isolated team data/render/GSAP behavior inserted.

Team images expected at:
 /assets/team/member-01.jpg
 ...
 /assets/team/member-08.jpg

Edit the oravfxTeamMembers array in script.js to replace names, roles, descriptions, skills and links.

The existing footer was not modified. Existing sections, libraries and event handlers were left intact.

Payments:
- Start the root server with RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET set in the server environment.
- Configure the Razorpay webhook URL as /api/webhooks/payment and subscribe to payment.captured, payment.failed, and order.paid.
- The browser receives only the public key ID. Amounts are read from data/packages.json and converted to minor units on the server.
- Without Razorpay credentials, customers can still choose manual invoice / bank transfer.


SEO / deployment notes:
- index.html now includes descriptive title/description, robots directives, canonical /ora/ URL, Open Graph/Twitter metadata, favicon, and Organization/WebSite structured data.
- The Node server exposes /robots.txt and /sitemap.xml dynamically from the current host.
- Keep /ora/ as the public site path when using this server, or update the canonical/structured-data URLs if deploying the HTML at a different path.
- Static/API responses include baseline security headers.
