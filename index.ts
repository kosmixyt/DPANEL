import express from "express";
import session from "express-session";
import { DataSource } from "typeorm";
import { User } from "./engine/user";
import { Host } from "./engine/host";
import { SSL } from "./engine/ssl";
import { PhpConfig } from "./engine/php";
import { Container } from "./engine/container";
import { Domain } from "./engine/domain";
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
  entities: [User, Host, SSL, PhpConfig, Container, Domain],
  username: "root",
  password: "",
  database: "dpanel",
});
export const UserData = "C:/Users/flocl/dpanel/data/";

AppDataSource.initialize().then(async () => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  if (!User.getById(1)) {
    const user = await new User("admin").Init();
  }
});
