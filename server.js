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

  try {
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const resendFrom = process.env.RESEND_FROM?.trim();

    if (resendApiKey && resendFrom) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [email],
          subject: 'Your registration confirmation',
          html: `
            <h2>Thanks for registering, ${name || 'there'}!</h2>
            <p>We received your ${accountType || 'account'} request.</p>
            <p>This is a confirmation email to let you know your message was received.</p>
            <p>We will be in touch soon.</p>
          `
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API request failed');
      }

      return res.json({ success: true, message: `Confirmation email sent to ${email}` });
    }

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    if (!smtpUser || !smtpPass || smtpUser.includes('your-gmail') || smtpPass.includes('your-16')) {
      return res.status(500).json({
        success: false,
        message: 'Email delivery is not configured yet. Set RESEND_API_KEY and RESEND_FROM, or use real Gmail SMTP credentials.'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `LingoEnglish <${smtpUser}>`,
      to: email,
      subject: 'Your registration confirmation',
      html: `
        <h2>Thanks for registering, ${name || 'there'}!</h2>
        <p>We received your ${accountType || 'account'} request.</p>
        <p>This is a confirmation email to let you know your message was received.</p>
        <p>We will be in touch soon.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: `Confirmation email sent to ${email}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Email could not be sent: ${error.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
