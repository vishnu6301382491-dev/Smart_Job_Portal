import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const sanitizeAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  title: user.title,
  location: user.location,
  skills: user.skills,
  savedJobs: user.savedJobs,
  notificationPrefs: user.notificationPrefs,
  bio: user.bio,
  avatar: user.avatar,
  resumeUrl: user.resumeUrl,
  resumeName: user.resumeName,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, title, bio } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const normalizedRole = role === "employer" ? "employer" : "jobseeker";
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: normalizedRole,
    title,
    bio,
  });

  const token = generateToken(user._id);
  console.log(`[AUTH_REGISTER] New user registered: ${user.email} (${user._id})`);

  void sendWelcomeEmail({ user }).catch((err) => {
    console.error(`[WELCOME_EMAIL_FAILED] Target: ${user.email} | Error:`, err.message);
  });

  res.status(201).json({
    message: "Registration successful",
    token,
    user: sanitizeAuthUser(user),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    console.log(`[AUTH_LOGIN_FAILED] Invalid email attempt: ${email}`);
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    console.log(`[AUTH_LOGIN_FAILED] Invalid password attempt for: ${email}`);
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  console.log(`[AUTH_LOGIN_SUCCESS] User: ${user.email} (${user._id}) | Role: ${user.role}`);

  res.json({
    message: "Login successful",
    token,
    user: sanitizeAuthUser(user),
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    console.log(`[AUTH_LOGOUT] User: ${req.user.email} (${req.user._id})`);
  }

  res.json({
    message: "Logout successful",
  });
});

export { registerUser, loginUser, logoutUser };
