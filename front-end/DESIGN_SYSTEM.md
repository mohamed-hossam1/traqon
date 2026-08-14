# Design System

Warm, editorial aesthetic inspired by print newspapers and financial dashboards. Typographically rich, data-dense, quietly opinionated. All corners are square by choice.

---

## Palette

| Token               | Light    | Dark    | Usage                            |
|---------------------|----------|---------|----------------------------------|
| `--background`      | `#f4ede0`| `#1f1c14`| Page background                 |
| `--foreground`      | `#1f1c14`| `#f4ede0`| Primary text, structural borders|
| `--card`            | `#f9f3e7`| `#2a2620`| Elevated surface / card bg      |
| `--muted-foreground`| `#7a7264`| `#a89e8c`| Secondary text, labels          |
| `--accent`          | `#c14a2b`| `#e05a3a`| Highlight, active state, CTA    |
| `--accent-foreground`| `#f4ede0`| `#1f1c14`| Text on accent backgrounds      |
| `--destructive`     | `#b6422f`| `#e05a3a`| Errors, destructive actions     |
| `--border`          | `#d6cdb6`| `#3d3830`| Subtle dividers                 |
| `--good`            | `#406b3a`| `#5a9b50`| Positive metrics                |
| `--bad`             | `#b6422f`| `#e05a3a`| Negative metrics                |
| `--title`           | `#1f1c14`| `#f4ede0`| Heading text (= foreground)     |
| `--subtitle`        | `#7a7264`| `#a89e8c`| Secondary text (= muted-fg)     |

Background is warm cream (light) / near-black (dark). Borders use `foreground` for structural dividers, `border` for lighter separators.

---

## Typography

### Font Stack

| Token               | Family                                             | Role                          |
|---------------------|----------------------------------------------------|-------------------------------|
| `--serif-display`   | `'DM Serif Display'`, `'Iowan Old Style'`, Georgia, serif | Headlines, section titles     |
| `--serif-body`      | `'DM Serif Text'`, `'Iowan Old Style'`, Georgia, serif    | Body copy, notes, italic text |
| `--mono`            | `'IBM Plex Mono'`, `ui-monospace`, monospace             | Labels, metadata, badges      |

### Scale

| Element               | Font            | Size    | Weight  | Style  | Extras                                        |
|-----------------------|-----------------|---------|---------|--------|-----------------------------------------------|
| Page heading (`h1`)   | `--serif-display`| 30px   | 400     | italic | `tracking-[-0.005em]`, `leading-tight`        |
| Section heading (`h2`)| `--serif-display`| 24px   | 400     | italic | `tracking-[-0.005em]`, `leading-[1.1]`        |
| User name (profile)   | `--serif-display`| 20px   | 400     | normal | `leading-tight`                                |
| Sidebar tab trigger   | `--serif-body`  | 15px    | 400     | normal |                                                |
| Body / note           | `--serif-body`  | 14px    | 400     | italic | Color `--subtitle`                             |
| Auth form link        | `--serif-body`  | 14px    | 700     | normal | Color `--accent`                               |
| Field error           | `--serif-body`  | 14px    | 400     | italic | Color `--destructive`                          |
| Field label (auth)    | `--mono`        | 11px    | 500     | normal | `tracking-widest`, uppercase                   |
| Field label (profile) | `--mono`        | 11px    | 500     | normal | `tracking-[0.18em]`, uppercase                 |
| Timestamp / sidebar   | `--mono`        | 11px    | 400     | normal | `tracking-[0.18em]`, uppercase                 |
| Badge                 | `--mono`        | 10px    | 400     | normal | `tracking-[0.06em]`, uppercase                 |
| "or" divider          | `--mono`        | 10px    | 400     | normal | `tracking-widest`, uppercase                   |
| Auth button           | `--mono`        | 12px    | 700     | normal | `tracking-widest`, uppercase                   |
| Button (destructive)  | `--mono`        | 12px    | 700     | normal | `tracking-[0.18em]`, uppercase                 |
| Avatar fallback       | `--mono`        | 12-16px | 500     | normal | `tracking-[0.06em]`, uppercase                 |

### Principles

- Headlines use the display serif in italic. Never bold.
- Body text is always the text serif, often italic and muted (subtitle).
- All metadata, labels, and system text use monospace — always uppercase with generous tracking.
- No border-radius anywhere on auth/profile surfaces. `rounded-none` is a conscious choice.
- Line height: `1.1` for display headings, `1.55` for body (set globally).

---

## Components

### AuthCard

```
┌──────────────────────────────────────┐
│                                      │  ← 4px accent top border
│  [content]                           │
│                                      │
└──────────────────────────────────────┘  ← 1px foreground border
```

```
<Card className="w-full max-w-md border border-foreground border-t-4 border-t-accent bg-card rounded-none shadow-none p-6 md:p-8">
  <CardContent className="p-0">{children}</CardContent>
</Card>
```

### AuthFieldLabel

Monospace 11px uppercase label for auth form fields:
```
className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1 block"
```

