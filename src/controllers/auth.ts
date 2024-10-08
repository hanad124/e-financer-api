import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail";
import { ImageUpload } from "../utils/upload";
import getUserId from "../helpers/getUserId";

const prisma = new PrismaClient();

// register
const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar:
          "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
      },
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    // send verification email
    await sendEmail({
      user: newUser,
      emailType: "verifyemail",
    });

    return res.status(201).send({
      success: true,
      message: "User created successfully, please verify your email!",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// login
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required!" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      if (user.isVarified) {
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          {
            expiresIn: "7d",
          }
        );
        // exclude password
        user.password = "";

        return res.json({
          success: true,
          message: "Login successful",
          user: {
            ...user,
            token,
          },
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Please verify your email!" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentails!" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get user by id
const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        description: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// send verify email link
const verifyEmailLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      if (!user.isVarified) {
        await sendEmail({
          user: user,
          emailType: "verifyemail",
        });

        return res.json({
          success: true,
          message: `Verification email sent to: ${email}`,
        });
      } else {
        return res.json({
          success: false,
          message: `Email already verified!`,
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: `Account with email : ${email} does not exists.`,
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: error.message,
    });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  const { otp } = req.body;

  console.log("otp", otp);

  try {
    // compare the otp
    // const isOTPValid = await bcrypt.compare(otp, user.password);

    const user = await prisma.user.findFirst({
      where: {
        otps: {
          some: {
            otp: otp as string,
          },
        },
      },
    });

    console.log("user", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVarified: true,
      },
    });

    // Delete OTP
    await prisma.oTP.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying email:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// send password reset link
const sendPasswordResetLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ succuess: false, message: "User not found!" });
    }

    console.log("--user--", user);

    await sendEmail({
      user: user,
      emailType: "resetpassword",
    });

    return res.json({
      success: true,
      message: `Password reset link sent to your email: ${email}`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// reset password
const resetPassword = async (req: Request, res: Response) => {
  const { otp, password } = req.body;

  if (!otp || !password) {
    return res
      .status(400)
      .json({ success: false, message: "OTP and password are required!" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        otps: {
          some: {
            otp,
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      // delete OTP
      await prisma.oTP.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return res.json({
        success: true,
        message: "Password reset successfully!",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired OTP!",
      });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// update password
const updatePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required!",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (isPasswordValid) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          id: userid,
        },
        data: {
          password: hashedPassword,
        },
      });

      return res.json({
        success: true,
        message: "Password updated successfully!",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid old password!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// update profile
const updateProfile = async (req: Request, res: Response) => {
  const { name, avatar, description } = req.body;

  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userId = (decoded as any).id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // Upload image to cloudinary
    // only take if the avatar is not empty or is base64
    let avatarUrl = user.avatar;
    if (avatar && avatar !== user.avatar) {
      const image = await ImageUpload(avatar);
      avatarUrl = image;
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        avatar: avatarUrl,
        description,
        // email,
      },
    });

    return res.json({
      success: true,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: `Internal server error: ${error}` });
  } finally {
    await prisma.$disconnect();
  }
};

// update email
const updateEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    await prisma.user.update({
      where: {
        id: userid,
      },
      data: {
        email,
        isVarified: false,
      },
    });

    return res.json({
      success: true,
      message: "Email updated successfully, please verify your email!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// get user info
const getUserInfo = async (req: Request, res: Response) => {
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        description: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const savePushToken = async (req: Request, res: Response) => {
  const { expoPushToken } = req.body;
  const userId = getUserId(req);

  console.log("push token", expoPushToken);

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        expoPushToken: expoPushToken as string,
      },
    });

    return res.json({
      success: true,
      message: "Push token saved successfully!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export {
  register,
  getUserById,
  login,
  verifyEmailLink,
  verifyOTP,
  sendPasswordResetLink,
  resetPassword,
  updatePassword,
  updateProfile,
  updateEmail,
  getUserInfo,
  savePushToken,
};
