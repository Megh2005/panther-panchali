import nodemailer from "nodemailer";

export interface SendPostPublishedEmailParams {
  to: string;
  userName: string;
  placeName: string;
  yearSpan: string;
  vibe: string;
  timeOfDay: string;
  caption: string;
  hashtags: string[];
  revampedImageUrl: string;
  extractedColors: string[];
  postId: string;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPostPublishedEmail(
  params: SendPostPublishedEmailParams,
): Promise<boolean> {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn(
      "SMTP credentials not fully configured; skipping notification email.",
    );
    return false;
  }

  const {
    to,
    userName,
    placeName,
    yearSpan,
    vibe,
    timeOfDay,
    caption,
    hashtags,
    revampedImageUrl,
    extractedColors,
    postId,
  } = params;

  const appBaseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const postUrl = `${appBaseUrl}/explore?post=${postId}`;

  const colorSwatchesHtml = extractedColors
    .map(
      (c) =>
        `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background-color:${c};border:1px solid rgba(27,26,23,0.15);margin-right:6px;vertical-align:middle;"></span>`,
    )
    .join("");

  const hashtagsHtml = hashtags
    .map(
      (h) =>
        `<span style="color:#B5532F;font-family:sans-serif;font-size:12px;margin-right:6px;">${h}</span>`,
    )
    .join(" ");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Memory is Live in Kolkata</title>
</head>
<body style="margin:0;padding:24px;background-color:#F6F1E6;font-family:'Georgia',serif;color:#1B1A17;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#EDE4D3;border:1px solid #D6CCA8;border-radius:18px;overflow:hidden;box-shadow:0 4px 12px rgba(27,26,23,0.06);">
    <!-- Header -->
    <tr>
      <td style="padding:28px 32px 18px 32px;border-bottom:1px solid rgba(107,100,88,0.2);text-align:center;">
        <span style="font-family:sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#B5532F;">
          Panther Panchali · Living Chronicle
        </span>
        <h1 style="margin:8px 0 0 0;font-size:28px;font-weight:300;color:#1B1A17;letter-spacing:-0.02em;">
          Your Discovery is Published
        </h1>
        <p style="margin:6px 0 0 0;font-size:14px;color:#6B6458;font-style:italic;">
          Namaskar, ${userName}. Your discovery of ${placeName} has been woven into Bengal's living tapestry.
        </p>
      </td>
    </tr>

    <!-- Square Image Preview -->
    <tr>
      <td style="padding:24px 32px 16px 32px;text-align:center;">
        <div style="border-radius:14px;overflow:hidden;border:1px solid rgba(107,100,88,0.25);background-color:#F6F1E6;max-width:440px;margin:0 auto;">
          <img src="${revampedImageUrl}" alt="${placeName}" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;" />
        </div>
      </td>
    </tr>

    <!-- Metadata Badges -->
    <tr>
      <td style="padding:0 32px 16px 32px;text-align:center;">
        <span style="display:inline-block;padding:4px 12px;border-radius:20px;background-color:#F6F1E6;border:1px solid #D6CCA8;font-family:sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;color:#B5532F;margin-right:6px;">
          📍 ${placeName}
        </span>
        <span style="display:inline-block;padding:4px 12px;border-radius:20px;background-color:#F6F1E6;border:1px solid #D6CCA8;font-family:sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;color:#6B6458;margin-right:6px;">
          🎉 ${yearSpan}
        </span>
        <span style="display:inline-block;padding:4px 12px;border-radius:20px;background-color:#F6F1E6;border:1px solid #D6CCA8;font-family:sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;color:#6B6458;">
          ✨ ${vibe} · ${timeOfDay}
        </span>
      </td>
    </tr>

    <!-- Caption & Palette -->
    <tr>
      <td style="padding:0 32px 24px 32px;">
        <div style="background-color:#F6F1E6;border-radius:12px;padding:18px 20px;border:1px solid rgba(107,100,88,0.18);">
          <p style="margin:0;font-size:16px;line-height:1.6;font-style:italic;color:#1B1A17;">
            "${caption}"
          </p>
          <div style="margin-top:12px;">
            ${hashtagsHtml}
          </div>
          ${
            colorSwatchesHtml
              ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(107,100,88,0.15);font-size:11px;font-family:sans-serif;text-transform:uppercase;color:#6B6458;">
                  <strong style="margin-right:8px;">Atmospheric Palette:</strong>
                  ${colorSwatchesHtml}
                </div>`
              : ""
          }
        </div>
      </td>
    </tr>

    <!-- Action Button -->
    <tr>
      <td style="padding:0 32px 32px 32px;text-align:center;">
        <a href="${postUrl}" style="display:inline-block;background-color:#B5532F;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:30px;font-family:sans-serif;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;box-shadow:0 2px 6px rgba(181,83,47,0.3);">
          View on Kolkata Feed
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:18px 32px;background-color:#E2D6C0;border-top:1px solid rgba(107,100,88,0.2);text-align:center;font-family:sans-serif;font-size:11px;color:#6B6458;">
        Panther Panchali · The Living Canvas<br />
        Every lane, every season, every living memory.
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Panther Panchali" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your Kolkata Memory is Published: ${placeName} | Panther Panchali`,
      text: `${caption}\n\nView on the feed: ${postUrl}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send post published email notification:", error);
    return false;
  }
}
