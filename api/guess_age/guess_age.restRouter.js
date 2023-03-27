import express from "express";
import {
  guessAgeSave,
  fetchHistory,
  deleteSingleEntry,
  deleteAllEntry,
  insertUsers,
  register,
  deleteSingleUser,
  registerEmail,
  login,
  verifyUser,
  deleteUser,
  shareUrl,
  fetchReminder,
  saveReminder,
  DeleteReminder,
  deleteAllReminder,
  getSubscriptionData,
} from "./guess_age.controller.js";
import { check, query } from "express-validator";

export const guessAgeRouter = express.Router();

guessAgeRouter.post("/guessAgeSave", guessAgeSave);
guessAgeRouter.post("/register", register);
guessAgeRouter.post("/registerEmail", registerEmail);
guessAgeRouter.post("/login", login);
guessAgeRouter.get("/fetchHistory", fetchHistory);
guessAgeRouter.get("/verify", verifyUser);
guessAgeRouter.delete("/deleteSingleEntry", deleteSingleEntry);
guessAgeRouter.post("/deleteUser", deleteSingleUser);
guessAgeRouter.get("/deleteUser", deleteUser);
guessAgeRouter.delete("/deleteAllEntry", deleteAllEntry);
guessAgeRouter.post("/insertUsers", insertUsers);
guessAgeRouter.get("/shareUrl", shareUrl);
guessAgeRouter.post("/saveReminder", saveReminder);
guessAgeRouter.get("/fetchReminder", fetchReminder);
guessAgeRouter.delete("/deleteReminder", DeleteReminder);
guessAgeRouter.delete("/deleteAllReminder", deleteAllReminder);
guessAgeRouter.get("/getSubscriptionData", getSubscriptionData);
