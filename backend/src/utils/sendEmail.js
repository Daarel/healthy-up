import { Resend } from 'resend';

let resendClient = null;
const getResendClient = () => {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }
  return resendClient;
};

export const sendEmail = async ({ email, subject, message, htmlMessage }) => {
  const resend = getResendClient();
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
