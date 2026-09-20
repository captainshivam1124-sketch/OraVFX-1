# ORA VFX — Render deployment with enquiry delivery

The site is a lightweight Node.js web service on Render. It serves the existing static website and adds one small `/api/enquiry` endpoint for the enquiry form. No frontend framework or heavy runtime was added.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Prepare ORA VFX for Render with enquiry delivery"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 2. Create the Render service

Use **New → Web Service** and connect the GitHub repository.

- Runtime: Node
- Build Command: leave blank
- Start Command: `node server.js`
- The included `render.yaml` can also be used as the Blueprint configuration.

## 3. Configure enquiry email delivery

The form sends enquiries to `info@oravfx.com` through Resend.

Add these Render environment variables:

- `RESEND_API_KEY` — your Resend API key
- `TO_EMAIL` — `info@oravfx.com` (already defined by `render.yaml`)
- `FROM_EMAIL` — a sender address on a domain verified in Resend, for example `website@oravfx.com`

Before using production email, verify `oravfx.com` in Resend and use a sender address from that verified domain.

## 4. How the form works

`Website form → Render /api/enquiry → Resend → info@oravfx.com`

The visitor's email is used as the reply-to address. If email delivery is temporarily unavailable, the form does not pretend the enquiry was sent; it shows a WhatsApp handoff containing the submitted details.

## 5. Health check

Render can check:

`/api/health`

It reports whether the email environment variables are configured. No email address or API key is exposed to the browser.

## 6. WhatsApp

The fallback WhatsApp number is the existing ORA VFX number: `8298760308`.

## SEO / performance

The existing canonical URL, metadata, structured data, robots.txt, sitemap.xml, legal pages, compressed media and lightweight native animations are preserved. No frontend framework or animation library was added for the enquiry feature.
