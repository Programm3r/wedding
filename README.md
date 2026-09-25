# Wedding site

A small static site: a landing page with an animated envelope that opens onto a save-the-date,
plus a fuller site (story, schedule, venue, gallery, FAQ, RSVP) that stays hidden until it is
switched on.

Plain HTML, CSS and JavaScript. No build step, no dependencies. Open `index.html` in a browser.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page — envelope intro, then the save-the-date |
| `wedding.html` | Full site; redirects to the landing page while hidden |
| `photos/index.html` | Guest photo page — explains how to add photos to the shared album |
| `js/config.js` | All settings: names, dates, venue, theme, endpoints |
| `js/landing.js` | Landing page behaviour |
| `js/main.js` | Full site behaviour |
| `js/gallery.js` | Generated list of gallery photos |
| `js/intro-sky.js` | Night sky behind the envelope: stars, fireflies, the gold burst on opening |
| `css/styles.css` | Shared styles: theme, envelope, hero, footer |
| `css/landing.css` | Landing page extras |
| `tools/` | Gallery build script, RSVP collector script, QR generator |

## Settings

Everything editable lives in `js/config.js`. Page copy (section text, FAQ answers) is inline in
the two HTML files.

`siteLive` controls visibility:

- `false` — visitors only ever see the landing page; `wedding.html` redirects back to it.
- `true` — the full site opens and a link to it appears on the landing page.

Append `?preview=1` to `wedding.html` to view it while hidden. This is a courtesy screen, not
access control: published source is readable by anyone.

## Themes

Three colour themes, set via `theme` in `js/config.js`: `waterberg`, `merlot`, `olive`.
Preview one without editing by appending `?theme=merlot` to the URL. Tokens are defined at the
top of `css/styles.css`.

## Photos

Drop images into `images/gallery/`, then run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\update-gallery.ps1
```

It writes resized web copies to `images/gallery/web/` and regenerates `js/gallery.js`.
Descriptive file names become captions; camera-style names get none. Feature photos are set via
`heroImage` and `storyImage` in `js/config.js`.

## Guest photos

`photos/index.html` sends guests to a shared album. Put the album's share link in `photosUrl`
in `js/config.js` — until then the page says the album is not open yet rather than showing a
dead button. The album must have "add photos" / collaboration enabled.

Printed QR codes point at this page rather than at the album directly, so the album can be
swapped without reprinting anything. Regenerate them with:

```
python -m pip install segno
python tools/make-qr.py
```

The target URL is a constant at the top of that script. Outputs land in `tools/qr/`: an SVG and
PNG of the code, plus `photo-cards.html`, four printable table cards per A4 sheet.

## RSVP responses

The form posts to a Google Apps Script web app that appends rows to a spreadsheet.

1. Create a spreadsheet, open **Extensions → Apps Script**.
2. Paste in `tools/rsvp-google-apps-script.js`.
3. **Deploy → New deployment → Web app**, execute as yourself, access "Anyone".
4. Put the deployment URL in `rsvpEndpoint` in `js/config.js`.

While `rsvpEndpoint` is empty the form runs in demo mode and keeps submissions in the visitor's
own browser only.

## Deploying

Any static host works. The repo is published as-is from its default branch; pushing updates the
live site. Netlify Drop, Cloudflare Pages and Vercel also serve this folder unchanged.
