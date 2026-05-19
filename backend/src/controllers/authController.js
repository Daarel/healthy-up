import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

/**
 * @desc    Sign up user account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "Email is already registered",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: name,
          email: email,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error at register", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Sign in user account
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email and password " });
    }

    // verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email and password" });
    }

    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: email,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error at login", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * @desc    log out user account
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(),
    });

    res.status(200).json({
      status: "success",
      message: "logged out successfully",
    });
  } catch (err) {
    console.error("Error at logged out", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Request OTP for password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    // 4. Simpan ke database (Upsert: Timpa yang lama kalau ada, atau buat baru)
    await prisma.otpCode.upsert({
      where: { email: email },
      update: {
        code: otpCode,
        expiresAt: expiresAt,
      },
      create: {
        email: email,
        code: otpCode,
        expiresAt: expiresAt,
      },
    });

    console.log(`[SIMULASI EMAIL] OTP untuk ${email} adalah: ${otpCode}`);

    res.status(200).json({
      status: "success",
      message: "OTP has been sent to your email (expires in 1 minute)",
    });
  } catch (err) {
    console.error("Error at forgotPassword", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmedPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmedPassword) {
      return res.status(400).json({
        status: "error",
        message: "ALl fields are required",
      });
    }

    if (newPassword !== confirmedPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    const otpRecord = await prisma.otpCode.findUnique({
      where: { email: email },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or missing OTP" });
    }

    if (otpRecord.code !== otp) {
      return res
        .status(400)
        .json({ status: "error", message: "Incorrect OTP code" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        status: "error",
        message: "OTP has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword },
      }),

      prisma.otpCode.delete({
        where: { email: email },
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Password has successfully changed",
    });
  } catch (err) {
    console.error("Error at resetPassword", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { register, login, logout, forgotPassword, resetPassword };
