# ORA VFX — Render Ready

Premium cinematic ORA VFX website with lightweight native scroll motion and a real enquiry delivery endpoint.

## Included
- Responsive cinematic website
- ORA intro video loader + hero video
- Portfolio filters and viewport video playback
- Before/after comparison slider
- FAQ accordion
- SEO metadata, canonical URL, Open Graph and Organization schema
- robots.txt + sitemap.xml
- Privacy, Terms and Refund/Cancellation pages
- Render Node web-service configuration
- `/api/enquiry` email delivery through Resend
- WhatsApp fallback when email delivery is unavailable
- Basic server-side validation, honeypot and rate limiting

## Required Render environment variables
- `RESEND_API_KEY`
- `TO_EMAIL` (defaults to `info@oravfx.com`)
- `FROM_EMAIL`

See `DEPLOYMENT.md` for the exact setup.

## Original ORA work media
Uploaded ORA work videos were converted to web-optimized MP4 derivatives. Portfolio videos use `preload="none"` and viewport-based playback so the homepage does not download every video on first paint.
