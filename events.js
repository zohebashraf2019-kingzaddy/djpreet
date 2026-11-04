/* =========================================================
   DJ PREET EVENTS CALENDAR
   ---------------------------------------------------------
   To add a date, copy one block and edit it. Dates use YYYY-MM-DD.

   type:
     "show"    → public event (shows in gold, listed under Upcoming)
     "booked"  → private booking (date shows as booked, no details shown)

   Optional fields: time, venue, city, link (tickets / flyer / IG post), note
   Past "show" events automatically move into "Recent highlights".
   ========================================================= */
window.DJ_EVENTS = [
  {
    date: "2026-09-25",
    type: "show",
    title: "Uff Teh Gehraiyaan 5: The Biggest Cruise Party",
    time: "Boarding 8:30 PM · Sails 9:30 PM",
    venue: "Premium 3-deck cruise",
    note: "Bollywood · Tollywood · Punjabi with DJ Preet, DJ Inni & DJ Gigi, dhol by Weezy",
    link: "https://www.instagram.com/djpreet775/"
  },
  {
    date: "2026-03-14",
    type: "show",
    title: "Desi Saturday",
    time: "Doors 8 PM · 21+",
    venue: "The Wolf Den",
    city: "Reno, NV",
    note: "With Weezy · Myndful Media",
    link: "https://www.instagram.com/thewolfden2024/"
  }

  // Example private booking (uncomment and change the date):
  // ,{ date: "2026-12-12", type: "booked", title: "Private wedding" }
];

/* Highlights without an exact date on the calendar (shown under Recent highlights) */
window.DJ_HIGHLIGHTS = [
  { label: "Apr 2025", title: "Reno Vaisakhi 2025", venue: "Grand Sierra Resort, Reno", note: "With Weezy" },
  { label: "Wedding", title: "Carson Weds Hawa: Mehndi & Wedding", venue: "Private event", note: "With Weezy · Myndful Media" }
];
