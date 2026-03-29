# Soneker — Exact Images to Capture for Every Post

> For every post in BUILD_IN_PUBLIC_CONTENT.md, here is exactly:
> - Which screen to open
> - What to do before screenshotting
> - How to crop/frame it
> - What the image should show

---

## HOW TO TAKE GOOD SCREENSHOTS

**Tools you need:**
- Mac: `Cmd + Shift + 4` → drag to select area (clean crop, no browser UI)
- Mac: `Cmd + Shift + 5` → record screen for video/GIF
- To record a GIF: use **Kap** (free app) or **CleanMyMac Screen Recorder**
- To add annotation/arrows: use **CleanShot X** or just macOS Preview

**Rules for every screenshot:**
1. Use a clean browser — no open tabs visible, no address bar if possible (use full-screen or hide browser chrome)
2. Set browser to light mode OR dark mode — pick one and be consistent across all posts
3. Zoom browser to 90% (`Cmd + -`) — shows more content, looks cleaner
4. Use a real video — analyze a real YouTube video before taking any screenshot
5. If showing mobile: use Chrome DevTools → iPhone 14 Pro (390px width)

---

## IMAGE 1 — The Knowledge Cards View
**Used for:** Demo posts, origin story, "before/after" posts

### What to analyze first:
Pick any well-known educational video. Good options:
- Any YC / Startup School talk
- Any Ali Abdaal video about productivity
- Any business/entrepreneur interview
- Any TED talk on a concrete topic

### What to screenshot:
Open Soneker result screen → right panel (Knowledge Cards)

**Exact steps:**
1. Analyze a video
2. Wait for result screen
3. Go to the right panel where the cards are
4. Scroll so 2–3 full cards are visible
5. Each card should show: title, body text, tags
6. Screenshot from the top of the first card to the bottom of the third card

**What the image shows:**
```
┌─────────────────────────────────────────┐
│  [Section badge: e.g. STRATEGIC]        │
│                                         │
│  01  Card Title Here                    │
│      ─────────────────                  │
│      Body text of the concept,          │
│      explaining the idea clearly        │
│      in 2-3 lines...                    │
│                                         │
│      #tag1  #tag2  #tag3               │
├─────────────────────────────────────────┤
│  02  Second Card Title                  │
│      ─────────────────                  │
│      Body text here...                  │
│                                         │
│      #tag1  #tag2                       │
├─────────────────────────────────────────┤
│  03  Third Card Title                   │
│      ...                                │
└─────────────────────────────────────────┘
```

**Crop:** Just the cards panel. Cut off navigation bars above.

---

## IMAGE 2 — The Knowledge Map
**Used for:** "This is my favorite feature" posts, concept map demo, visual hook posts

### What to screenshot:
Open result screen → left panel → scroll down past the video player → Knowledge Map section

**Exact steps:**
1. Analyze a video with 8+ concepts (longer video = more nodes)
2. Open result screen
3. Find the Knowledge Map section (network graph)
4. Let it fully render — all nodes should be visible
5. If nodes are clustered: click and drag a few to spread them out
6. Screenshot the full map area

**What the image shows:**
```
        [Node: Concept A] ──── [Node: Concept B]
              │                       │
              └──── [Center: Topic] ──┘
                    /        \
         [Node: C]           [Node: D]
              │
         [Node: E] ──── [Node: F]
```

**Tips:**
- The more spread out the nodes, the more impressive it looks
- Make sure node labels are readable (zoom in if needed)
- Dark mode looks better for the map — it pops more

---

## IMAGE 3 — Smart Vocabulary Tab
**Used for:** Language learner posts, "features you didn't know existed" posts

### What to screenshot:
Open result screen → left panel → scroll to Smart Vocabulary section (below Knowledge Map)

**Exact steps:**
1. Analyze a video with domain-specific language (tech, business, science — not casual chat)
2. Find the Smart Vocabulary section
3. Scroll so you see 5–8 vocabulary terms
4. Each term shows: term name + definition
5. Screenshot the full vocabulary list

**What the image shows:**
```
┌─────────────────────────────────────────┐
│  SMART VOCABULARY                       │
│                                         │
│  Term 1                                 │
│  Definition of the term in context...   │
│                                         │
│  Term 2                                 │
│  Definition here...                     │
│                                         │
│  Term 3                                 │
│  Definition here...                     │
└─────────────────────────────────────────┘
```

