# Starry Night portal theme

Reference lock: tweakcn's Starry Night preset, reviewed 2026-11-02:
https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts

Applies to the shared authenticated admin/member portal boundary. Existing public
page artwork and editorial layouts keep their own styles. Preserve the horizontal
navigation, compact working lists, grouped forms, logo and locally hosted Jakarta
UI font. This is a palette and component treatment update, not a workflow change.

| Decision | Source / role | Implementation |
| --- | --- | --- |
| Cool light canvas and blue-gray cards | Starry Night background/card | `#f5f7fa` / `#e3eaf2` |
| Midnight canvas and violet-slate cards | Starry Night dark background/card | `#181a24` / `#23243a` |
| Cobalt primary actions | Starry Night primary | `#3a5ba0`; cream light labels, yellow dark labels |
| Gold secondary actions and selected navigation | Starry Night secondary/sidebar accent | `#f7c873` light / `#ffe066` dark, dark text |
| Restrained surface separation | Linear and Krea references via Refero | Thin borders, no ambient glow, no card lift |
| Readable forms and metadata | Existing form density; contrast verification | Strengthen muted text and input outlines from the raw preset |
| Typography | Existing portal accessibility and density | Retain Jakarta for tables/forms rather than introduce the preset's serif body |

Secondary research: https://linear.app and https://krea.ai for dark surface
hierarchy; https://n26.com for restrained financial UI structure. Their palettes,
marketing layouts and imagery are not imported. No bitmap assets are needed.

Tokens and shared component rules live in `src/components/portal-theme.module.css`.
Horizontal and review styles consume these tokens; neither introduces a separate
portal palette. Semantic success/warning/error colors stay distinct from the
primary/secondary action colors. Public document, QR and flyer previews keep their
existing light export canvases.

Visual evidence is generated under ignored `output/playwright/starry-night/`.
Local admin previews use existing synthetic preview content; member address-form
verification mounts the actual AddressForm in that same local portal shell with
synthetic state. This checks styling and PIN response handling without creating
accounts or modifying production data.
