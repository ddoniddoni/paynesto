# Design System Color Refresh

## Goal

Improve the visual quality of the design system by replacing the current
washed-out beige/teal balance with a more intentional palette that still fits
Paynesto's practical money-management product tone.

## Current Issues

- Background, surface, and border colors are too close together.
- Accent green is usable, but the surrounding neutrals are too muted to make
  the interface feel crisp.
- Selected states and accent surfaces do not stand out enough from default
  cards and containers.

## Palette Direction

- Use only these four colors as the core system palette:
  - `#454040`
  - `#605B51`
  - `#D8D365`
  - `#E6F082`
- Light mode uses the two greens as page/surface layers and the two browns for
  structure and typography.
- Dark mode reverses that balance so the browns become the canvas and the greens
  become the readable foreground/accent set.

## Change Scope

- Update color tokens in `src/constants/theme.ts`
- Remove hardcoded accent green in text variants
- Slightly improve native tab indicator emphasis through the theme

## Expected Outcome

- Better contrast between page background and cards
- Stronger focus states and selected states
- More attractive primary actions without changing component structure
