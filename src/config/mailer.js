const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = async ({ to, subject, html, from = "Take All You Can" }) => {
    await transporter.sendMail({
        from,
        to,
        subject,
        html,
        replyTo: "no-reply@felix_warano.dev"
    });
};

module.exports = { sendMail };