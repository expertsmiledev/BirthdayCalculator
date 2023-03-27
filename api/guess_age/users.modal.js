import mongoose from "mongoose";
const { Schema } = mongoose;

const usersSchema = Schema(
  {
    type: String,
    social_media_id: { type: String },
    email: String,
    first_name: String,
    last_name: String,
    password: String,
    verification_no: Number,
    is_verify: Boolean,
  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("users", usersSchema);
