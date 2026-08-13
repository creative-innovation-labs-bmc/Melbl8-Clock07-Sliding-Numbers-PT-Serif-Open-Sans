# Project brief

## Purpose
Create a visually distinct, kinetic clock for the Melbourne Level 8 ultra-wide display while keeping runtime cost low enough for Enplug on NVIDIA Shield.

## Native canvas
3840 × 804.

## Concept
Large mechanical numeral windows. Each changed digit rolls upward and the next value enters from below. The movement should feel physical without recreating a full split-flap mechanism.

## Hard constraints
- Melbourne time via `Australia/Melbourne`.
- PT Serif for large serif numerals.
- Open Sans for sans-serif interface text.
- Use only the approved PT Serif and Open Sans font assets. No old Meta or legacy brand fonts.
- No external runtime frameworks.
- No continuous 60 fps animation loop.
- No canvas, WebGL, animated filters or large DOM fields.
- Production URL must work without query-string parameters.
- Prevent search-engine indexing where supported by page-level robot directives and `robots.txt`.

## QC target
Test at native 3840 × 804 and at common mobile/desktop viewport ratios. The target display is the NVIDIA Shield/Enplug path, so animation simplicity takes priority over effects.
