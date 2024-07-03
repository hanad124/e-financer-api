import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
    const salt = await bcrypt.genSalt(10);
    let encryptedTokenMain = await bcrypt.hash(user.id.toString(), salt);
    let encryptedToken = "";

    for (var i = 0; i < encryptedTokenMain.length; i++) {
      if (encryptedTokenMain[i] !== "/") {
        encryptedToken += encryptedTokenMain[i];
      } else {
        continue;
      }
    }

    await prisma.token.create({
      data: {
        token: encryptedToken,
        userId: user.id,
      },
    });

    let emailContent = "";
    let mailOptions = {};

    if (emailType == "verifyemail") {
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
          Verify Your Email Address
        </h1>
        <p style="text-align: center; color: #333">
          Please click on the button below to verify your email address.
        </p>
        <div style="text-align: center">
          <a
            href="
                       https://expense-tracker-client-funs.onrender.com/verifyemail/${encryptedToken}
                      "
            style="
              display: inline-block;
              padding: 16px 50px;
              background-color: #6957E7;
              color: #ffffff;
              text-decoration: none;
              border-radius: 50px;
              margin-top: 2rem;
            "
          >
            Verify Email
          </a>

          <p style="color: #333; margin-top: 2rem">
            If you did not create an account, no further action is required.
          </p>

          <p style="color: #333">
            Regards,
            <br />
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
    } else if (emailType == "forgotpassword") {
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
          Please click on the button below to reset your password.
        </p>
        <div style="text-align: center">
          <a
            href="
                        https://expense-tracker-client-funs.onrender.com/resetpassword/${encryptedToken}
                      "
            style="
              display: inline-block;
              padding: 16px 50px;
              background-color: #6957E7;
              color: #ffffff;
              text-decoration: none;
              border-radius: 50px;
              margin-top: 2rem;
            "
          >
            Reset Password
          </a>

          <p style="color: #333; margin-top: 2rem">
            If you did not create an account, no further action is required.
          </p>

          <p style="color: #333">
            Regards,
            <br />
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
