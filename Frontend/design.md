# Budgetly — Design Document

## App Overview

**Budgetly** is a personal budgeting mobile app that helps users track daily expenses by month, visualize spending patterns, and get AI-powered spending summaries. It is warm, friendly, and playful — making finance feel approachable rather than stressful.

---

## Aesthetic Direction

**Style**: Warm Retro-Playful — inspired by the reference design's cream backgrounds, bold chunky typography, cartoon-friendly rounded corners, and vibrant color-blocked cards.

**Tone**: Approachable, fun, and motivating. Like a friendly financial buddy, not a bank dashboard.

**What Makes It Unforgettable**: A warm cream/off-white base with punchy color-blocked month cards, bold hand-feel typography, quirky illustrated mascot touches, and a satisfying "Summarize with AI" interaction that feels delightful.

---

## Color Palette

```css
:root {
  --bg:          #F5F0E8;   /* Warm cream — primary background */
  --surface:     #FFFFFF;   /* Card/modal surface */
  --primary:     #4A6CF7;   /* Cobalt blue — CTAs, borders, accents */
  --accent-red:  #E8533A;   /* Tomato red — spending alerts, highlights */
  --accent-gold: #F2C14E;   /* Warm gold — positive/savings indicators */
  --accent-mint: #5ECFA0;   /* Mint green — income / success states */
  --text-dark:   #1A1A2E;   /* Near-black for headings */
  --text-mid:    #5A5A7A;   /* Mid-grey for body/labels */
  --text-light:  #A0A0B8;   /* Light grey for placeholders */
  --border:      #D8D0C4;   /* Subtle warm border */
  --shadow:      rgba(74, 108, 247, 0.12);
}
```

---

## Typography

```
Display / Headings : "Fraunces" (Google Fonts) — serif with personality, warm and editorial
UI / Body          : "DM Sans" (Google Fonts) — clean, rounded, highly legible
Monospace / Numbers: "DM Mono" — for amounts, dates, numeric data
```

- Month names: `Fraunces`, 28–32px, bold, `var(--text-dark)`
- Card labels: `DM Sans`, 13px, medium, `var(--text-mid)`
- Currency amounts: `DM Mono`, 20–24px, bold

---

## Screen Architecture

### 1. Home Screen — Month Grid

**Layout**: 2-column grid of month cards, scrollable vertically.

Each **Month Card**:
- Rounded corners: `border-radius: 20px`
- Background: alternates between `--primary`, `--accent-red`, `--accent-gold`, `--accent-mint` (color-blocked like reference)
- Contains:
  - Month name in `Fraunces` (e.g. "January")
  - Year in small `DM Sans`
  - Total spend amount in `DM Mono`
  - A small sparkline/bar to hint at spending trend
- Hover/tap: slight lift shadow + scale(1.03) transition (150ms ease)

**Header**:
- "Hello," in `DM Sans` small caps
- User name in `Fraunces` 30px bold
- Notification bell icon + avatar (circular, top-right)

---

### 2. Month Detail Screen — January 2026

**Header**: Back arrow + Month + Year in `Fraunces` 26px

**Day Selector Strip**:
- Horizontal scrollable row of day pill buttons
- Active day: filled `--primary` background, white text, `DM Mono`
- Inactive: outlined, `--border`, `--text-mid`
- Overflow indicated by `....` fade + arrow

**Summary Cards** (below day strip):
- `Total Spending` card — full width, `--surface`, shows total amount in `DM Mono` 28px bold in `--accent-red`
- `Most Spent On` card — full width, shows top category icon + label + amount

**Charts Section**:
- Two side-by-side chart cards:
  - Left: **Donut/Pie chart** — spending by category
  - Right: **Bar chart** — daily spending trend for the month
- Chart cards: `--surface`, `border-radius: 16px`, subtle `--shadow`

**AI Summarize Button**:
- Full-width pill button
- Background: `--primary`
- Text: "✦ Summarize with AI" in `DM Sans` 15px bold, white
- Subtle shimmer animation on idle (CSS `@keyframes shimmer`)
- On press: slight scale-down (0.97) + color pulse

---

### 3. Day Entry Screen — 31 January 2026

**Header**: Date in `Fraunces` 22px bold

**Entry Table**:
- Rows: each row = one expense entry
- Columns: Category icon | Description | Amount
- Row dividers: 1px `--border`
- Empty rows show dashed placeholder styling

**Add Entry Button**:
- Outlined pill button, `--primary` border + text
- Icon: `+` prefix
- Tap opens a bottom sheet / modal

**Add Entry Bottom Sheet**:
- Fields: Description (text), Category (icon picker), Amount (numeric, `DM Mono`), Date
- Save CTA: filled `--primary` pill button "Save Entry"
- Cancel: text link

