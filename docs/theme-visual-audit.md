# Garden Theme Visual Audit

Date: 2026-06-15

Reference source: `garden-skills`, path `skills/web-design-engineer/references/style-recipes`.

The project now maps all 23 built-in themes to garden-style recipes and renders local Remotion previews against the corresponding garden reference image.

## How To Regenerate

```bash
pnpm run preview:themes
pnpm run check
```

Generated local evidence is written to `out/theme-previews/`:

- `compare.html`: side-by-side local preview and garden reference for every theme.
- `contact-sheet.html`: compact full-theme comparison page.
- `contact-sheet.png`: screenshot contact sheet generated from the comparison page.
- `<theme>.png`: local Remotion preview per theme.
- `references/<theme>--<recipe>.webp`: garden reference per theme.

`out/` remains ignored so generated images do not bloat the repository.

## Acceptance Matrix

| Theme | Garden recipe | Result |
| --- | --- | --- |
| `midnight-press` | `linear` | Dark builder-tool UI with hairline borders, subdued purple, and product panel overlay. |
| `warm-keynote` | `aesop` | Warm chamois ground, serif copy, and amber apothecary bottle object. |
| `newsroom` | `nyt-the-daily` | White editorial page, black serif, NYT red, and masthead/rule system. |
| `bauhaus-bold` | `vignelli-swiss-helvetica` | White/black/red Swiss block system with one-color discipline. |
| `paper-press` | `stripe-press` | Warm paper, serif editorial layout, and book-object proxy. |
| `blueprint` | `dieter-rams-braun` | Light industrial grid, orange signal, restrained functional layout. |
| `bold-signal` | `bloomberg-businessweek-turley` | High-impact magazine-cover composition with orange/yellow/blue blocks. |
| `chalk-garden` | `headspace-meditation` | Peach/coral/sage palette with rounded mascot and soft wellness tone. |
| `creative-voltage` | `field-io` | Near-black generative cyan/violet energy and cinematic motion language. |
| `dark-botanical` | `active-theory` | Cinematic black with vivid green accent and atmospheric depth. |
| `dune` | `muji-kenya-hara` | Quiet off-white stage, small red marker, and object-like whitespace. |
| `electric-studio` | `vercel-mesh` | True black, restrained mesh glow, and technical white/gray precision. |
| `forest-ink` | `tufte-dataink` | Warm paper, red/slate data ink, and sparse analytical rules. |
| `indigo-porcelain` | `apple-hig` | White/soft gray stage, Apple-blue accent, product-card proxy, generous space. |
| `kraft-paper` | `are-na` | Honest web layout with default blue/purple links and raw content blocks. |
| `monochrome-print` | `pentagram` | High-contrast type-as-image poster system. |
| `neon-cyber` | `raycast` | Dark glass command-palette UI with Raycast red. |
| `pastel-dream` | `notion-pre-ai` | White/cream page, warm black ink, doodle card, and soft mint block. |
| `split-canvas` | `monocle-magazine` | Cream editorial spread with red kicker, stats, and feature/photo block. |
| `sunset-zine` | `mailchimp-freddie` | Yellow hero, warm black, pop pink, and mascot-like graphic. |
| `swiss-ikb` | `vignelli-swiss-helvetica` | Swiss grid, one blue accent, and strong black rules. |
| `terminal-green` | `bloomberg-terminal` | Dense navy/amber terminal panes, ticker, and tabular data surface. |
| `vintage-editorial` | `mid-century-modern` | Cream/mustard/brick flat-print composition. |

The implementation references the garden recipes through local theme tokens and Remotion visual primitives. It does not import the garden website runtime.
