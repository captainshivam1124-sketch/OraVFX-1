# ORA VFX — Cinematic Homepage

A standalone, static single-screen homepage made with semantic HTML, CSS, and vanilla JavaScript. No build step, backend, database, or third-party JavaScript library is required.

## Preview locally

Open `index.html` directly, or serve this folder with any static web server. For production, publish the folder contents to the website's document root. The header intentionally contains only the ORA VFX logo. The hero CTA points to `/work`; destination pages are not included in this homepage-only package. The CTA uses a lightweight Canvas 2D effect for continuously changing branching cyan lightning, interior plasma currents, glowing sparks and a short click burst. Hover/focus triggers a full-cyan energy surge; `prefers-reduced-motion` receives a static energy treatment.

## Cinematic entrance motion

- The supplied logo fades upward into place and receives a one-time masked cyan light trace, plus a restrained cyan-accent pulse and a short hover sweep.
- The studio label line draws first, then the label tracks into place and gets one subtle scan sweep.
- The tagline reveals word-by-word with a single light sweep.
- The fixed headline and changing service line use masked upward reveals and restrained scan sweeps; service phrases rotate in sequence unless reduced motion is preferred.
- The supporting description resolves from a soft blur and receives one faint cyan highlight pass. The thunder CTA follows, then the bottom caption line, caption and ORA VFX signature.
- Motion is CSS-led and uses transform/opacity where practical. Reduced-motion preferences remove stagger delays and skip the animated video sequence while keeping every text element visible.

## Hero visual

- `assets/ora-logo-360.webp` is the supplied ORA VFX logo asset, copied unchanged.
- `assets/images/orb-cyan-cgi.webp` is the cinematic still CGI fallback and the high-priority image loaded at first paint.
- `assets/video/orb-loop.mp4` is now included. It is the supplied orb footage, optimized for web playback and treated with a cyclic crossfade for a smoother repeat. The clip loops continuously, muted and inline.

If autoplay is blocked, the static CGI fallback remains visible. Visitors who prefer reduced motion get the still image rather than the moving video.

## Checks

The HTML is self-contained apart from the supplied and generated images and the included MP4 loop asset. The layout is configured to remain a viewport-height hero without vertical page scrolling, keeps the header logo-only, and respects `prefers-reduced-motion`. The thunder effect is written in vanilla JavaScript and CSS, with no extra animation library.


## Oversized editorial typography update

- The hero headline uses a heavier Manrope 800 treatment with responsive `clamp()` sizing and tight editorial line-height.
- The hero headline uses oversized two-line editorial typography: `CREATIVE VISUALS.` remains fixed while a second line cycles through `POWERFUL CONTENT.`, `VFX & MOTION.`, `AI CREATIVES.` and `SOCIAL CONTENT.` with cyan-highlighted lead words. `REAL BUSINESS IMPACT` remains in the bottom caption. The rotating service phrases recreate the supplied reference video’s large, changing headline treatment.
- Supporting labels, description, original logo, CGI orb/video setup, thunder button, and bottom signatures remain in place.
- Desktop, tablet, and mobile breakpoints use dedicated headline sizes to keep the two-line hierarchy readable without horizontal overflow.


## ORA VFX brand-copy alignment

The homepage hero copy follows the live ORA VFX website's positioning: “Creative Visuals. Powerful Content. Real Business Impact.” The supporting copy names its actual service areas: video editing, VFX, motion graphics, AI-powered creatives, social media content and digital solutions. The small overline uses “Creative Production · Visual Content · Digital Solutions,” the tagline uses “Imagine · Create · Elevate,” the CTA reads “View Our Work,” and the bottom caption uses “Real business impact.” Original layout, logo, orb video/fallback and electric button implementation are preserved.


## Landing-page art direction refinement

- Copy was tightened to sound more natural while remaining grounded in ORA VFX's actual work areas: video editing, VFX, motion graphics, AI-led creative and social content.
- Background glow, floating particles, streaks and signature shimmer have been restrained so the orb and headline carry the composition. The electric-thunder CTA remains the intentional high-energy interaction.
- Added a very subtle, static tileable film-grain texture for a less sterile, more cinematic finish.
- Service-word rotation has been slowed slightly for a calmer, more deliberate rhythm; the logo, orb loop, colors, routes, and one-screen layout remain unchanged.


Favicon cache fix (2026-10-28)
- The supplied square ORA mark is available as root `favicon.png`, root `favicon.ico`, and `assets/favicon.png`.
- `index.html` points to the root icons with a new cache-busting query version.
- When deploying, upload/commit `index.html`, `favicon.ico`, and `favicon.png` to the same public root; keep `assets/favicon.png` too. Overwrite existing files.
- After deployment, hard refresh or open a private window if the old tab icon remains cached.


Navigation note: the “View Our Work” CTA in the root landing page points to `/home/index.html`. Add your separate `home/index.html` page to the deployed project for this destination to resolve.
