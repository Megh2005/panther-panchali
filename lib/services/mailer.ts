import nodemailer, { type SendMailOptions } from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 465);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendJourneyEmailParams {
  to: string;
  subject: string;
  threadTitle: string;
  storyExcerpt: string;
  videoReelUrl?: string;
  pdfAttachmentBuffer?: Buffer;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character,
  );
}

export async function sendJourneyEmail(params: SendJourneyEmailParams) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP_USER and SMTP_PASS are required to send journey email.",
    );
  }

  const {
    to,
    subject,
    threadTitle,
    storyExcerpt,
    videoReelUrl,
    pdfAttachmentBuffer,
  } = params;
  const safeThreadTitle = escapeHtml(threadTitle);
  const safeStoryExcerpt = escapeHtml(storyExcerpt);
  const safeVideoReelUrl =
    videoReelUrl && /^https:\/\/res\.cloudinary\.com\//.test(videoReelUrl)
      ? videoReelUrl
      : undefined;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          padding: 32px;
          background-color: #F6F1E6;
          color: #1B1A17;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #EDE4D3;
          border: 1px solid rgba(107, 100, 88, 0.22);
          border-radius: 16px;
          padding: 36px;
          text-align: center;
        }
        .tagline {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #B5532F;
          font-weight: 600;
        }
        h1 {
          font-size: 26px;
          font-weight: 300;
          color: #1B1A17;
          margin: 12px 0 16px;
        }
        .excerpt {
          font-style: italic;
          color: #6B6458;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .cta-button {
          display: inline-block;
          background-color: #B5532F;
          color: #F6F1E6;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 8px;
        }
        .footer {
          margin-top: 28px;
          font-size: 11px;
          color: #6B6458;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="tagline">Pather Panchali: The Living Canvas</span>
        <h1>${safeThreadTitle}</h1>
        <p class="excerpt">"${safeStoryExcerpt}"</p>
        
        ${
          safeVideoReelUrl
            ? `<a href="${safeVideoReelUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">Watch Your Kolkata Video Reel</a>`
            : ""
        }

        <p class="footer">Stories shaped through feeling · Kolkata, India</p>
      </div>
    </body>
    </html>
  `;

  const mailOptions: SendMailOptions = {
    from: `"Pather Panchali" <${process.env.SMTP_USER || "noreply@pantherpanchali.art"}>`,
    to,
    subject,
    html: htmlContent,
    attachments: pdfAttachmentBuffer
      ? [
          {
            filename: `${threadTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`,
            content: pdfAttachmentBuffer,
            contentType: "application/pdf",
          },
        ]
      : [],
  };

  return transporter.sendMail(mailOptions);
}