---

## IMAGE 4 — Deep Panel (Expanded Card)
**Used for:** "Here's what AI extracts beyond the summary" posts, product depth posts

### What to screenshot:
Open a knowledge card → click "Explore deeper" or equivalent → the deep panel slides in

**Exact steps:**
1. After analysis, click on any knowledge card
2. The deep panel opens on the right (or slides in on mobile)
3. It shows structured rows: label + value (e.g. "Key Metric:", "Core Strategy:", etc.)
4. Screenshot 3–5 rows of the deep panel content

**What the image shows:**
```
┌─────────────────────────────────────────┐
│  DEEP PANEL TITLE                       │
│                                         │
│  Key Metric:                            │
│      $30K MRR in 4 days post-launch     │
│                                         │
│  Core Strategy:                         │
│      3-part playbook: Content,          │
│      Waitlist, Webinars                 │
│                                         │
│  Main Insight:                          │
│      Emails — not viral content —       │
│      were the primary driver            │
└─────────────────────────────────────────┘
```

---

## IMAGE 5 — Full Desktop Split View
**Used for:** "This is what the full product looks like" posts, launch announcement

### What to screenshot:
The full result screen showing both panels side by side

**Exact steps:**
1. Analyze a video
2. On the result screen, do NOT interact with it yet
3. Make sure you can see: left panel (video player + map) AND right panel (cards)
4. Screenshot the full browser window (no browser chrome)
5. This is your "hero product screenshot"

**What the image shows:**
```
┌──────────────────┬──────────────────────┐
│  Video player    │  [Filter bar]        │
│  ─────────────── │                      │
│  Knowledge Map   │  01 Card Title       │
│  [graph nodes]   │     Body text...     │
│                  │     #tags            │
│  Smart Vocab     │  ─────────────────── │
│  term1, term2... │  02 Card Title       │
│                  │     Body text...     │
└──────────────────┴──────────────────────┘
```

---

## IMAGE 6 — Mobile View (Cards Tab)
**Used for:** Mobile announcement posts, "works on any device" posts

### How to capture mobile view:
**Option A — Chrome DevTools (easiest):**
1. Open Chrome
2. Press `F12` or `Cmd + Option + I`
3. Click the phone icon (Toggle Device Toolbar)
4. Select "iPhone 14 Pro" from the dropdown
5. Navigate to your Soneker result screen
6. Screenshot just the phone area (crop the DevTools panel out)

**Option B — Your actual phone:**
- Open soneker.app on your phone
- Analyze a video
- Screenshot directly from your phone
- AirDrop to Mac

**What to show on mobile:**
- The tab bar at the bottom (Cards / Map / Vocab)
- 2 full knowledge cards visible
- The compact video header at the top (thumbnail + title)

```
┌───────────────────────┐
│  [thumbnail] Title    │
│  Channel • Niche      │
├───────────────────────┤
│  [Cards] [Map] [Vocab]│
├───────────────────────┤
│  01  Card Title       │
│      Body text here   │
│      #tag #tag        │
├───────────────────────┤
│  02  Card Title       │
│      Body text...     │
└───────────────────────┘
```

---

## IMAGE 7 — PDF Export (Open in Preview)
**Used for:** "Export to PDF" posts, "takes 30 seconds" posts

### What to screenshot:
Generate a PDF export → open it in macOS Preview → screenshot 1 page

**Exact steps:**
1. On the result screen, click the PDF export button (the download icon)
2. PDF downloads automatically
3. Open it in Preview (double-click)
4. Go to page 1 or page 2 (page 2 shows knowledge cards — more impressive)
5. Zoom to fit page (`Cmd + 0`)
6. Screenshot the full page

**Best page to show:** A page with a colored section header + 1–2 knowledge cards + deep panel rows

---

## IMAGE 8 — The Landing Page (Full Mobile)
**Used for:** "We just launched" posts, "try it free" posts

### What to screenshot:
The soneker.app landing page on mobile (Chrome DevTools)

**Exact steps:**
1. Open Chrome DevTools → iPhone 14 Pro
2. Navigate to soneker.app
3. Scroll to top (hero section)
4. Screenshot showing: headline + input field + button
5. Optional: scroll down and screenshot the feature section

