// Vercel serverless function: emails booking inquiries via Gmail SMTP.
// Set these in Vercel → Project → Settings → Environment Variables:
//   GMAIL_USER          the Gmail address that sends the mail
//   GMAIL_APP_PASSWORD  a Google App Password (not the normal password)
//   BOOKING_TO          where inquiries go (defaults to GMAIL_USER)
const nodemailer = require("nodemailer");

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }

  if (b.company) return res.status(200).json({ ok: true }); // honeypot: silently drop bots
  const required = ["name", "email", "phone", "eventType", "date"];
  const missing = required.filter((k) => !String(b[k] || "").trim());
  if (missing.length) return res.status(400).json({ ok: false, error: "Missing: " + missing.join(", ") });
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return res.status(400).json({ ok: false, error: "Invalid email" });

  const { GMAIL_USER, GMAIL_APP_PASSWORD, BOOKING_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return res.status(500).json({ ok: false, error: "Email not configured" });

  const rows = [
    ["Name", b.name], ["Email", b.email], ["Phone", b.phone], ["Event type", b.eventType],
    ["Event date", b.date], ["Start time", b.start], ["Hours", b.hours], ["Venue / city", b.venue],
    ["Guests", b.guests], ["Package", b.package], ["Budget", b.budget], ["Estimate", b.estimate],
  ].filter(([, v]) => v);

  const table = rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#9c6b1e;font-weight:700">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px">
    <h2 style="color:#b47a26;margin:0 0 12px">New DJ Preet booking inquiry</h2>
    <table style="border-collapse:collapse;font-size:15px">${table}</table>
    ${b.message ? `<h3 style="color:#b47a26;margin:20px 0 6px">Details</h3><p style="white-space:pre-wrap;font-size:15px">${esc(b.message)}</p>` : ""}
  </div>`;

  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  try {
    await t.sendMail({
      from: `"DJ Preet Website" <${GMAIL_USER}>`,
      to: BOOKING_TO || GMAIL_USER,
      replyTo: b.email,
      subject: `Booking inquiry: ${b.eventType} on ${b.date} (${b.name})`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + (b.message ? `\n\n${b.message}` : ""),
    });
    // Confirmation to the client
    await t.sendMail({
      from: `"DJ Preet" <${GMAIL_USER}>`,
      to: b.email,
      subject: "We got your booking inquiry 🎶 | DJ Preet",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;font-size:15px">
        <p>Hi ${esc(b.name.split(" ")[0])},</p>
        <p>Thanks for reaching out about your <b>${esc(b.eventType)}</b> on <b>${esc(b.date)}</b>. DJ Preet will get back to you shortly with availability and a custom quote.</p>
        <p>Meanwhile, check out the latest mixes on <a href="https://soundcloud.com/djpreet775">SoundCloud</a> and follow <a href="https://www.instagram.com/djpreet775/">@djpreet775</a>.</p>
        <p style="color:#9c6b1e">DJ Preet · Reno, NV</p></div>`,
    }).catch(() => {});
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Could not send" });
  }
};
