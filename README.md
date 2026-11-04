# DJ Preet Website

Website for **DJ Preet (DJPreet775)**, a Reno/Carson City desi wedding, club and event DJ.
Static HTML/CSS/JS plus one Vercel serverless function for booking inquiries.

## Structure
- `index.html`, `styles.css`, `main.js`: the site
- `events.js`: **edit this to add calendar dates** (public shows + private "booked" dates)
- `api/inquiry.js`: emails booking form submissions (Gmail SMTP via nodemailer)
- `assets/`: logos, photos, compressed event videos

## Deploy (Vercel)
1. Import the GitHub repo in Vercel (Framework preset: **Other**, no build command).
2. Add environment variables:
   - `GMAIL_USER`: sending Gmail address
   - `GMAIL_APP_PASSWORD`: Google App Password
   - `BOOKING_TO`: inbox that receives inquiries (optional, defaults to GMAIL_USER)
3. Redeploy.

## Updating
- **Calendar:** add an entry to `window.DJ_EVENTS` in `events.js`.
- **Prices:** packages/add-ons in `index.html` (`#packages`) and the quote builder `<select>` / checkbox values.
- **Deposits:** the 30% deposit is shown as an estimate. Online payment (Stripe/Square) can be wired into the booking flow later.
