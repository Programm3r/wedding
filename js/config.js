/* ==========================================================================
   WEDDING SETTINGS — edit this file to personalise the website.
   Everything here is plain text; save the file and refresh the browser.
   ========================================================================== */
window.WEDDING = {
  // ── THE SWITCH ────────────────────────────────────────────────────────────
  // false : visitors see the "more information to follow" holding page, and the
  //         full site (wedding.html) bounces them back to it. Use this until the
  //         formal invitations go out.
  // true  : the full site opens, and the holding page forwards straight to it.
  // Preview the full site yourself while it is false: wedding.html?preview=1
  siteLive: true,

  // The couple
  partner1: "Richard Bailey",
  partner2: "Gisela Tiedt",
  initials: "R & G",
  hashtag: "#TwoShotsOfBaileys",

  // Date & time (South African Standard Time, UTC+02:00)
  date: "2027-08-14T15:30:00+02:00",
  endDate: "2027-08-15T01:00:00+02:00",
  dateLong: "Saturday, 14 August 2027",
  rsvpDeadline: "14 May 2027",

  // Venue
  venue: {
    name: "Kuthaba Bush Lodge",
    area: "Waterberg, Limpopo · South Africa",
    address: "Driefontein Road, Modimolle, 0510, South Africa",
    lat: -24.6223482,
    lng: 28.423718,
    website: "https://kuthaba.co.za/",
    phone: "072 641 9751",
    email: "info@kuthaba.co.za",
  },

  // Colour theme — all use navy, olive, burgundy & white, but each leads with a different colour:
  //   "waterberg" : midnight ink navy with bone white, bush olive & merlot accents
  //   "merlot"    : deep merlot burgundy leads, with navy & olive accents
  //   "olive"     : dusky bush olive leads, with merlot & navy accents
  // Tip: preview any theme without editing by adding ?theme=merlot to the address.
  theme: "waterberg",

  // Hero background photo (optional). Leave "" for the illustrated background.
  // Example: "images/hero.jpg"
  heroImage: "",

  // Photo shown next to "Our Story". Any image path works, e.g. "images/story.jpg".
  // storyPosition moves the crop focus ("50% 50%" = centre; lower first % = further left).
  storyImage: "images/gallery/web/IMG_20260403_131011_2.jpg",
  storyPosition: "55% 40%",

  // Where RSVPs are sent. Paste your Google Apps Script web-app URL here
  // (see README.md → "Collecting RSVPs"). While empty, the form works in
  // demo mode and keeps responses in this browser only.
  rsvpEndpoint: "",

  // Maximum number of people per RSVP (including the person replying)
  maxGuests: 4,

  // Contact for questions
  contactEmail: "twoshotbaileys@gmail.com",
};
