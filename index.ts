import { PrismaClient } from "@prisma/client";
import express from "express";
import session from "express-session";
import { DataSource } from "typeorm";
import { User } from "./engine/user";
import { Domain } from "./engine/domain";
import { SSL } from "./engine/ssl";
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
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  synchronize: true,
  entities: [User, Domain, SSL],
  username: "root",
  password: "",
  database: "dpanel",
});

AppDataSource.initialize().then(async () => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  const user = await new User("admin").insert();
  console.log(user.id);
});
