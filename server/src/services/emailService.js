// ============================================================
// services/emailService.js
// Nodemailer-based email delivery.
//
// .env variables used (via env.js):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, CLIENT_URL
// ============================================================

import nodemailer from 'nodemailer';
import { env }    from '../config/env.js';
import { logger } from '../utils/logger.js';

// ── Transporter ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST   || 'smtp.gmail.com',
  port:   env.SMTP_PORT   || 587,
  secure: (env.SMTP_PORT  || 587) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify SMTP connection at startup — logs warning, never crashes server
transporter.verify((err) => {
  if (err) {
    logger.warn(`[EmailService] SMTP not ready: ${err.message}`);
  } else {
    logger.info('[EmailService] SMTP ready ✓');
  }
});

// ── Core sender ───────────────────────────────────────────────
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from:    env.EMAIL_FROM || 'Bond <no-reply@bond.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    logger.info(`[EmailService] Sent "${subject}" → ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    logger.error(`[EmailService] Failed to send "${subject}" → ${to}: ${err.message}`);
    // Never throw — a failed email must not crash the calling request
  }
};

// ── Shared HTML layout ────────────────────────────────────────
const layout = (bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bond</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE4;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid rgba(28,61,46,0.1);">
        <tr>
          <td style="background:#1C3D2E;padding:24px 32px;">
            <span style="font-size:22px;font-weight:700;color:#F2EDE4;">Bond.</span>
            <span style="font-size:12px;color:rgba(242,237,228,0.55);margin-left:8px;">Community Tourism</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#F2EDE4;padding:20px 32px;border-top:1px solid rgba(28,61,46,0.1);">
            <p style="margin:0;font-size:11px;color:#7A9285;text-align:center;">
              © ${new Date().getFullYear()} Bond · Community Tourism Platform
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href, text) =>
  `<a href="${href}" style="display:inline-block;background:#1C3D2E;color:#F2EDE4;
   text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;
   border-radius:9px;margin-top:8px;">${text}</a>`;

const h1  = (text) => `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A2820;">${text}</h1>`;
const p   = (text) => `<p style="margin:12px 0;font-size:15px;color:#3D5448;line-height:1.6;">${text}</p>`;
const hr  = () => `<hr style="border:none;border-top:1px solid rgba(28,61,46,0.1);margin:24px 0;"/>`;
const row = (label, value) =>
  `<tr><td style="padding:4px 0;font-size:14px;color:#3D5448;"><strong>${label}</strong></td>
       <td style="padding:4px 0;font-size:14px;color:#3D5448;">${value}</td></tr>`;

// ── Transactional emails ──────────────────────────────────────

export const sendWelcomeEmail = ({ to, name, role }) =>
  sendMail({
    to,
    subject: "Welcome to Bond — you're in! 🌿",
    html: layout(`
      ${h1(`Welcome, ${name}!`)}
      ${p(`You've joined Bond as a <strong>${role === 'community' ? 'community host' : role}</strong>.`)}
      ${p('Start exploring unique experiences curated by real communities across India.')}
      ${hr()}
      ${btn(`${env.CLIENT_URL}/explore`, 'Explore Experiences')}
    `),
  });

export const sendVerificationEmail = ({ to, name, verifyUrl }) =>
  sendMail({
    to,
    subject: 'Verify your Bond email address',
    html: layout(`
      ${h1('Verify your email')}
      ${p(`Hi ${name}, please confirm your email to activate your Bond account.`)}
      ${p('This link expires in <strong>24 hours</strong>.')}
      ${hr()}
      ${btn(verifyUrl, 'Verify Email')}
    `),
  });

export const sendPasswordResetEmail = ({ to, name, resetUrl }) =>
  sendMail({
    to,
    subject: 'Reset your Bond password',
    html: layout(`
      ${h1('Reset your password')}
      ${p(`Hi ${name}, we received a request to reset your Bond password.`)}
      ${p("This link expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.")}
      ${hr()}
      ${btn(resetUrl, 'Reset Password')}
    `),
  });

export const sendBookingConfirmationEmail = ({ to, name, booking }) =>
  sendMail({
    to,
    subject: `Booking confirmed — ${booking.experienceTitle} 🎉`,
    html: layout(`
      ${h1('Your booking is confirmed!')}
      ${p(`Hi ${name}, your booking for <strong>${booking.experienceTitle}</strong> is confirmed.`)}
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#F2EDE4;border-radius:10px;padding:20px;margin:16px 0;">
        ${row('Experience', booking.experienceTitle)}
        ${row('Date', booking.date)}
        ${row('Guests', booking.guests)}
        ${row('Total Paid', `₹${booking.totalAmount}`)}
        ${row('Booking ID', `#${booking.id}`)}
      </table>
      ${hr()}
      ${btn(`${env.CLIENT_URL}/tourist/bookings`, 'View My Bookings')}
    `),
  });

export const sendNewBookingAlertEmail = ({ to, hostName, booking }) =>
  sendMail({
    to,
    subject: `New booking for ${booking.experienceTitle}`,
    html: layout(`
      ${h1('You have a new booking!')}
      ${p(`Hi ${hostName}, <strong>${booking.touristName}</strong> just booked <strong>${booking.experienceTitle}</strong>.`)}
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#F2EDE4;border-radius:10px;padding:20px;margin:16px 0;">
        ${row('Guest', booking.touristName)}
        ${row('Date', booking.date)}
        ${row('Guests', booking.guests)}
        ${row('Amount', `₹${booking.totalAmount}`)}
      </table>
      ${hr()}
      ${btn(`${env.CLIENT_URL}/community/bookings`, 'Manage Bookings')}
    `),
  });

export const sendBookingCancellationEmail = ({ to, name, booking, cancelledBy }) =>
  sendMail({
    to,
    subject: `Booking cancelled — ${booking.experienceTitle}`,
    html: layout(`
      ${h1('Booking Cancelled')}
      ${p(`Hi ${name}, your booking for <strong>${booking.experienceTitle}</strong> on
           <strong>${booking.date}</strong> was cancelled by ${cancelledBy}.`)}
      ${p('If you have questions, please contact our support team.')}
      ${hr()}
      ${btn(`${env.CLIENT_URL}/explore`, 'Find Another Experience')}
    `),
  });

export const sendCommunityVerificationEmail = ({ to, name, status, reason }) => {
  const approved = status === 'approved';
  return sendMail({
    to,
    subject: approved ? 'Your community is verified on Bond ✅' : 'Bond community verification update',
    html: layout(`
      ${h1(approved ? "You're verified! 🎉" : 'Verification Update')}
      ${p(approved
        ? `Hi ${name}, your community profile has been <strong>verified</strong>. You can now publish experiences.`
        : `Hi ${name}, your community verification was <strong>not approved</strong> at this time.`
      )}
      ${!approved && reason ? p(`<strong>Reason:</strong> ${reason}`) : ''}
      ${hr()}
      ${btn(
        approved ? `${env.CLIENT_URL}/community/experiences/new` : `${env.CLIENT_URL}/community/profile`,
        approved ? 'Create Your First Experience' : 'Update Profile'
      )}
    `),
  });
};

export const sendNotificationEmail = ({ to, name, subject, message, ctaUrl, ctaText }) =>
  sendMail({
    to,
    subject,
    html: layout(`
      ${h1(subject)}
      ${p(`Hi ${name},`)}
      ${p(message)}
      ${ctaUrl ? `${hr()}${btn(ctaUrl, ctaText || 'View on Bond')}` : ''}
    `),
  });