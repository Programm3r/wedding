# Richard & Gisela — 13–15 August 2027 · Kuthaba Bush Lodge

Two sites live here, sharing the same stationery:

| Folder | What it is | When to send it |
|---|---|---|
| `save-the-date/` | **Send this now.** One page: the envelope opens, names, date, countdown and the Friday-to-Sunday weekend. No RSVP. | Now, so guests can hold the dates |
| this folder (`index.html`) | The full wedding website: story, order of the day, venue and map, accommodation, gallery, FAQ and the RSVP form. | Later, with the formal invitation |

Each folder publishes on its own — see "Publish it" below and in `save-the-date/README.md`.

Everything is plain HTML/CSS/JavaScript with no build step. Open either `index.html` in a browser to preview it.

## The weekend

Guests arrive **Friday 13 August**, the wedding is **Saturday 14 August**, and everyone leaves after
breakfast on **Sunday 15 August**. Both sites say so, and the "add to calendar" button on the
save-the-date page books the whole weekend.

## Personalise it

Edit **`js/config.js`**: names, initials, hashtag, ceremony time, RSVP deadline,
contact email, colour theme and photos.

### Colour themes

All three use navy, olive, burgundy and white, but each leads with a different colour.
Set `theme` in `js/config.js`:

| Theme | Feel |
|---|---|
| `waterberg` (default) | Midnight ink navy, bone white, bush olive, merlot accents |
| `merlot` | Deep merlot burgundy leads, with navy and olive accents |
| `olive` | Dusky bush olive leads, with merlot and navy accents |

To preview a theme without editing anything, add `?theme=merlot` (or `olive`) to the end of the page address.
The exact colours are at the top of `css/styles.css`.

The text for the story, the order of the day, the FAQ and the dress code is in `index.html`.
Search for the heading you want to change.

## Add photos

1. Copy photos into `images/gallery/`. Full-size photos straight from your phone are fine.
2. Run this from the project folder:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\update-gallery.ps1
   ```
   It makes fast, web-sized copies in `images/gallery/web/` (your originals are untouched) and rebuilds
   `js/gallery.js`. A descriptive file name becomes the caption (`01-sunset-at-the-lodge.jpg` becomes
   "Sunset at the lodge"), while camera names like `IMG_2026…` get none. You can type captions into
   `js/gallery.js` afterwards, but rerunning the script overwrites them.

**"Our Story" photo:** set `storyImage` in `js/config.js` to any image path, for example
`"images/gallery/web/IMG_20260403_131011_2.jpg"` or `"images/story.jpg"`. The frame is portrait, so a
landscape photo is cropped. If faces are cut off, adjust `storyPosition` (`"30% 50%"` shows more of the left side).

**Hero photo:** set `heroImage` in the same way to put a photo behind the names at the top. It is darkened
automatically so the text stays readable.

## Collecting RSVPs (free, via Google Sheets)

Until this is set up, the form runs in **demo mode**: it works, but responses stay in the
browser that sent them.

1. Create a new Google Sheet, then open **Extensions → Apps Script**.
2. Replace the code with the contents of `tools/rsvp-google-apps-script.js`.
   If you want an email for each RSVP, set `NOTIFY_EMAIL`.
3. Click **Deploy → New deployment → Web app**, and set
   *Execute as: Me* and *Who has access: Anyone*. Authorise when asked.
4. Copy the web-app URL (`https://script.google.com/macros/s/…/exec`) into
   `rsvpEndpoint` in `js/config.js`.

Each response then lands as a row in the **RSVPs** tab of your sheet.

## Publish it

The site is static, so any free host works:

- **Netlify Drop**: drag the project folder onto <https://app.netlify.com/drop>.
- **GitHub Pages**, **Cloudflare Pages** or **Vercel** also work.

## Venue facts used

Taken from [kuthaba.co.za](https://kuthaba.co.za/): Driefontein Road, Modimolle 0510, in the Waterberg,
about 90 minutes from Pretoria. It is a private, malaria-free reserve with 15 game species and over 200 bird species.
Ceremony sites are the Wild Fig Tree and the Cliff, and the reception is in the Reception Boma.
The lodge sleeps 80 guests (up to 102 attend), in Red Ivory Chalets, Bungalows, Safari Tents and Loft Rooms.
Lodge contact: 072 641 9751 · info@kuthaba.co.za.