---

## IMAGE 9 — Before vs. After (Side by Side)
**Used for:** The highest-performing post format. Show YouTube video vs. Soneker output.

### How to create this:
**Option A — Side by side:**
- Left half: YouTube video screenshot (pause the video, screenshot the player)
- Right half: Soneker knowledge cards for that same video
- Combine in Canva (free) or macOS Preview

**Option B — Just the Soneker output with video context in the text:**
- Screenshot only the Soneker output
- In the post text: "I watched [VIDEO TITLE]. Here's what Soneker extracted..."

**Option A template (use Canva, free):**
```
┌──────────────────┬──────────────────────┐
│                  │                      │
│  YouTube video   │  Soneker output      │
│  thumbnail/      │  (knowledge cards    │
│  screenshot      │   screenshot)        │
│                  │                      │
│  "2 hours"       │  "30 seconds"        │
└──────────────────┴──────────────────────┘
```

---

## IMAGE 10 — Metrics / Numbers Post
**Used for:** Weekly/monthly build-in-public updates

### How to create this:
Don't screenshot the app. Create a simple graphic.

**Option A — Plain text post (no image needed)**
Numbers posts work well as pure text. The numbers ARE the content.

**Option B — Simple card (use Canva):**
Create a simple dark/light card with:
```
┌─────────────────────────────┐
│  SONEKER — WEEK [X]         │
│                             │
│  Signups    [X]  ↑[X]%      │
│  Analyses   [X]             │
│  MRR       €[X]  ↑[X]%      │
│  Users      [X]             │
│                             │
│  soneker.app                │
└─────────────────────────────┘
```

Colors to use: background `#0a0818`, accent `#5B4EFF`, text white.

---

## IMAGE 11 — GIF / Screen Recording
**Used for:** The absolute best performing post type. Show the full workflow in motion.

### What to record (20–30 seconds):
1. Start at soneker.app (landing page visible)
2. Paste a YouTube URL into the input
3. Click "Try Free"
4. Loading screen plays (show it briefly)
5. Result screen appears — scroll through cards slowly
6. Click one card to show deep panel
7. Switch to Knowledge Map tab
8. End on the full result view

**How to record:**
- Use **Kap** (free, Mac): `kap.wulkano.com` → records screen → exports as GIF
- Set to 1280×800 or 1440×900 for good quality
- Limit to 30 seconds (Twitter GIF limit is 30 seconds, 15MB)

**This GIF will outperform every static screenshot. Make it in week 1.**

---

## QUICK REFERENCE — Which Image for Which Post

| Post Type | Image to Use |
|---|---|
| First launch announcement | Image 5 (Full desktop split) + Image 11 (GIF) |
| Demo posts (most frequent) | Image 1 (Cards) — use this 3x/week |
| Knowledge Map showcase | Image 2 (Map) |
| Language learner angle | Image 3 (Vocabulary) |
| Product depth posts | Image 4 (Deep Panel) |
| Mobile announcement | Image 6 (Mobile view) |
| PDF export posts | Image 7 (PDF in Preview) |
| Before vs. after | Image 9 (Side by side) |
| Numbers / metrics | Image 10 (Simple card) or plain text |
| Best engagement driver | Image 11 (GIF — the full workflow) |

---

## THE 5 IMAGES TO CAPTURE THIS WEEK

If you do nothing else, capture these 5 before posting anything:

1. **Image 5** — Full desktop result screen (your hero shot)
2. **Image 1** — 2–3 knowledge cards (your weekly demo post image)
3. **Image 2** — The Knowledge Map (your most visual asset)
4. **Image 6** — Mobile view (shows it works everywhere)
5. **Image 11** — The GIF (paste URL → result — 30 seconds — this is your best asset)

With these 5 images, you can post for 2 weeks without repeating yourself.

---

## CANVA TEMPLATE SETUP (Free)

Go to canva.com → Create design → Custom size: **1200 × 675px** (Twitter card ratio)

For each screenshot:
1. Drop your screenshot onto the canvas
2. Resize to fill
3. Add a thin colored border (use `#5B4EFF` — Soneker purple)
4. Bottom right: add small "soneker.app" text in light gray
5. Export as PNG

This makes every screenshot look intentional and branded, not random.

---

*Visual guide written: March 2026.*
