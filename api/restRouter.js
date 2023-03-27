import express from "express";
import { guessAgeRouter } from "./guess_age/guess_age.restRouter.js"

export const restRouter = express.Router();
restRouter.use('/guessAge', guessAgeRouter)