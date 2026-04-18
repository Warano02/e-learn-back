const { sendMail } = require('../../config/mailer');

const sendConfirmationEmail = async (user, token) => {
    const confirmUrl = `${process.env.CLIENT_URL}/auth/confirm-email?token=${token}`;

    await sendMail({
        to: user.email,
        subject: 'Confirm your account',
        html: `
      <h2>Welcome, ${user.name}</h2>
      <p>Please confirm your email address by clicking the link below. This link expires in 24 hours.</p>
      <a href="${confirmUrl}" target="_blank">Confirm my account</a>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
    });
};

module.exports = { sendConfirmationEmail };