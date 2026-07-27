require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/send-confirmation', async (req, res) => {
  const { name, email, accountType } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({
      success: false,
      message: 'Gmail SMTP is not configured yet. Set SMTP_USER and SMTP_PASS in your environment or .env file.'
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || `LingoEnglish <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your registration confirmation',
    html: `
      <h2>Thanks for registering, ${name || 'there'}!</h2>
      <p>We received your ${accountType || 'account'} request.</p>
      <p>This is a confirmation email to let you know your message was received.</p>
      <p>We will be in touch soon.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: `Confirmation email sent to ${email}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Email could not be sent. Check your Gmail app password and SMTP settings.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
