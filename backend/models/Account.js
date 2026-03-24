const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      default: null,
    },
    access_token: {
      type: String,
      default: null,
    },
    expires_at: {
      type: Number,
      default: null,
    },
    token_type: {
      type: String,
      default: null,
    },
    scope: {
      type: String,
      default: null,
    },
    id_token: {
      type: String,
      default: null,
    },
    session_state: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
module.exports = mongoose.model("Account", accountSchema);
