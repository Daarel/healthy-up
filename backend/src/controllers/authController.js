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

export { register, login, logout };
