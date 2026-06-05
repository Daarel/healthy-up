import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, message, htmlMessage }) => {
  const { error } = await resend.emails.send({
    from: 'HealthyUp <onboarding@resend.dev>',
    to: email,
    subject: subject,
    text: message,
    html: htmlMessage,
  });

  if (error) {
    throw new Error(error.message);
  }
};
