import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { SSL } from "./ssl";
import { AppDataSource } from "..";
import { PhpConfig } from "./php";
import { Domain } from "./domain";

@Entity()
export class Host {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => User, (user) => user.domains)
  user!: User;
  @ManyToOne(() => Domain, (domain) => domain.nginxConfig)
  // must always have the same domain at the index 0
  domains!: Domain[];
  @ManyToMany(() => SSL, (ssl) => ssl.domains, { nullable: true })
  ssl!: SSL;
  @OneToOne(() => PhpConfig, (php) => php.Domain, { nullable: true })
  Php!: PhpConfig;
  save() {
    AppDataSource.manager.save(this);
  }
  static ValidName(name: string): boolean {
    const url = new URL(name);
    return url.hostname === name;
  }
  buildNginxConfig(): string {
    if (!this.ssl) throw new Error("No SSL certificate found");
    return "";
  }
  assert() {
    if (!this.user) throw new Error("No user found");
  }
}
