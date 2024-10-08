import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { SSL } from "./ssl";
import { AppDataSource, CertbotPath, NginxConfigPath } from "..";
import { PhpConfig } from "./php";
import * as child_process from "child_process";
import { Domain } from "./domain";
import * as fs from "fs";
import * as path from "path";
import { BuildConfig, ReloadConfig, ValidateConfig } from "./os/nginx";
import { Container } from "./container";

@Entity()
export class Host {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => User, (user) => user.domains)
  @Column()
  allowDirectoryListing!: boolean;
  @Column()
  indexes!: string;
  @ManyToOne(() => Domain, (domain) => domain.nginxConfig)
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
  @Column()
  Gzip!: boolean;
  @Column()
  GzipTypes!: string;
  @Column()
  GzipLevel!: number;
  @Column()
  GzipMinLength!: number;
  @Column()
  MaxBodySize!: number;

  async save() {
    await AppDataSource.manager.save(this);
  }
  defaultConfig() {
    this.indexes = "index.html index.htm index.php";
    this.allowDirectoryListing = false;
  }
  static ValidName(name: string): boolean {
    const url = new URL(name);
    return url.hostname === name;
  }
  firstDomain(): Domain {
    return this.domains[0];
  }
  buildNginxConfig(): string {
    return BuildConfig(this, this.getUser());
  }
  root() {
    return path.join(this.getUser().root(), this.firstDomain().name);
  }
  assert() {
    if (!this.firstDomain().user) throw new Error("No user found");
    const base_domain = this.domains[0];
    const required_paths = [this.root()];
    for (const required_path of required_paths) {
      if (!fs.existsSync(required_path)) {
        fs.mkdirSync(required_path);
      }
    }
    for (const domain of this.domains) {
      if (domain.user.id != this.getUser().id) {
        throw new Error("All domains must belong to the same user");
      }
    }
  }
  getUser() {
    return this.firstDomain().user;
  }
  async ensurePreloaded(relations: string[]) {}
  async writeConfig(rollbackConfig?: string) {
    const config = this.buildNginxConfig();
    fs.writeFileSync(this.configPath(), config);
    if (!ValidateConfig(this, this.getUser())) {
      if (rollbackConfig) {
        fs.writeFileSync(this.configPath(), rollbackConfig);
        if (!ValidateConfig(this, this.getUser())) {
          console.log("Rollback failed");
          process.exit(100);
        }
        await ReloadConfig();
      }
      throw new Error("Invalid config");
    }
    await ReloadConfig();
  }
  IsRunning() {
    return fs.existsSync(path.join(NginxConfigPath, this.firstDomain().name));
  }
  configPath() {
    return path.join(NginxConfigPath, this.firstDomain().name);
  }
  requestSSL(user: User): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.SSL) {
        throw new Error("SSL already requested");
      }
      if (!this.IsRunning()) {
        throw new Error("Host is not running (must have a nginx config to request ssl)");
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
        ssl.domains = this.domains;
        ssl.ExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        console.log(`Ssl expire ${ssl.ExpiresAt}`);
        fs.copyFileSync(`/etc/letsencrypt/live/${this.firstDomain().name}/fullchain.pem`, ssl.fullchain());
        fs.copyFileSync(`/etc/letsencrypt/live/${this.firstDomain().name}/privkey.pem`, ssl.privkey());
        ssl.save();
        this.writeConfig();
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
  @Column()
  Timeout!: number;
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
