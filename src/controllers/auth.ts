import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail";

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
      },
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

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
            expiresIn: "1d",
          }
        );

        return res.json({
          success: true,
          message: "Login successful",
          token,
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
          success: true,
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

// verify email
const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: {
        tokens: {
          some: {
            token,
          },
        },
      },
    });

    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVarified: true,
        },
      });

      // delete token
      await prisma.token.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return res.json({
        success: true,
        message: "Email verified successfully!",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid token!",
      });
    }
  } catch (error) {
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
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Token and password are required!" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        tokens: {
          some: {
            token,
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

      // delete token
      await prisma.token.deleteMany({
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
        message: "Invalid token!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// update password
const updatePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.body.user?.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required!",
    });
  }

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

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (isPasswordValid) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          id: userId,
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
  const userId = req.body.user?.id;

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

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        avatar,
        description,
      },
    });

    return res.json({
      success: true,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// update email
const updateEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userId = req.body.user?.id;

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

    await prisma.user.update({
      where: {
        id: userId,
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
  const userId = req.body.user?.id;

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

    // exclude password
    user.password = "";

    return res.json(user);
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
  verifyEmail,
  sendPasswordResetLink,
  resetPassword,
  updatePassword,
  updateProfile,
  updateEmail,
  getUserInfo,
};
