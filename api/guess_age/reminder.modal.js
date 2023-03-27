import mongoose from "mongoose";
const { Schema } = mongoose;

const reminderSchema = Schema(
  {
    user_id: String,
    name: String,
    fullDate: String,
    date: String,
    month: String,
    year: String,
  },
  {
    timestamps: true,
  }
);

export const Reminder = mongoose.model("reminder", reminderSchema);
