import { PrismaClient } from "@prisma/client";
import express from "express";
import session from "express-session";
const db = new PrismaClient();
const app = express();
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
