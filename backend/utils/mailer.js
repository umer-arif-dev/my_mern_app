const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"Umer arif" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = sendEmail;
