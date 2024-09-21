import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { SSL } from "./ssl";
import { AppDataSource } from "..";
import { PhpConfig } from "./php";
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
  @OneToMany(() => ReverseProxy, (reverseProxy) => reverseProxy.host)
  ReverseProxies!: ReverseProxy[];

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
  assert() {
    if (!this.user) throw new Error("No user found");
    const base_domain = this.domains[0];
    const html_path = path.join(this.user.root(), base_domain.name);
    const required_paths = [html_path];
    for (const required_path of required_paths) {
      if (!fs.existsSync(required_path)) {
        fs.mkdirSync(required_path);
      }
    }
  }
}
@Entity()
class ReverseProxy {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column({ nullable: true })
  Path!: string;
  @Column()
  Target!: string;
  @ManyToOne(() => Host, (host) => host.ReverseProxies)
  host!: Host;
}