### AuthInput

Full-bleed input with no border-radius, accent focus ring:
```
className="rounded-none border-foreground focus-visible:ring-0 focus-visible:border-accent text-foreground bg-background placeholder:text-muted-foreground/60 h-10 px-3 w-full"
```

### ProfileFieldLabel

Monospace 11px uppercase label with optional icon for profile forms:
```
className="flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
```

### Badge

Small inline tag — used for "Verified", "Current", "Link expired":
```
className="inline-flex items-center bg-accent px-1.5 py-[3px] font-mono text-[10px] tracking-[0.06em] uppercase text-accent-foreground"
```

### SectionHeader

```
<h2 className="font-serif-display italic text-2xl text-title leading-[1.1] tracking-[-0.005em]">
  {title}
</h2>
<p className="mt-1 font-serif-body italic text-sm text-subtitle">
  {description}
</p>
```

### ProfileDialog

Modal dialog with sidebar + scrollable tab panels:
```
className="flex h-[min(680px,calc(100dvh-2rem))] max-w-[920px] flex-col gap-0 overflow-hidden rounded-none border border-foreground bg-card p-0 ring-0 shadow-none sm:max-w-[920px]"
```

- Sidebar: `w-full md:w-[260px]`, `border-b border-foreground md:border-b-0 md:border-r`
- Content: `min-h-0 flex-1 overflow-y-auto`

### SessionCard

```
┌──────────────────────────────────────┐
│ [icon]  Browser label      [Current] │  ← accent left border for current
│         Signed in · 12 May 2026      │
│                           [Revoke]   │  ← destructive button
└──────────────────────────────────────┘
```

- Current session: `border-foreground border-l-4 border-l-accent`
- Other sessions: `border-border`

### Button Variants

| Variant          | Style                                                                         |
|------------------|-------------------------------------------------------------------------------|
| `auth`           | `bg-foreground text-background hover:bg-accent hover:text-white`              |
| `auth-outline`   | `border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background` |
| `auth-destructive` | `border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-background` |

| Size       | Dimensions          |
|------------|---------------------|
| `auth-lg`  | `w-full py-5 gap-2`  |
| `auth-md`  | `w-full py-3 px-4 gap-2` |
| `auth-sm`  | `py-2 px-3 gap-2`    |

All auth buttons: `rounded-none`, `font-mono text-xs uppercase tracking-widest font-bold`, `duration-150`.

### Error State

```
┌─── border-destructive bg-destructive/5 ────┐
│ ⚠ Failed to load sessions                  │
│   Something went wrong.          [Retry]   │  ← auth-outline sm button
└────────────────────────────────────────────┘
```

### Loading Skeleton

```
className="h-10 animate-pulse rounded-none bg-foreground/10"
```

### "Or" Divider (auth form)

```
─────── or ───────
```
```
<div className="flex items-center gap-3 py-1">
  <div className="h-px flex-1 bg-border" />
  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
  <div className="h-px flex-1 bg-border" />
</div>
```

### Empty State

```
┌─── border-border bg-card ────┐
│ ✓ No other active sessions.  │
└──────────────────────────────┘
```

---

## Borders & Dividers

| Type              | Style                          | Usage                          |
|-------------------|--------------------------------|--------------------------------|
| Structural        | `1px solid var(--foreground)`  | Card edges, dialog, inputs     |
| Accent top        | `4px solid var(--accent)`      | AuthCard, profile info card    |
| Accent left       | `4px solid var(--accent)`      | Current session card           |
| Subtle divider    | `1px solid var(--border)`      | Between sections, "or" line    |
| Error             | `1px solid var(--destructive)` | Error state containers         |

All auth/profile surfaces use `rounded-none`. Never use box shadows — depth comes from border weight hierarchy.

---

## Spacing

- Base unit ~4px.
- Common values: `1.5`, `2`, `2.5`, `3`, `4`, `5`, `6`, `7`, `8`.
- AuthCard: `p-6 md:p-8`, inner gap `6`.
- Profile tab panels: `px-6 py-6`, inner gap `7`.
- Section header: `mt-1` on description.
- Input padding: `px-3`, `h-10`.
- Session card: `px-3 py-3`, `gap-3`.

---

## Tone & Voice

- Terse. Lowercase. Opinionated.
- Labels are factual and clipped: `SIGNED IN · 12 MAY 2026`, `SENT TO`.
- Use `·` as a separator in inline metadata.
- Notes read like editorial asides: *"Manage devices where you are currently signed in."*
- Arrows (`↑`, `↓`) for trend indicators, not icons.

---

## Implementation Notes

All colors, fonts, and spacing are defined as CSS custom properties in `app/globals.css` and mapped to Tailwind v4 theme via `@theme inline`. Prefer `border` over `shadow`. Prefer `max-width` constraints on text over full-bleed paragraphs.

Auth/profile surfaces intentionally override the base UI's `rounded-lg` with `rounded-none`. This is the defining visual choice.
