import nodeMailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Buat transporter (menggunakan SMTP Gmail sebagai contoh)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // misal: smtp.gmail.com
    port: process.env.EMAIL_PORT, // misal: 465 atau 587
    secure: true, // true untuk port 465, false untuk port lainnya
    auth: {
      user: process.env.EMAIL_USER, // email Anda
      pass: process.env.EMAIL_PASS, // App Password Gmail Anda (bukan password login biasa)
    },
  });

  // 2. Definisikan opsi email
  const mailOptions = {
    from: `"HealthyUp Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Fallback jika HTML tidak didukung
    html: options.htmlMessage, // Tampilan email yang lebih cantik
  };

  // 3. Kirim email
  await transporter.sendMail(mailOptions);
};

export { sendEmail };
