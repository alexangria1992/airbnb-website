const express = require("express");
const Account = require("../models/Account");

const router = express.Router();

router.post("/test-account", async (req, res) => {
  try {
    const account = await Account.create({
      userId: req.body.userId,
      type: req.body.type,
      provider: req.body.provider,
      providerAccountId: req.body.providerAccountId,
      refresh_token: req.body.refresh_token || null,
      access_token: req.body.access_token || null,
      expires_at: req.body.expires_at || null,
      token_type: req.body.token_type || null,
      scope: req.body.scope || null,
      id_token: req.body.id_token || null,
      session_state: req.body.session_state || null,
    });

    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
