const nodemailer = require('nodemailer');

const isMailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);

const getTransport = () => {
  if (!isMailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transport = getTransport();
  if (!transport) {
    return { sent: false, reason: 'mail_not_configured' };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = { sendMail, isMailConfigured };
