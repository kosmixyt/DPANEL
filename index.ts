import express from "express";
import session from "express-session";
import { DataSource } from "typeorm";
import { User } from "./engine/user";
import { ErrorCodePage, Host, Redirect, ReverseProxy } from "./engine/host";
import { SSL } from "./engine/ssl";
import { PhpConfig } from "./engine/php";
import { Container } from "./engine/container";
import { Domain } from "./engine/domain";
import { DbPermission } from "./engine/db/rights";
import { Database } from "./engine/db/db";
import { DbUser } from "./engine/db/user";
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
  entities: [User, Host, SSL, PhpConfig, Container, Domain, ReverseProxy, ErrorCodePage, Redirect, DbPermission, Database, DbUser],
  username: "root",
  password: "",
  database: "dpanel",
});
export const UserData = "C:/Users/flocl/dpanel/data/";
export const NginxConfigPath = "C:/Users/flocl/dpanel/nginx/";
export const CertbotPath = "C:/Users/flocl/dpanel/certbot/certbot.exe";

AppDataSource.initialize().then(async () => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  if (!User.getById(1)) {
    const user = await new User("admin").Init();
  }
});
