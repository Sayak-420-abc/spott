"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Send notification email via Gmail using nodemailer
export const sendNotificationEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    eventTitle: v.string(),
    eventDate: v.number(),
    eventSlug: v.string(),
    type: v.union(
      v.literal("registered_approaching"),
      v.literal("interest_approaching")
    ),
  },
  handler: async (_ctx, args) => {
    // Dynamic import of nodemailer (only available in Node actions)
    const nodemailer = await import("nodemailer");

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.warn(
        "GMAIL_USER or GMAIL_APP_PASSWORD not configured. Skipping email send."
      );
      return { sent: false, reason: "Missing Gmail credentials" };
    }

    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const eventDateFormatted = new Date(args.eventDate).toLocaleString(
      "en-IN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }
    );

    const eventUrl = `${process.env.SITE_URL || "http://localhost:3000"}/events/${args.eventSlug}`;

    const isRegistered = args.type === "registered_approaching";

    const subject = isRegistered
      ? `⚡ Reminder: "${args.eventTitle}" starts soon!`
      : `🎯 An event you might like: "${args.eventTitle}"`;

    const heroColor = isRegistered ? "#7C3AED" : "#F59E0B";
    const heroLabel = isRegistered ? "EVENT REMINDER" : "RECOMMENDED FOR YOU";
    const heroEmoji = isRegistered ? "⏰" : "✨";

    const mainMessage = isRegistered
      ? `You're registered for <strong>"${args.eventTitle}"</strong> and it's starting soon! Make sure you're ready.`
      : `We found an event that matches your interests — <strong>"${args.eventTitle}"</strong> is happening soon and spots may be limited!`;

    const ctaText = isRegistered ? "View Your Ticket" : "Check It Out";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#FFFDF5;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFDF5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:3px solid #1E293B;box-shadow:6px 6px 0px 0px #1E293B;">
          
          <!-- Header Stripe -->
          <tr>
            <td style="background:${heroColor};padding:20px 30px;border-bottom:3px solid #1E293B;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size:12px;font-weight:900;letter-spacing:3px;color:#FFFFFF;text-transform:uppercase;">
                      ${heroEmoji} ${heroLabel}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:18px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">
                      Spott<span style="color:#FDE68A;">*</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">
                Hey ${args.userName} 👋
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.6;">
                ${mainMessage}
              </p>
              
              <!-- Event Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF5;border:2px solid #1E293B;box-shadow:3px 3px 0px 0px #1E293B;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:20px;font-weight:900;color:#1E293B;">
                      ${args.eventTitle}
                    </p>
                    <p style="margin:0;font-size:14px;color:#7C3AED;font-weight:700;">
                      📅 ${eventDateFormatted}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${heroColor};border:2px solid #1E293B;box-shadow:3px 3px 0px 0px #1E293B;padding:12px 28px;">
                    <a href="${eventUrl}" style="color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
                      ${ctaText} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:16px 30px;border-top:2px dashed #CBD5E1;background:#F8FAFC;">
              <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">
                You're receiving this because you ${isRegistered ? "registered for this event" : "have matching interests"} on Spott.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from: `"Spott Notifications" <${gmailUser}>`,
        to: args.to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${args.to} for event "${args.eventTitle}"`);
      return { sent: true };
    } catch (error) {
      console.error(`❌ Failed to send email to ${args.to}:`, error.message);
      return { sent: false, reason: error.message };
    }
  },
});
