# Project brief

## Description

Shield-optimised sliding-number clock for the Melbourne 3840 × 804 Enplug display using PT Serif and Open Sans.

## Build brief

Purpose:
Create Clock 07 for the Melbourne video-wall clock rotation.

Main features:
- Native 3840 × 804 composition.
- Three mechanical time sections for hour, minute and second.
- Two oversized PT Serif digits per section.
- Open Sans for supporting metadata.
- Aurecon green accent for seconds and separators.
- Melbourne timezone locked to Australia/Melbourne.
- Only changed digits animate using lightweight translate3d transitions.

Constraints:
- Must run smoothly in Enplug on NVIDIA Shield.
- No canvas, WebGL, particle systems, animated SVG filters, blur filters or continuous animation loops.
- Keep DOM count low and animate only changed digits.
- Use locally hosted PT Serif and Open Sans assets in the final repo.
- No Meta or legacy font files.
- Add noindex, nofollow and noarchive protections plus robots.txt.
- GitHub Pages production URL should require no debug query parameters.

Deployment:
Public GitHub repository with GitHub Pages enabled.
