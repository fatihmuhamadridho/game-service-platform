import nodemailer from 'nodemailer';

export class EmailDeliveryError extends Error {
  constructor(
    readonly code: 'EMAIL_NOT_CONFIGURED' | 'EMAIL_DELIVERY_FAILED',
    message: string
  ) {
    super(message);
  }
}

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function readSmtpConfiguration() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const from = process.env.SMTP_FROM?.trim();
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const username = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;

  if (
    !host ||
    !from ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    (secureValue && !['true', 'false'].includes(secureValue)) ||
    Boolean(username) !== Boolean(password)
  ) {
    throw new EmailDeliveryError('EMAIL_NOT_CONFIGURED', 'Pengiriman email belum dikonfigurasi.');
  }

  return {
    host,
    port,
    secure: secureValue ? secureValue === 'true' : port === 465,
    from,
    ...(username && password ? { auth: { user: username, pass: password } } : {}),
  };
}

export function isEmailDeliveryConfigured() {
  try {
    readSmtpConfiguration();
    return true;
  } catch (error) {
    if (error instanceof EmailDeliveryError && error.code === 'EMAIL_NOT_CONFIGURED') return false;
    throw error;
  }
}

export async function sendEmail(message: EmailMessage) {
  const configuration = readSmtpConfiguration();
  const transporter = nodemailer.createTransport(configuration);
  try {
    await transporter.sendMail({
      from: configuration.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    });
  } catch {
    throw new EmailDeliveryError('EMAIL_DELIVERY_FAILED', 'Email tidak dapat dikirim saat ini.');
  } finally {
    transporter.close();
  }
}
