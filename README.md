# Melbl8 Clock07 — Sliding Numbers

A GPU-friendly mechanical sliding-number clock designed for the 3840 × 804 Melbourne Level 8 display and playback through Enplug on NVIDIA Shield.

## Design

- Three units: HOUR, MINUTE, SECOND
- Two large PT Serif digits per unit
- Open Sans for labels and metadata
- Aurecon green `#89C925` used for separators and seconds
- Backgrounds use `#1C1B1C` and `#373A36`
- Melbourne time is explicit via `Australia/Melbourne`, independent of the player device timezone

## Performance strategy

- Fixed 3840 × 804 composition scaled only on viewport changes
- Only changed digits animate
- Two faces per digit, not a 0–9 stack
- `translate3d()` only for rolling animation
- No canvas, particles, SVG filters, blur, video or continuous animation loop
- Clock data updates once per second
- PT Serif and Open Sans use the approved Clock05 GitHub-hosted font assets with system-font fallbacks

## Display

Production URL:

`https://creative-innovation-labs-bmc.github.io/Melbl8-Clock07-Sliding-Numbers-PT-Serif-Open-Sans/`

No query-string parameters are required for Enplug.

## Search indexing

The page includes `noindex`, `nofollow`, `noarchive`, `nosnippet` and `noimageindex` robot directives. `robots.txt` also disallows crawling.
