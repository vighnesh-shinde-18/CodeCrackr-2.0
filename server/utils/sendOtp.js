import nodemailer from 'nodemailer'
export default async function sendOtp(email,otp) {


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"CodeCrackr Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
    });
}