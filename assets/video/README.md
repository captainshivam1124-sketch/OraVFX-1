# ORA VFX hero video

`orb-loop.mp4` is included in this project. It is the supplied 1920×1080 cyan liquid-metal orb footage, converted to a web-ready H.264 MP4 with audio removed and a short cyclic crossfade to smooth its wraparound point. The page plays this clip muted, inline, and on an infinite loop.

The static CGI at `../images/orb-cyan-cgi.webp` remains underneath as a fallback if autoplay is blocked. Users with `prefers-reduced-motion: reduce` get the static still rather than an automatically moving background.

To replace the loop later, keep the filename `orb-loop.mp4`, use a consistent 16:9 composition, and optimize for web delivery. No separate intro clip is required for this single-loop setup.
