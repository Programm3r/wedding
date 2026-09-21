# Save the Date — the announcement page

A single page to send to guests now: the envelope opens, the names and date appear, a countdown
runs to the ceremony, and the weekend (Friday to Sunday) is laid out. There is **no RSVP** —
it simply says "hold these dates, the invitation follows".

The full wedding website (venue, gallery, FAQ, RSVP) lives in the folder above this one and is
unchanged. Both use the same stationery, so they look like a matched set.

## Personalise it

Everything you are likely to change is in `js/config.js`: names, initials, hashtag, the three
weekend dates, the venue, the colour theme and your contact email.

Colour themes are the same three as the main site — `waterberg` (navy), `merlot` (burgundy) and
`olive`. Preview one without editing by adding `?theme=merlot` to the address.

The wording on the page (the weekend descriptions and the "no need to reply yet" note) is in
`index.html`. Search for the text you want to change.

To put a photo behind the names, drop it in this folder as `images/hero.jpg` and set
`heroImage: "images/hero.jpg"` in `js/config.js`. It is darkened automatically so the text stays readable.

## Publish it

This folder is self-contained, so publish **this folder only**:

- **Netlify Drop**: drag this `save-the-date` folder onto <https://app.netlify.com/drop>.
- **Cloudflare Pages**, **GitHub Pages** or **Vercel** work the same way.

Later, when the invitation goes out, publish the full site from the folder above and send that link.

## Add to calendar

The button saves the whole weekend — Friday 2:00 pm to Sunday 10:00 am — to Google, Outlook or
Apple Calendar, with a reminder a month before. Change the times in `js/config.js`
(`weekendStart`, `weekendEnd`), and `weddingDay` if the ceremony time moves.
