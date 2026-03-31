import nodemailer from "npm:nodemailer@6.9.14";

const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;

export async function sendEmailSMTP({
  to,
  subject,
  html,
  replyTo,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}) {
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASSWORD");

  if (!user || !pass) {
    throw new Error("SMTP credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: from || `"Handball 7even" <${user}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  return info;
}