---

### 4. AI Summarization Popup / Overlay

**Trigger**: "Summarize with AI" button on Month Detail screen

**Presentation**: Modal card slides up from bottom (spring animation)

**Content**:
- Month chip strip at top (same day selector aesthetic for month navigation)
- Large text area showing the AI-generated spending summary
  - Streams in word-by-word with a blinking cursor effect
  - Uses `DM Sans` 15px, `--text-dark`, line-height 1.6
  - Highlights key figures in `DM Mono` `--accent-red` inline

**Footer**:
- "Summarize with AI" button again (to regenerate)
- Small disclaimer: "Powered by Claude AI" in `--text-light` 11px

---

## Component Specs

### Month Card
```
Width:          ~165px (2-col grid with 16px gap)
Height:         ~120px
Border-radius:  20px
Padding:        16px
Font (name):    Fraunces, 20px, Bold
Font (amount):  DM Mono, 18px, Bold, white
Background:     Rotates through: --primary, --accent-red, --accent-gold, --accent-mint
```

### Day Pill Button
```
Height:         36px
Min-width:      40px
Border-radius:  50px
Font:           DM Mono, 14px, Bold
Active bg:      --primary
Active text:    white
Inactive:       outlined --border, text --text-mid
```

### Primary CTA Button (Summarize with AI)
```
Height:         52px
Border-radius:  50px
Background:     --primary
Font:           DM Sans, 15px, 600
Color:          white
Shadow:         0 4px 20px var(--shadow)
Animation:      Idle shimmer + tap scale(0.97)
```

### Expense Entry Row
```
Height:         52px
Layout:         Icon (32px) | Description flex-1 | Amount DM Mono
Border-bottom:  1px solid --border
Padding:        0 16px
```

---

## Motion & Interaction

| Interaction | Animation |
|---|---|
| Screen transition | Slide in from right, 300ms ease-out |
| Month card tap | scale(1.03) lift, 150ms |
| AI button idle | CSS shimmer sweep every 3s |
| AI popup open | Slide up from bottom, spring (stiffness 300, damping 30) |
| AI text stream | Character-by-character reveal, blinking cursor |
| Day pill switch | Background color crossfade, 150ms |
| Entry row add | Fade + slide-down from top of list, 200ms |

---

## Iconography

- Style: **Rounded stroke icons**, 2px stroke weight (Lucide or Phosphor icon set)
- Category icons: small colored circle badge + icon (Food 🍔, Transport 🚌, Shopping 🛍, Health ❤️, Entertainment 🎬, Other ⚡)
- Navigation: Back arrow, Bell, Avatar, Plus, Chart icons

---

## Spacing System

```
Base unit: 4px
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
```

- Screen padding: `16px` horizontal
- Card gap: `12px`
- Section gap: `24px`

---

## Responsiveness

This is a **mobile-first** app. Target:
- Base width: 390px (iPhone 14 Pro)
- Max content width: 430px
- The web/React version should simulate a phone shell container centered on desktop

---

## Implementation Notes

- **Framework**: React (with hooks) or plain HTML/CSS/JS
- **Charts**: Use `recharts` (for React) or `Chart.js` (for HTML)
- **Fonts**: Load from Google Fonts — Fraunces, DM Sans, DM Mono
- **AI Integration**: Call Anthropic `/v1/messages` endpoint with Claude Sonnet. Pass the month's expense data as JSON context and prompt: *"Summarize this user's spending for [Month Year] in 3–4 friendly sentences, highlight the biggest category and one saving tip."*
- **State**: Month → Day → Entries hierarchy. Store as `{ [monthKey]: { [day]: Entry[] } }`
- **Storage**: `window.storage` API for persistent data across sessions

---

## Sample Data Shape

```json
{
  "2026-01": {
    "label": "January 2026",
    "entries": [
      { "id": "e1", "day": 1, "description": "Lunch at Cafe", "category": "Food", "amount": 450 },
      { "id": "e2", "day": 1, "description": "Uber", "category": "Transport", "amount": 180 },
      { "id": "e3", "day": 3, "description": "Groceries", "category": "Food", "amount": 920 }
    ]
  }
}
```

---

## AI Prompt Template

```
System: You are a friendly personal finance assistant. Be warm, concise, and encouraging.

User: Here is my spending data for {month}:
{JSON.stringify(entries)}

Summarize my spending in 3-4 sentences. Mention:
1. Total spend
2. Biggest spending category
3. One actionable saving tip

Keep it friendly and under 80 words.
```

---

*Design document for Budgetly v1.0 — Ready for implementation.*