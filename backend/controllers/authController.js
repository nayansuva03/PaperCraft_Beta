import User from "../mongodb/users.js";
import OTP from "../mongodb/OTP.js";
import generateOTP from "../utils/generateOTP.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import setAuthCookies from "../utils/setAuthCookies.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    let { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    name = name.trim();
    email = email.trim().toLowerCase();
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This Email already registered.",
      });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await sendEmail({
      to: email,
      subject: "PaperCraft Email Verification",
      html: `
    <h2>Welcome to PaperCraft!</h2>
    <p>Your verification code is:</p>
    <h1 style="letter-spacing:5px;">${otp}</h1>
    <p>This code will expire in <strong>5 minutes</strong>.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `,
    });
    return res.status(200).json({
      success: true,
      message: "OTP is Created and Sent Successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifySignupOTP = async (req, res) => {
  try {
    let formData = req.body.formData;
    let { otp } = req.body;

    if (!formData || !otp) {
      return res.status(400).json({
        success: false,
        message: "OTP are required.",
      });
    }
    let email = formData.email.trim().toLowerCase();
    otp = otp.trim();
    const otpDoc = await OTP.findOne({ email });

    if (!otpDoc) {
      return res.status(404).json({
        success: false,
        message: "OTP not found or expired.",
      });
    }
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }
    if (otpDoc.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }
    const hashedPassword = await bcrypt.hash(formData.password, 10);
    const newUser = await User.create({
      name: formData.name,
      email: formData.email,
      password: hashedPassword,
      isVerified: true,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setAuthCookies(res, accessToken, refreshToken);
    await OTP.deleteOne({ _id: otpDoc._id });

    return res.status(201).json({
      success: true,
      message: "New User Created.",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please Enter Email.",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The Email Doesn't exist.",
      });
    }
    await OTP.deleteMany({ email });
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await sendEmail({
      to: email,
      subject: "PaperCraft Email Verification",
      html: `
    <h2>Reset Password request from PaperCraft!</h2>
    <p>Your verification code is:</p>
    <h1 style="letter-spacing:5px;">${otp}</h1>
    <p>This code will expire in <strong>5 minutes</strong>.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `,
    });
    return res.status(200).json({
      success: true,
      message: "OTP is Created and Sent Successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyForgotOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "OTP and Email Reqired.",
      });
    }
    const trueOTP = await OTP.findOne({ email });
    if (new Date() > trueOTP.expiresAt) {
      await OTP.deleteOne({ _id: trueOTP._id });
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired." });
    }
    if (trueOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    trueOTP.verified = true;
    await trueOTP.save();
    return res.status(200).json({
      success: true,
      message: "OTP verifyed Successfully.",
    });
  } catch (error) {
    console.error(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    const verifiedOtp = await OTP.findOne({ email, verified: true });
    if (!verifiedOtp) {
      return res
        .status(403)
        .json({ success: false, message: "OTP verification required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );
    await OTP.deleteMany({ email });
    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully.",
    });
  } catch (error) {
    console.error(error);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found. Please log in again.",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }
    const newAccessToken = generateAccessToken(user);

    setAuthCookies(res, newAccessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
    });
  } catch (error) {
     console.error(error);

     return res.status(401).json({
       success: false,
       message: "Invalid or expired refresh token.",
     });
  }
};
