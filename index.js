import express from "express";
import cors from "cors";
import { connect } from "./db.js";
import setupMiddware from "./middlewares/index.js";
import { restRouter } from "./api/restRouter.js";
import ejs from "ejs";
// import { path } from "express/lib/application";

const app = express();
setupMiddware(app);
app.use(cors());
connect();

app.get("/", (req, res) => {
  res.send("Backend is working");
});
app.use("/api", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Authorization, Accept, Access-Control-Al" +
      "low-Methods"
  );
  res.header("X-Frame-Options", "deny");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});
app.use("/api", restRouter);
// app.use('/files', express.static('/files'))
app.use("/files", express.static("files"));
app.use("/public", express.static("public"));
// view engine setup
app.set("/view", express.static("views"));
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.get("/countdown", (req, res, next) => {
  res
    .set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    )
    .render("index", { date: "22", month: "02" });
});
// privacy policy
app.get("/privacy-policy", (req, res) => {
  res.render("policy");
});
app.get("/countdownnew", (req, res, next) => {
  res
    .set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    )
    .render("main", { date: "22", month: "02" });
});
app.get("/countdownsimple", (req, res, next) => {
  res
    .set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    )
    .render("simple", { date: "22", month: "02" });
});
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
  try {
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.log("Server init error", err);
  }
});
