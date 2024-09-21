import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { SSL } from "./ssl";
import { AppDataSource, CertbotPath, NginxConfigPath } from "..";
import { PhpConfig } from "./php";
import child_process from "child_process";
import { Domain } from "./domain";
import fs from "fs";
import path from "path";

@Entity()
export class Host {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => User, (user) => user.domains)
  user!: User;
  @ManyToOne(() => Domain, (domain) => domain.nginxConfig)
  // must always have the same domain at the index 0 and the same user
  domains!: Domain[];
  @OneToOne(() => SSL, (ssl) => ssl.host, { nullable: true })
  SSL!: SSL;
  @OneToOne(() => PhpConfig, (php) => php.Domain, { nullable: true })
  Php!: PhpConfig;
  @ManyToOne(() => ReverseProxy, (reverseProxy) => reverseProxy.host)
  ReverseProxies!: ReverseProxy[];
  @OneToMany(() => ErrorCodePage, (errorCodePage) => errorCodePage.host)
  ErrorCodePages!: ErrorCodePage[];
  @OneToMany(() => Redirect, (redirect) => redirect.host)
  Redirects!: Redirect[];

  save() {
    AppDataSource.manager.save(this);
  }
  static ValidName(name: string): boolean {
    const url = new URL(name);
    return url.hostname === name;
  }
  buildNginxConfig(): string {
    return "";
  }
  root() {
    return path.join(this.user.root(), this.domains[0].name);
  }
  assert() {
    if (!this.user) throw new Error("No user found");
    const base_domain = this.domains[0];
    const required_paths = [this.root()];
    for (const required_path of required_paths) {
      if (!fs.existsSync(required_path)) {
        fs.mkdirSync(required_path);
      }
    }
  }
  writeConfig() {
    const config = this.buildNginxConfig();
    const config_path = path.join(NginxConfigPath, this.domains[0].name);
    fs.writeFileSync(config_path, config);
  }
  requestSSL(user: User): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.SSL) {
        throw new Error("SSL already requested");
      }

      var logs = Buffer.from("");
      const proc = child_process.spawn(CertbotPath, [
        "certonly",
        "--webroot",
        "-w",
        this.root(),
        this.domains.map((domain) => `-d ${domain.name}`).join(" "),
        "--agree-tos",
        "--email",
        user.email,
      ]);
      proc.stdout.on("data", (data) => {
        logs = Buffer.concat([logs, data]);
      });
      proc.stderr.on("data", (data) => {
        logs = Buffer.concat([logs, data]);
      });
      proc.on("close", (code) => {
        if (code != 0) {
          reject(logs.toString());
        } else {
          resolve(logs.toString());
        }
        var ssl = new SSL();
        ssl.host = this;
        ssl.ExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        console.log(`Ssl expire ${ssl.ExpiresAt}`);
        ssl.save();
      });
    });
  }
}
@Entity()
export class ReverseProxy {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column({ nullable: true })
  Path!: string;
  @Column()
  Target!: string;
  @ManyToOne(() => Host, (host) => host.ReverseProxies)
  host!: Host;
}

@Entity()
export class ErrorCodePage {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  Code!: number;
  @ManyToOne(() => Host, (host) => host.ErrorCodePages)
  host!: Host;
  @Column()
  Page!: string;
}
@Entity()
export class Redirect {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  Path!: string;
  @Column()
  Target!: string;
  @ManyToOne(() => Host, (host) => host.Redirects)
  host!: Host;
}
