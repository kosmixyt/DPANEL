import express from "express";
import session from "express-session";
import { DataSource } from "typeorm";
import { User } from "./engine/user";
import { ErrorCodePage, Host, Redirect, ReverseProxy } from "./engine/host";
import { SSL } from "./engine/ssl";
import 'dotenv/config'
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
  synchronize: true,
  port: 3306,
  entities: [User, Host, SSL, PhpConfig, Container, Domain, ReverseProxy, ErrorCodePage, Redirect, DbPermission, Database, DbUser],
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "dpanel",
});
export const UserData = "/DPANEL/data/";
export const NginxConfigPath = "/etc/nginx/sites-enabled/";
export const CertbotPath = "certbot";

AppDataSource.initialize().then(async () => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  if (!User.getById(1)) {
    const user = await new User("admin").Init();
  }
});
