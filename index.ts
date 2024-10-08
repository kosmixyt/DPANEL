import * as express from "express";
import * as session from "express-session";
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
import * as dns from "dns"
import { UserRouter } from "./app/user";
const app = express();
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", UserRouter);


console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD)
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
export const PUBLIC_SERVER_IP = "82.65.99.194"

AppDataSource.initialize().then(async () => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
  if (!User.getById(1)) {
    const user = await new User("admin").Init();
  }
});
export async function Resolve4(name: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolve4(name, (err, addresses) => {
      if (err) reject(err);
      resolve(addresses);
    });
  });
}
export async function Resolve6(name: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    dns.resolve6(name, (err, addresses) => {
      if (err) reject(err);
      resolve(addresses);
    });
  });
}