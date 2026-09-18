import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

export default generateRefreshToken;
