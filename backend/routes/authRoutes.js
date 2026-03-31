const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      hashedPassword,
    });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/current-user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ user: null, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ user: null, message: "User not found" });
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ user: null, message: "Invalid token" });
  }
});

router.get("/github", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user user:email",
    state,
  });
  return res.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
});

router.get("/github/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const githubAccessToken = tokenResponse.data.access_token;

    if (!githubAccessToken) {
      return res
        .status(400)
        .json({ message: "Failed to get GitHub access token" });
    }

    const githubUserResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    const githubEmailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    const githubUser = githubUserResponse.data;
    const primaryEmailObject = githubEmailsResponse.data.find(
      (emailObj) => emailObj.primary && emailObj.verified,
    );

    const email = primaryEmailObject?.email;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No verified primary email found" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email,
        image: githubUser.avatar_url || "",
        hashedPassword: "",
      });
    }

    const appToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    console.log(
      "redirecting to:",
      `${process.env.FRONTEND_URL}?token=${appToken}`,
    );
    return res.redirect(`${process.env.FRONTEND_URL}#token=${appToken}`);
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    return res.status(500).json({ message: "GitHub authentication failed" });
  }
});

router.get("/google", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  console.log("GOOGLE_REDIRECT_URI from env:", process.env.GOOGLE_REDIRECT_URI);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const googleUrl = `${rootUrl}?${params.toString()}`;
  console.log("GOOGLE URL:", googleUrl);

  return res.redirect(googleUrl);
});

router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: "No code provided from google" });
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      tokenParams.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const googleAccessToken = tokenResponse.data.access_token;

    if (!googleAccessToken) {
      return res.status(400).json({
        message: "Failed to get Google access token",
        details: tokenResponse.data,
      });
    }

    const googleUserResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      },
    );

    const googleUser = googleUserResponse.data;

    if (!googleUser.email) {
      return res.status(400).json({
        message: "No email found in Google user data",
      });
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = User.create({
        name: googleUser.name || googleUser.given_name || "Google User",
        email: googleUser.email,
        image: googleUser.picture || "",
        hashedPassword: "",
      });
    }

    const appToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log(
      "redirecting to:",
      `${process.env.FRONTEND_URL}#token=${appToken}`,
    );

    return res.redirect(`${process.env.FRONTEND_URL}#token=${appToken}`);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;
