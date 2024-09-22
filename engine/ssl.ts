import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { AppDataSource } from "..";
import { Host } from "./host";
import { Domain } from "./domain";
import path from "path";

@Entity()
export class SSL {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  CreatedAt: Date = new Date();
  @Column()
  ForceHttps!: boolean;
  @Column()
  ExpiresAt: Date = new Date();
  @OneToOne(() => Host, (host) => host.SSL)
  host!: Host;
  @ManyToOne(() => Domain, (user) => user.ssl)
  domains!: Domain[];
  constructor() {}
  static create(domains: Host[], user: User): SSL {
    return new SSL();
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
  fullchain() {
    if (!this.host) throw new Error("No host found");
    if (!this.host.user) throw new Error("No user found");
    return path.join(this.host.user.ssl(), `${this.host.firstDomain().name}_fullchain.pem`);
  }
  privkey() {
    if (!this.host) throw new Error("No host found");
    if (!this.host.user) throw new Error("No user found");
    return path.join(this.host.user.ssl(), `${this.host.firstDomain().name}_privkey.pem`);
  }
}
