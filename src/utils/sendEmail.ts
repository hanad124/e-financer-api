import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sendEmail = async ({
  user,
  emailType,
  props,
}: {
  user: any;
  emailType: string;
  props?: any;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: process.env.SEND_EMAIL,
        pass: process.env.PASS_KEY,
      },
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const salt = await bcrypt.genSalt(10);
    // const hashedOtp = await bcrypt.hash(otp, salt);

    await prisma.oTP.create({
      data: {
        otp: otp,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    let emailContent = "";
    let mailOptions = {};

    if (emailType == "verifyemail") {
      emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background: #6957E7; padding: 30px; text-align: center;">
            <h1 style="color: #fff; letter-spacing: 0.2rem; font-size: 2rem; margin: 0;">
              e-Financer 
            </h1>
          </div>
          <div style="padding: 40px;">
            <p style="text-align: center; color: #333; font-size: 16px;">Hi ${user.name},</p>
            <h2 style="text-align: center; color: #333; margin-bottom: 20px;">
              Verify Your Email Address
            </h2>
            <p style="text-align: center; color: #666; font-size: 16px; line-height: 1.5;">
              Please use the following One-Time Password (OTP) to verify your email address:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #f0f0f0; padding: 15px 30px; border-radius: 5px;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #6957E7;">
                  ${otp}
                </span>
              </div>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              Regards,<br>The e-Financer Team
            </p>
          </div>
        </div>
      </div>
      `;

      mailOptions = {
        from: process.env.SEND_EMAIL,
        to: user.email,
        subject: "Verify Your Email Address",
        html: emailContent,
      };
    } else if (emailType == "resetpassword") {
      emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8">
      <div
        style="
          background: #6957E7;
          width: 100;
          padding: 3rem;
          border-radius: 5px 5px 0px 0px;
          text-align: center;
        "
      >
        <h1 style="color: #fff; letter-spacing: 0.2rem; font-size: 2rem">
          e-Financer
        </h1>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 5px">
        <p style="text-align: center">Hi ${user.name},</p>
        <h1 style="text-align: center; color: #333">
          Reset Your Password
        </h1>
        <p style="text-align: center; color: #333">
          Please use the following One-Time Password (OTP) to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f0f0f0; padding: 15px 30px; border-radius: 5px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #6957E7;">
              ${otp}
            </span>
          </div>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
          This OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email.
        </p>
        <p style="text-align: center; color: #333; margin-top: 2rem">
          If you did not request a password reset, no further action is required.
        </p>
        <p style="text-align: center; color: #333">
          Regards,
          <br />
          The e-Financer Team
        </p>
      </div>
    </div>`;
      mailOptions = {
        from: process.env.SEND_EMAIL,
        to: user.email,
        subject: "Reset Your Password",
        html: emailContent,
      };
    }
    // Send email when gaol is achieved
    else if (emailType == "goalAchieved") {
      // add user's name and goal amount and the saved amount to the email content
      emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8">
      <div
        style="
          background: #6957E7;
          width: 100;
          padding: 3rem;
          border-radius: 5px 5px 0px 0px;
          text-align: center;
        "
      >
        <h1 style="color: #fff; letter-spacing: 0.2rem; font-size: 2rem">
          e-Financer
        </h1>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 5px">
        <p style="text-align: center">Hi ${user.name},</p>
        <h1 style="text-align: center; color: #333">
          Congratulations! You have achieved your goal 
          <span style="color: #6957E7;">
             - ${props.goalName} -
          </span>
        </h1>
        <p style="text-align: center; color: #333">
          You have successfully saved <b style='color: #6957E7;'>${props.savedAmount}</b> out of your goal
          amount of <b style='color: #6957E7;'>${props.goalAmount}</b>.
        </p>

        <div style="text-align: center">
          <p style="color: #333; margin-top: 2rem">
            If you did not create an account, no further action is required.
          </p>

          <p style="color: #333">
            Regards,
            <br />
          </p>
        </div>
      `;

      mailOptions = {
        from: process.env.SEND_EMAIL,
        to: user.email,
        subject: "Congratulations! You have achieved your goal.",
        html: emailContent,
      };
    }
    // Send email when goal is not achieved
    else if (emailType == "goalNotAchieved") {
      // add user's name and goal amount and the saved amount to the email content
      emailContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8">
      <div
        style="
          background: #6957E7;
          width: 100;
          padding: 3rem;
          border-radius: 5px 5px 0px 0px;
          text-align: center;
        "
      >
        <h1 style="color: #fff; letter-spacing: 0.2rem; font-size: 2rem">
          e-Financer
        </h1>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 5px">
        <p style="text-align: center">Hi ${user.name},</p>
        <h1 style="text-align: center; color: #333">
          You have not achieved your goal 
          <span style="color: #6957E7;">
             - ${props.goalName} -
          </span>
        </h1>
        <p style="text-align: center; color: #333">
          You have saved <b style='color: #6957E7;'>${props.savedAmount}</b> out of your goal
          amount of <b style='color: #6957E7;'>${props.goalAmount}</b>.
        </p>
        <div style="text-align: center">
          <p style="color: #333; margin-top: 2rem">
            If you did not create an account, no further action is required.
          </p>

          <p style="color: #333">
            Regards,
            <br />
          </p>
        </div>
      `;

      mailOptions = {
        from: process.env.SEND_EMAIL,
        to: user.email,
        subject: "You have not achieved your goal.",
        html: emailContent,
      };
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export { sendEmail };
